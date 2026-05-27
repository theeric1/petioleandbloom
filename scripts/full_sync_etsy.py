import os
import json
import urllib.request
import requests
import re
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# Ensure folders exist
os.makedirs("public/images/products", exist_ok=True)
os.makedirs("src/data", exist_ok=True)

# Curated Primary Products (Removed artificial items to pull 100% from actual Etsy store)
PRIMARY_PRODUCTS = []

def clean_title(title):
    title = re.sub(r'\s+by\s+PetioleAndBloomLLC$', '', title, flags=re.IGNORECASE)
    # Strip Etsy metadata in listing page titles if any
    title = title.split(' | ')[0]
    title = title.split(' - ')[0]
    title = title.replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    return title.strip()

def download_image(url, filename):
    filepath = os.path.join("public/images/products", filename)
    if os.path.exists(filepath):
        print(f"  Image {filename} already exists. Skipping download.")
        return f"/images/products/{filename}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(r.content)
            print(f"  Successfully downloaded image: {filename}")
            return f"/images/products/{filename}"
        else:
            print(f"  Failed to download image: {filename}. Status: {r.status_code}")
    except Exception as e:
        print(f"  Error downloading image {url}: {e}")
    return url

def scrape_full_etsy_catalog():
    shop_url = "https://www.etsy.com/shop/PetioleAndBloomLLC"
    scraped_products = []
    
    with sync_playwright() as p:
        print("\n--- LAUNCHING VISIBLE CHROMIUM BROWSER ---")
        print("This visible window allows you to bypass Etsy's anti-bot protection manually.")
        
        # Launch browser in HEADED mode (headless=False) so the user can interact
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()
        
        print(f"Navigating to Etsy Shop: {shop_url}...")
        page.goto(shop_url, wait_until="domcontentloaded")
        
        # Pause script to let the user solve the Captcha if it appears
        print("\n" + "="*80)
        print("👉 [ACTION REQUIRED] Please solve any DataDome Captcha challenge on the browser screen.")
        print("👉 Once the Etsy shop page is fully visible, return to this terminal and press [ENTER]...")
        print("="*80)
        input("Press [ENTER] to continue...")
        
        print("\nResuming automation...")
        time.sleep(2) # Allow any pending page renders
        
        # Scroll down dynamically to trigger lazy-loading of all cards
        print("Scrolling down to reveal all listings...")
        for _ in range(5):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1)
            
        content = page.content()
        soup = BeautifulSoup(content, 'html.parser')
        
        # Find all product listing links
        listing_urls = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '/listing/' in href:
                # Extract clean URL (remove query parameters)
                clean_href = href.split('?')[0]
                if clean_href not in listing_urls:
                    listing_urls.append(clean_href)
                    
        print(f"Found {len(listing_urls)} active product listing links on your Etsy shop front.")
        
        # Now, sequentially visit each listing page to scrape high-fidelity details
        for i, url in enumerate(listing_urls):
            print(f"\n[{i+1}/{len(listing_urls)}] Scraping Listing: {url}")
            
            try:
                # Clean up ID
                listing_id_match = re.search(r'/listing/(\d+)', url)
                if not listing_id_match:
                    continue
                listing_id = listing_id_match.group(1)
                
                # Navigate to the product page
                page.goto(url, wait_until="domcontentloaded")
                time.sleep(2) # Allow page scripts to run
                
                listing_content = page.content()
                l_soup = BeautifulSoup(listing_content, 'html.parser')
                
                # Title
                title_tag = l_soup.find('h1', class_=re.compile(r'title', re.IGNORECASE))
                if not title_tag:
                    title_tag = l_soup.find('h1')
                title = clean_title(title_tag.text) if title_tag else "Etsy Specimen"
                
                # Price
                price_tag = l_soup.find('p', class_=re.compile(r'price', re.IGNORECASE))
                if not price_tag:
                    price_tag = l_soup.find('div', class_=re.compile(r'price', re.IGNORECASE))
                
                price_val = 0.0
                original_price = ""
                if price_tag:
                    original_price = price_tag.text.strip()
                    # Clean up price (Etsy lists prices like "$24.99" or "USD 24.99")
                    price_match = re.search(r'([\d\.]+)', original_price)
                    if price_match:
                        price_val = float(price_match.group(1))
                        
                if price_val == 0.0:
                    # Fallback to general text search for price
                    price_meta = l_soup.find('meta', property='custom-etsy-price')
                    if price_meta:
                        price_val = float(price_meta['content'])
                    else:
                        price_val = 24.99 # Default fallback
                
                # Full Description
                desc_div = l_soup.find('div', id='listing-page-description-read-more')
                if not desc_div:
                    desc_div = l_soup.find('p', id='description-text')
                if not desc_div:
                    desc_div = l_soup.find('div', class_=re.compile(r'description', re.IGNORECASE))
                    
                description_text = ""
                if desc_div:
                    # Keep text lines and linebreaks
                    lines = [line.strip() for line in desc_div.stripped_strings]
                    description_text = "\n".join(lines)
                else:
                    description_text = "Lush botanical specimen. Hand-propagated and established in deep biologically active mycorrhizal soil. Ships with detailed care package."
                
                # Image
                # Find main listing image
                main_img = l_soup.find('img', class_=re.compile(r'carousel-image|main-image|image', re.IGNORECASE))
                if not main_img:
                    # Let's search inside the product photo carousel
                    carousel = l_soup.find('div', class_=re.compile(r'carousel', re.IGNORECASE))
                    if carousel:
                        main_img = carousel.find('img')
                if not main_img:
                    main_img = l_soup.find('img', src=re.compile(r'etsystatic\.com/.*il_'))
                
                img_url = ""
                if main_img and main_img.has_attr('src'):
                    img_url = main_img['src']
                elif main_img and main_img.has_attr('data-src'):
                    img_url = main_img['data-src']
                    
                # If we got the small image, we can scale it up by replacing the resolution code
                if img_url:
                    # E.g. replace il_75x75 with il_794xN
                    img_url = re.sub(r'il_\d+x\d+', 'il_794xN', img_url)
                    img_url = re.sub(r'il_\d+xN', 'il_794xN', img_url)
                    
                # Download image locally
                local_image_path = ""
                if img_url:
                    image_filename = f"{listing_id}.jpg"
                    local_image_path = download_image(img_url, image_filename)
                else:
                    local_image_path = "/images/products/placeholder.jpg"
                
                # Product object
                product_obj = {
                    "id": f"etsy-{listing_id}",
                    "title": title,
                    "price": price_val,
                    "originalPrice": f"{price_val:.2f} USD",
                    "description": description_text,
                    "image": local_image_path,
                    "link": f"https://petioleandbloomllc.etsy.com/listing/{listing_id}",
                    "category": "Plants",
                    "rating": 5.0,
                    "inStock": True,
                    "isFeatured": False
                }
                
                scraped_products.append(product_obj)
                print(f"  Successfully scraped: {title} (${price_val})")
                
            except Exception as e:
                print(f"  Error scraping listing {url}: {e}")
                
        browser.close()
        
    return scraped_products

def main():
    print("--- Starting Heavy Playwright Etsy Synchronizer ---")
    start_time = time.time()
    
    try:
        etsy_products = scrape_full_etsy_catalog()
    except Exception as e:
        print(f"Playwright Scraping failed: {e}. Falling back to standard list.")
        etsy_products = []
        
    # Unified list
    all_products = []
    
    # 1. Add primary peptide products
    all_products.extend(PRIMARY_PRODUCTS)
    print(f"Added {len(PRIMARY_PRODUCTS)} primary peptide products.")
    
    # 2. Add scraped Etsy products (remove duplicates if any)
    existing_ids = {p["id"] for p in all_products}
    added_count = 0
    for p in etsy_products:
        if p["id"] not in existing_ids:
            all_products.append(p)
            existing_ids.add(p["id"])
            added_count += 1
            
    print(f"Added {added_count} unique scraped Etsy products.")
    
    # Write to data file
    output_path = "src/data/products.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
        
    duration = time.time() - start_time
    print(f"Successfully generated product catalog at {output_path}!")
    print(f"Total products in catalog: {len(all_products)}")
    print(f"Sync duration: {duration:.2f} seconds")

if __name__ == "__main__":
    main()

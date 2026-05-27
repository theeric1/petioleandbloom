import os
import json
import urllib.request
import requests
from bs4 import BeautifulSoup
import re
import csv

# Ensure folders exist
os.makedirs("public/images/products", exist_ok=True)
os.makedirs("src/data", exist_ok=True)

PRIMARY_PRODUCTS = []

def clean_title(title):
    title = re.sub(r'\s+by\s+PetioleAndBloomLLC$', '', title, flags=re.IGNORECASE)
    return html_unescape(title)

def html_unescape(text):
    return urllib.parse.unquote(text).replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&#39;', "'")

def clean_html_desc(html_content):
    if not html_content:
        return ""
    text = html_unescape(html_content)
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'</p>', '\n\n', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def download_image(url, filename):
    filepath = os.path.join("public/images/products", filename)
    if os.path.exists(filepath):
        print(f"  Image {filename} already exists. Skipping download.")
        return f"/images/products/{filename}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
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

def fetch_shopify_products():
    url = "https://petioleandbloom.com/products.json"
    products = []
    try:
        print(f"Fetching Shopify products: {url}...")
        r = requests.get(url, timeout=15)
        if r.status_code == 200:
            data = r.json()
            for prod in data.get('products', []):
                price_val = 0.0
                if prod.get('variants') and len(prod['variants']) > 0:
                    try:
                        price_val = float(prod['variants'][0]['price'])
                    except:
                        pass
                
                img_url = ""
                if prod.get('images') and len(prod['images']) > 0:
                    img_url = prod['images'][0]['src']
                
                local_image_path = "/images/products/placeholder.jpg"
                if img_url:
                    image_filename = f"shopify-{prod['id']}.jpg"
                    local_image_path = download_image(img_url, image_filename)

                products.append({
                    "id": f"shopify-{prod['id']}",
                    "title": prod['title'],
                    "price": price_val,
                    "originalPrice": f"{price_val} USD",
                    "description": clean_html_desc(prod.get('body_html', '')),
                    "image": local_image_path,
                    "link": f"https://petioleandbloom.com/products/{prod['handle']}",
                    "category": "Plants" if "plant" in prod['title'].lower() or "musa" in prod['title'].lower() else "Serums",
                    "rating": 5.0,
                    "inStock": True,
                    "isFeatured": False,
                    "platform": "Shopify"
                })
                print(f"  Added Shopify product: {prod['title']}")
    except Exception as e:
        print(f"Error fetching Shopify products: {e}")
    return products

def parse_etsy_csv(csv_path="scripts/etsy_listings.csv"):
    products = []
    if not os.path.exists(csv_path):
        print(f"No CSV found at {csv_path}. Skipping CSV import.")
        return products
    
    try:
        print(f"Parsing Etsy CSV: {csv_path}...")
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                title = row.get('TITLE', row.get('Title', 'Unnamed'))
                if not title or title.lower() == 'unnamed':
                    continue
                price_str = row.get('PRICE', row.get('Price', '0'))
                try:
                    price_val = float(re.sub(r'[^\d\.]', '', price_str))
                except:
                    price_val = 0.0
                
                description = row.get('DESCRIPTION', row.get('Description', ''))
                listing_id = row.get('LISTING ID', row.get('Listing ID', str(hash(title))[:8]))
                
                # Image from CSV (rare) or fallback
                img_url = row.get('IMAGE', row.get('Image', ''))
                local_image_path = "/images/products/placeholder.jpg"
                if img_url and img_url.startswith('http'):
                    local_image_path = download_image(img_url, f"csv-{listing_id}.jpg")
                
                products.append({
                    "id": f"etsy-csv-{listing_id}",
                    "title": title,
                    "price": price_val,
                    "originalPrice": f"{price_val} USD",
                    "description": clean_html_desc(description),
                    "image": local_image_path,
                    "link": f"https://petioleandbloomllc.etsy.com/listing/{listing_id}",
                    "category": "Plants",
                    "rating": 5.0,
                    "inStock": True,
                    "isFeatured": False,
                    "platform": "Etsy"
                })
                print(f"  Added CSV product: {title}")
    except Exception as e:
        print(f"Error parsing CSV: {e}")
    return products

def parse_etsy_rss():
    url = "https://www.etsy.com/shop/PetioleAndBloomLLC/rss"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
    products = []
    try:
        print(f"Fetching Etsy RSS feed: {url}...")
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"Failed to fetch RSS feed. Status code: {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.find_all('item')
        print(f"Found {len(items)} items in RSS feed. Processing...")
        
        for item in items:
            title_raw = item.find('title').text if item.find('title') else 'Unnamed Listing'
            title = clean_title(title_raw)
            
            link_tag = item.find('link')
            link = link_tag.next_sibling.strip() if (link_tag and link_tag.next_sibling) else 'https://petioleandbloomllc.etsy.com'
            
            guid_tag = item.find('guid')
            guid_val = guid_tag.text.strip() if guid_tag else link
            
            listing_id_match = re.search(r'/listing/(\d+)', link)
            listing_id = listing_id_match.group(1) if listing_id_match else re.sub(r'\D', '', guid_val)[:10]
            
            description_tag = item.find('description')
            description_html = description_tag.text if description_tag else ''
            
            price_val = 0.0
            original_price = ""
            img_url = ""
            description_text = ""
            
            if description_html:
                desc_soup = BeautifulSoup(description_html, 'html.parser')
                img_tag = desc_soup.find('img')
                if img_tag and img_tag.has_attr('src'):
                    img_url = img_tag['src']
                    
                price_p = desc_soup.find('p', class_='price')
                if price_p:
                    original_price = price_p.text.strip()
                    price_num_match = re.search(r'([\d\.]+)', original_price)
                    if price_num_match:
                        price_val = float(price_num_match.group(1))
                
                desc_p = desc_soup.find('p', class_='description')
                if desc_p:
                    description_text = clean_html_desc(str(desc_p))
                else:
                    description_text = clean_html_desc(description_html)
            
            local_image_path = "/images/products/placeholder.jpg"
            if img_url:
                image_filename = f"{listing_id}.jpg"
                local_image_path = download_image(img_url, image_filename)
                
            products.append({
                "id": f"etsy-{listing_id}",
                "title": title,
                "price": price_val,
                "originalPrice": original_price or f"{price_val} USD",
                "description": description_text,
                "image": local_image_path,
                "link": f"https://petioleandbloomllc.etsy.com/listing/{listing_id}",
                "category": "Plants" if "plant" in title.lower() or "musa" in title.lower() or "orchid" in title.lower() else "Serums",
                "rating": 5.0,
                "inStock": True,
                "isFeatured": False,
                "platform": "Etsy"
            })
            print(f"  Added product: {title} (${price_val})")
            
    except Exception as e:
        print(f"Error parsing Etsy RSS: {e}")
        
    return products

def main():
    print("--- Starting Synchronizer ---")
    
    shopify_products = fetch_shopify_products()
    etsy_rss_products = parse_etsy_rss()
    etsy_csv_products = parse_etsy_csv()
    
    # Merge, preferring Shopify and RSS over CSV to avoid duplicates if titles match loosely
    all_products = []
    seen_titles = set()
    
    for prod_list in [shopify_products, etsy_rss_products, etsy_csv_products]:
        for prod in prod_list:
            t = prod['title'].lower()
            if t not in seen_titles:
                all_products.append(prod)
                seen_titles.add(t)
    
    output_path = "src/data/products.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated product catalog at {output_path}!")
    print(f"Total products in catalog: {len(all_products)}")

if __name__ == "__main__":
    main()

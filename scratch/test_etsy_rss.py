import requests
from bs4 import BeautifulSoup

def fetch_etsy_rss():
    url = "https://www.etsy.com/shop/PetioleAndBloomLLC/rss"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print("RSS Status code:", response.status_code)
        if response.status_code == 200:
            print("Successfully fetched RSS Feed!")
            # Use built-in html.parser which handles XML tags perfectly fine
            soup = BeautifulSoup(response.text, 'html.parser')
            
            items = soup.find_all('item')
            print(f"Found {len(items)} items in the RSS feed.")
            
            for i, item in enumerate(items[:5]):
                title = item.find('title').text if item.find('title') else 'No Title'
                link = item.find('link').text if item.find('link') else 'No Link'
                
                # Check for description
                description_tag = item.find('description')
                description = description_tag.text if description_tag else 'No Description'
                
                # The description often contains the image and a text preview in HTML format
                img_src = 'No Image'
                if description != 'No Description':
                    desc_soup = BeautifulSoup(description, 'html.parser')
                    img = desc_soup.find('img')
                    if img and img.has_attr('src'):
                        img_src = img['src']
                
                print(f"\nItem {i+1}:")
                print(f"  Title: {title}")
                print(f"  Link: {link}")
                print(f"  Image: {img_src}")
                
            # Write a portion of the RSS to disk to inspect
            with open('scratch/rss_feed.xml', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("Wrote RSS content to scratch/rss_feed.xml")
        else:
            print("Failed to fetch RSS. Status:", response.status_code)
    except Exception as e:
        print("Error fetching RSS:", e)

if __name__ == "__main__":
    fetch_etsy_rss()

import requests
from bs4 import BeautifulSoup

def fetch_etsy_shop():
    url = "https://www.etsy.com/shop/PetioleAndBloomLLC"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print("Response status code:", response.status_code)
        print("Response headers:", dict(response.headers))
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Let's count listing links
            links = soup.find_all('a', href=True)
            product_links = []
            for link in links:
                href = link['href']
                if '/listing/' in href:
                    # Clean the link (remove query parameters)
                    clean_href = href.split('?')[0]
                    if clean_href not in product_links:
                        product_links.append(clean_href)
            
            print(f"Successfully fetched Etsy page! Length: {len(response.text)}")
            print(f"Found {len(product_links)} unique listing links.")
            for i, p_link in enumerate(product_links[:5]):
                print(f"  {i+1}: {p_link}")
                
            # Write html to a scratch file
            with open('scratch/etsy_page.html', 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            print("Wrote page html to scratch/etsy_page.html")
        else:
            print("Failed to fetch Etsy page. Status:", response.status_code)
            # Let's write the response text anyway to see the error page
            with open('scratch/etsy_error.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("Wrote error HTML to scratch/etsy_error.html")
    except Exception as e:
        print("Error fetching Etsy page:", e)

if __name__ == "__main__":
    fetch_etsy_shop()

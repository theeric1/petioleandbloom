import requests
from bs4 import BeautifulSoup

def test_pagination():
    # Test page 2 of the RSS feed
    url = "https://www.etsy.com/shop/PetioleAndBloomLLC/rss?page=2"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print("Page 2 RSS Status code:", response.status_code)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('item')
            print(f"Found {len(items)} items in the Page 2 RSS feed.")
            if len(items) > 0:
                print("First item on Page 2:", items[0].find('title').text)
            
            # Let's compare with page 1 to see if they are different
            response1 = requests.get("https://www.etsy.com/shop/PetioleAndBloomLLC/rss", headers=headers, timeout=15)
            soup1 = BeautifulSoup(response1.text, 'html.parser')
            items1 = soup1.find_all('item')
            print("First item on Page 1:", items1[0].find('title').text if items1 else 'None')
            
            if items and items1 and items[0].find('title').text == items1[0].find('title').text:
                print("Pagination is NOT supported (Page 2 returned the same content as Page 1).")
            else:
                print("Pagination IS supported! We can retrieve older products!")
        else:
            print("Failed to fetch Page 2 RSS.")
    except Exception as e:
        print("Error during pagination test:", e)

if __name__ == "__main__":
    test_pagination()

import re
from bs4 import BeautifulSoup

def test_regex():
    with open('scratch/rss_feed.xml', 'r', encoding='utf-8') as f:
        content = f.read()
        
    soup = BeautifulSoup(content, 'html.parser')
    items = soup.find_all('item')
    
    if items:
        item = items[0]
        item_str = str(item)
        print("Item serialization sample:")
        print(item_str[:400]) # Look at the link part
        
        # Let's test different regex matches
        link_match = re.search(r'<link\s*/?>(https?://[^\s<]+)', item_str, re.IGNORECASE)
        if link_match:
            print("\nRegex 1 Match (Link):", link_match.group(1))
            
        link_match2 = re.search(r'<link>(.*?)</link>', item_str, re.IGNORECASE)
        if link_match2:
            print("Regex 2 Match (Link):", link_match2.group(1))
            
        # Check if next_sibling works
        link_tag = item.find('link')
        if link_tag:
            print("\nlink_tag found:", link_tag)
            print("link_tag.next_sibling:", repr(link_tag.next_sibling))
            print("link_tag.string:", repr(link_tag.string))

if __name__ == "__main__":
    test_regex()

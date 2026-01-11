import requests
import os
from dotenv import load_dotenv

load_dotenv()

def get_nearby_businesses(api_key, lat, lng, radius=1500, keyword=None, page_token=None):
    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "restaurant",
        "key": api_key
    }
    
    if keyword:
        params["keyword"] = keyword
    
    if page_token:
        params["pagetoken"] = page_token
    
    response = requests.get(base_url, params=params)
    data = response.json()
    
    if data.get("status") == "OK":
        return data.get("results", []), data.get("next_page_token")
    elif data.get("status") == "INVALID_REQUEST":
        print(f"  Debug: INVALID_REQUEST - check API key and parameters")
        return [], None
    else:
        print(f"  API Status: {data.get('status')}")
        return [], None

def get_website(api_key, place_id):
    base_url = "https://maps.googleapis.com/maps/api/place/details/json"
    
    params = {
        "place_id": place_id,
        "fields": "website",
        "key": api_key
    }
    
    response = requests.get(base_url, params=params)
    data = response.json()
    
    if data.get("status") == "OK":
        return data.get("result", {}).get("website")
    else:
        return None

def find_businesses_without_website(api_key, lat, lng, keyword, target_count=5):
    print(f"\nSearching for {target_count} local businesses without websites...")
    
    import time
    time.sleep(1)
    
    businesses_without_website = []
    page_token = None
    all_results = []
    attempts = 0
    max_attempts = 3
    
    while len(businesses_without_website) < target_count and attempts < max_attempts:
        attempts += 1
        results, page_token = get_nearby_businesses(api_key, lat, lng, keyword=keyword, page_token=page_token)
        
        if not results:
            if page_token:
                time.sleep(2)
                continue
            print(f"  No more results available.")
            break
        
        all_results.extend(results)
        print(f"  Checked {len(all_results)} businesses...")
        
        for place in results:
            if len(businesses_without_website) >= target_count:
                break
            
            website = get_website(api_key, place.get("place_id"))
            
            if not website:
                businesses_without_website.append(place)
                print(f"    Found one without website: {place.get('name')} ({len(businesses_without_website)}/{target_count})")
        
        if not page_token:
            print(f"  Reached end of results.")
            break
        
        time.sleep(2)
    
    return businesses_without_website

def display_businesses(businesses):
    print("\n" + "="*60)
    print("LOCAL BUSINESSES WITHOUT WEBSITES")
    print("="*60)
    
    for i, place in enumerate(businesses, 1):
        name = place.get("name", "N/A")
        address = place.get("vicinity", "N/A")
        rating = place.get("rating", "N/A")
        total_ratings = place.get("user_ratings_total", 0)
        is_open = place.get("opening_hours", {}).get("open_now", None)
        price_level = place.get("price_level", "N/A")
        
        print(f"\n{i}. {name}")
        print(f"   Address: {address}")
        print(f"   Rating: {rating}/5 ({total_ratings} reviews)")
        
        if is_open is not None:
            status = "Open now" if is_open else "Closed"
            print(f"   Status: {status}")
        
        if price_level != "N/A":
            dollars = "$" * price_level
            print(f"   Price Level: {dollars}")
        
        print(f"   Website: N/A")
        
        print("-" * 40)

def main():
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    
    if not api_key:
        print("Error: GOOGLE_MAPS_API_KEY not found in .env file")
        print("Add 'GOOGLE_MAPS_API_KEY=your_api_key' to your .env file")
        return
    
    if len(api_key) < 10:
        print(f"Error: API key seems too short: {api_key[:5]}...")
        return
    
    print("Find Local Businesses Without Websites")
    print("-" * 40)
    print("Default: Searching near zipcode 02464 (Newton Upper Falls, MA)")
    
    lat_input = input("Enter latitude (press Enter for default 42.312): ").strip()
    lng_input = input("Enter longitude (press Enter for default -71.213): ").strip()
    
    if lat_input and lng_input:
        try:
            lat = float(lat_input)
            lng = float(lng_input)
        except ValueError:
            print("Error: Please enter valid numeric coordinates")
            return
    else:
        lat = 42.312
        lng = -71.213
        print(f"Using default coordinates: {lat}, {lng}")
    
    keyword = input("Enter search keyword (optional, press Enter to skip): ").strip() or None
    
    businesses = find_businesses_without_website(api_key, lat, lng, keyword, target_count=5)
    
    if len(businesses) >= 5:
        display_businesses(businesses)
    elif businesses:
        print(f"\nOnly found {len(businesses)} businesses without websites:")
        display_businesses(businesses)
    else:
        print("\nNo businesses without websites found in the area.")

if __name__ == "__main__":
    main()

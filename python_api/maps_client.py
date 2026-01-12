import requests
import time
import random

DEFAULT_LAT = 42.312
DEFAULT_LNG = -71.213

class GoogleMapsClient:
    def __init__(self, api_key):
        self.api_key = api_key
    
    def get_nearby_businesses(self, lat, lng, radius=5000, keyword=None, page_token=None):
        base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "type": "restaurant",
            "key": self.api_key
        }
        
        if keyword:
            params["keyword"] = keyword
        
        if page_token:
            params["pagetoken"] = page_token
        
        response = requests.get(base_url, params=params)
        return response.json()
    
    def get_place_details(self, place_id):
        base_url = "https://maps.googleapis.com/maps/api/place/details/json"
        
        params = {
            "place_id": place_id,
            "fields": "name,place_id,vicinity,formatted_address,formatted_phone_number,international_phone_number,email,rating,user_ratings_total,price_level,opening_hours,website,reviews,photos,geometry,url,utc_offset,icon,icon_mask_base_uri,icon_background_color,reference,types,business_status,curbside_pickup,delivery,dine_in,takeout,reservable",
            "key": self.api_key
        }
        
        response = requests.get(base_url, params=params)
        json_data = response.json()
        result = json_data.get("result", {})
        
        if "photos" in result and isinstance(result["photos"], list):
            photo_urls = []
            for photo in result["photos"][:5]:
                photo_ref = photo.get("photo_reference")
                if photo_ref:
                    photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={photo_ref}&key={self.api_key}"
                    photo_urls.append(photo_url)
            result["photo_urls"] = photo_urls
        
        return result
    
    def find_businesses_without_website(self, lat, lng, keyword="", target_count=5):
        print(f"\nSearching for {target_count} businesses without websites...")
        
        found_without_website = []
        all_businesses = []
        page_token = None
        page_num = 0
        max_pages = 20
        
        while len(found_without_website) < target_count and page_num < max_pages:
            page_num += 1
            print(f"  Page {page_num}...", end=" ")
            
            data = self.get_nearby_businesses(lat, lng, keyword=keyword if keyword else None, page_token=page_token)
            
            if data.get("status") != "OK":
                print(f"API error: {data.get('status')}")
                break
            
            results = data.get("results", [])
            if not results:
                print("no results")
                break
            
            print(f"found {len(results)} businesses")
            
            for place in results:
                place_name = place.get("name")
                if not place_name or str(place_name).strip() in ["", "None", "null"]:
                    continue
                
                place_name = str(place_name).strip()
                
                details = self.get_place_details(place.get("place_id"))
                details["name"] = place_name
                all_businesses.append(details)
                
                if not details.get("website"):
                    found_without_website.append(details)
                    print(f"    ✓ {place_name} - no website ({len(found_without_website)}/{target_count})")
            
            page_token = data.get("next_page_token")
            if not page_token:
                print("  Reached end of results")
                break
            
            time.sleep(2)
        
        if len(found_without_website) < target_count:
            print(f"  Only found {len(found_without_website)} businesses without websites after {page_num} pages")
        
        return found_without_website, all_businesses

    def find_all_businesses(self, lat, lng, keyword="", target_count=20):
        print(f"\nSearching for {target_count} businesses...")
        
        found = []
        page_token = None
        page_num = 0
        
        while len(found) < target_count:
            page_num += 1
            print(f"  Page {page_num}...", end=" ")
            
            data = self.get_nearby_businesses(lat, lng, keyword=keyword if keyword else None, page_token=page_token)
            
            if data.get("status") != "OK":
                print(f"API error: {data.get('status')}")
                break
            
            results = data.get("results", [])
            if not results:
                print("no results")
                break
            
            print(f"found {len(results)} businesses")
            
            for place in results:
                if len(found) >= target_count:
                    break
                
                details = self.get_place_details(place.get("place_id"))
                found.append(details)
                website_status = "has website" if details.get("website") else "no website"
                print(f"    ✓ {details.get('name')} - {website_status} ({len(found)}/{target_count})")
            
            page_token = data.get("next_page_token")
            if not page_token:
                print("  Reached end of results")
                break
            
            time.sleep(2)
        
        return found

    def find_random_area(self):
        queries = [
            "city in United States",
            "suburb in California",
            "suburb in Texas",
            "suburb in Florida",
            "suburb in New York",
            "town in Massachusetts",
            "city in Illinois",
            "city in Pennsylvania",
            "city in Ohio",
            "city in Georgia",
            "city in North Carolina",
            "city in Michigan",
            "city in New Jersey",
            "city in Virginia",
            "city in Washington",
            "city in Arizona",
            "city in Tennessee",
            "city in Indiana",
            "city in Missouri",
            "city in Maryland",
            "city in Wisconsin",
            "city in Colorado",
            "city in Minnesota",
            "city in South Carolina",
            "city in Alabama",
            "city in Louisiana",
            "city in Kentucky",
            "city in Oregon",
            "city in Oklahoma",
            "city in Connecticut",
            "city in Nevada",
        ]
        
        for attempt in range(3):
            query = random.choice(queries)
            
            try:
                url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                params = {"query": query, "key": self.api_key}
                
                response = requests.get(url, params=params)
                data = response.json()
                
                if data.get("status") == "OK" and data.get("results"):
                    valid_places = [p for p in data.get("results", [])[:20] 
                                    if p.get("name") and str(p.get("name")).strip() not in ["", "None", "null"]]
                    
                    if valid_places:
                        place = random.choice(valid_places)
                        location = place.get("geometry", {}).get("location", {})
                        
                        return {
                            "name": place.get("name", ""),
                            "city": place.get("formatted_address", "").split(",")[0].strip() if place.get("formatted_address") else "",
                            "lat": location.get("lat"),
                            "lng": location.get("lng")
                        }
            except Exception as e:
                continue
        
        return None

import requests
import time

DEFAULT_LAT = 42.312
DEFAULT_LNG = -71.213

class GoogleMapsClient:
    def __init__(self, api_key):
        self.api_key = api_key
    
    def get_nearby_businesses(self, lat, lng, radius=1500, keyword=None, page_token=None):
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
            "fields": "name,place_id,vicinity,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,price_level,opening_hours,website,reviews,photos,geometry,url,utc_offset,icon,icon_mask_base_uri,icon_background_color,reference,types,business_status,curbside_pickup,delivery,dine_in,takeout,reservable",
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
                
                if not details.get("website"):
                    found.append(details)
                    print(f"    ✓ {details.get('name')} - no website ({len(found)}/{target_count})")
            
            page_token = data.get("next_page_token")
            if not page_token:
                print("  Reached end of results")
                break
            
            time.sleep(2)
        
        return found

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

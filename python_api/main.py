import os
import sys
import random
import json
from urllib.parse import unquote
from dotenv import load_dotenv
from maps_client import GoogleMapsClient, download_photos_locally, sanitize_folder_name, DEFAULT_LAT, DEFAULT_LNG
from generate_website import generate_website_for_business, PUBLIC_BUSINESSES_DIR

load_dotenv()

def get_random_coordinates():
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return None, None, None
    
    client = GoogleMapsClient(api_key)
    area = client.find_random_area()
    
    if area:
        return area["lat"], area["lng"], area["name"]
    return None, None, None

US_AREAS = [
    {"city": "Boston, MA", "lat": 42.3601, "lng": -71.0589},
    {"city": "Cambridge, MA", "lat": 42.3736, "lng": -71.1097},
    {"city": "Somerville, MA", "lat": 42.3876, "lng": -71.0995},
    {"city": "Brookline, MA", "lat": 42.3317, "lng": -71.1211},
    {"city": "Newton, MA", "lat": 42.3370, "lng": -71.2092},
    {"city": "New York City, NY", "lat": 40.7128, "lng": -74.0060},
    {"city": "Brooklyn, NY", "lat": 40.6782, "lng": -73.9442},
    {"city": "Queens, NY", "lat": 40.7282, "lng": -73.7949},
    {"city": "Manhattan, NY", "lat": 40.7831, "lng": -73.9712},
    {"city": "Jersey City, NJ", "lat": 40.7178, "lng": -74.0431},
    {"city": "Hoboken, NJ", "lat": 40.7437, "lng": -74.0324},
    {"city": "Philadelphia, PA", "lat": 39.9526, "lng": -75.1652},
    {"city": "Washington, DC", "lat": 38.9072, "lng": -77.0369},
    {"city": "Arlington, VA", "lat": 38.8816, "lng": -77.0908},
    {"city": "Alexandria, VA", "lat": 38.8048, "lng": -77.0469},
    {"city": "Chicago, IL", "lat": 41.8781, "lng": -87.6298},
    {"city": "Evanston, IL", "lat": 42.0451, "lng": -87.6877},
    {"city": "Los Angeles, CA", "lat": 34.0522, "lng": -118.2437},
    {"city": "Santa Monica, CA", "lat": 34.0195, "lng": -118.4912},
    {"city": "Burbank, CA", "lat": 34.1808, "lng": -118.3090},
    {"city": "Pasadena, CA", "lat": 34.1478, "lng": -118.1445},
    {"city": "San Francisco, CA", "lat": 37.7749, "lng": -122.4194},
    {"city": "Oakland, CA", "lat": 37.8044, "lng": -122.2712},
    {"city": "Berkeley, CA", "lat": 37.8716, "lng": -122.2727},
    {"city": "San Jose, CA", "lat": 37.3382, "lng": -121.8863},
    {"city": "Palo Alto, CA", "lat": 37.4419, "lng": -122.1430},
    {"city": "Mountain View, CA", "lat": 37.3861, "lng": -122.0839},
    {"city": "Seattle, WA", "lat": 47.6062, "lng": -122.3321},
    {"city": "Bellevue, WA", "lat": 47.6101, "lng": -122.2015},
    {"city": "Redmond, WA", "lat": 47.6739, "lng": -122.1215},
    {"city": "Austin, TX", "lat": 30.2672, "lng": -97.7431},
    {"city": "Dallas, TX", "lat": 32.7767, "lng": -96.7970},
    {"city": "Houston, TX", "lat": 29.7604, "lng": -95.3698},
    {"city": "Phoenix, AZ", "lat": 33.4484, "lng": -112.0740},
    {"city": "Scottsdale, AZ", "lat": 33.4942, "lng": -111.9261},
    {"city": "Denver, CO", "lat": 39.7392, "lng": -104.9903},
    {"city": "Boulder, CO", "lat": 40.0150, "lng": -105.2705},
    {"city": "Atlanta, GA", "lat": 33.7490, "lng": -84.3880},
    {"city": "Miami, FL", "lat": 25.7617, "lng": -80.1918},
    {"city": "Fort Lauderdale, FL", "lat": 26.1224, "lng": -80.1373},
    {"city": "Tampa, FL", "lat": 27.9506, "lng": -82.4572},
    {"city": "Orlando, FL", "lat": 28.5383, "lng": -81.3792},
    {"city": "Portland, OR", "lat": 45.5152, "lng": -122.6784},
    {"city": "San Diego, CA", "lat": 32.7157, "lng": -117.1611},
    {"city": "Nashville, TN", "lat": 36.1627, "lng": -86.7816},
    {"city": "Charlotte, NC", "lat": 35.2271, "lng": -80.8431},
    {"city": "Raleigh, NC", "lat": 35.7796, "lng": -78.6382},
    {"city": "San Antonio, TX", "lat": 29.4241, "lng": -98.4936},
]

def get_already_curated_slugs():
    slugs = set()
    if os.path.exists(PUBLIC_BUSINESSES_DIR):
        for item in os.listdir(PUBLIC_BUSINESSES_DIR):
            slug_path = os.path.join(PUBLIC_BUSINESSES_DIR, item)
            if os.path.isdir(slug_path):
                data_file = os.path.join(slug_path, "data.json")
                if os.path.exists(data_file):
                    slugs.add(item)
    return slugs

def print_phone_pitches():
    print("\n" + "=" * 60)
    print("PHONE PITCHES")
    print("=" * 60)
    
    curated = get_already_curated_slugs()
    for slug in sorted(curated):
        pitch_file = os.path.join(PUBLIC_BUSINESSES_DIR, slug, "phone_pitch.txt")
        if os.path.exists(pitch_file):
            name = unquote(slug).replace("-", " ").replace("+", " ")
            print(f"\n--- {name} ---")
            with open(pitch_file, "r") as f:
                print(f.read())

def process_area(client, lat, lng, area_name, keyword):
    print(f"\nSearching in {area_name}")
    print(f"Coordinates: {lat:.4f}, {lng:.4f}")
    
    businesses_to_curate, all_businesses = client.find_businesses_without_website(lat, lng, keyword, target_count=5)
    
    if not businesses_to_curate:
        print(f"No businesses without websites found in {area_name}")
        return False
    
    print(f"\nFound {len(businesses_to_curate)} businesses without websites out of {len(all_businesses)} total")
    
    curated_slugs = get_already_curated_slugs()
    new_businesses = [b for b in businesses_to_curate if sanitize_folder_name(b.get("name", "")) not in curated_slugs]
    
    if not new_businesses:
        print(f"All found businesses already have websites curated!")
        return False
    
    print(f"\n{len(new_businesses)} new businesses to curate:")
    for i, b in enumerate(new_businesses, 1):
        print(f"  {i}. {b.get('name')}")
    
    print()
    response = input("Curate websites for these businesses? (y/n): ").strip().lower()
    
    if response == "y" or response == "yes":
        print("\nCurating websites...")
        
        for business in new_businesses:
            name = business.get("name", "Unknown")
            print(f"\nProcessing: {name}")
            
            photo_urls = business.get("photo_urls", [])
            if photo_urls:
                print(f"  Downloading {len(photo_urls)} photos...")
                local_paths = download_photos_locally(photo_urls, name)
                print(f"  Downloaded {len(local_paths)} photos")
            else:
                local_paths = []
                print("  No photos to download")
            
            slug = generate_website_for_business(business, photo_paths=local_paths, use_opencode=True)
            
            if slug:
                print(f"  ✓ Curated: {slug}")
            else:
                print(f"  ✗ Failed to curate")
        
        print_phone_pitches()
        
        print("\nCommitting and pushing changes...")
        commit_and_push_changes()
        
        return True
    else:
        print("\nSkipped.")
        return False

def commit_and_push_changes():
    try:
        import subprocess
        import os
        
        repo_dir = os.path.dirname(os.path.dirname(__file__))
        
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        if not result.stdout.strip():
            print("No changes to commit")
            return
        
        result = subprocess.run(
            ["git", "diff", "--stat"],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        stats = result.stdout.strip()
        
        result = subprocess.run(
            ["git", "add", "-A"],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        commit_message = f"""Automated commit: Updated business websites

Changes: {stats}

This is an automated commit generated by the LocWeb curation script."""

        result = subprocess.run(
            ["git", "commit", "-m", commit_message],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(f"\nCommitted changes: {stats}")
            
            result = subprocess.run(
                ["git", "push", "origin", "master"],
                cwd=repo_dir,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("Pushed to origin/master")
            else:
                print(f"Push failed: {result.stderr}")
        else:
            print(f"Commit failed: {result.stderr}")
            
    except Exception as e:
        print(f"Git operation failed: {e}")

def main():
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    
    if not api_key:
        print("Error: GOOGLE_MAPS_API_KEY not found in .env file")
        return
    
    client = GoogleMapsClient(api_key)
    
    print("Find Local Businesses Without Websites")
    print("-" * 50)
    print("Press Enter to use random US city/suburb, or enter coordinates manually")
    
    lat_input = input(f"Latitude: ").strip()
    lng_input = input(f"Longitude: ").strip()
    
    keyword = input("Search keyword (optional): ").strip() or ""
    
    while True:
        if lat_input and lng_input:
            try:
                lat = float(lat_input)
                lng = float(lng_input)
                area_name = f"Custom coordinates ({lat}, {lng})"
            except ValueError:
                print("Invalid coordinates, using random area")
                lat, lng, area_name = get_random_coordinates()
        else:
            lat, lng, area_name = get_random_coordinates()
            if not lat:
                print("Could not find random area, exiting")
                return
        
        print("\n" + "=" * 60)
        processed = process_area(client, lat, lng, area_name, keyword)
        
        print("\n" + "=" * 60)
        response = input("\nSearch another area? (y/n): ").strip().lower()
        
        if response != "y" and response != "yes":
            print("\nDone!")
            break
        
        lat_input = ""
        lng_input = ""

if __name__ == "__main__":
    main()

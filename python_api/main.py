import os
import csv
import sys
import random
import json
from urllib.parse import unquote
from dotenv import load_dotenv
from maps_client import GoogleMapsClient, DEFAULT_LAT, DEFAULT_LNG

load_dotenv()

CSV_FILE = "businesses.csv"

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

def sanitize_folder_name(name):
    return "".join(c if c.isalnum or c in " -_" else "_" for c in name).strip()[:50]

def load_existing_csv():
    if not os.path.exists(CSV_FILE):
        return [], set()
    
    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fields = set(reader.fieldnames) if reader.fieldnames else set()
    return rows, fields

def business_key(business):
    name = business.get("name", "").lower().strip()
    address = business.get("vicinity", "").lower().strip()
    return f"{name}|{address}"

def format_business_for_csv(business):
    row = {}
    for key, value in business.items():
        if isinstance(value, dict):
            row[key] = str(value)
        elif isinstance(value, list):
            if key == "photo_urls":
                row[key] = "|||".join(str(v) for v in value)
            else:
                row[key] = str(len(value)) + " items"
        else:
            row[key] = value if value is not None else ""
    row["website?"] = "yes" if business.get("website") else "no"
    return row

def save_businesses_to_csv(all_businesses):
    all_fields = set()
    for b in all_businesses:
        all_fields.update(b.keys())
    
    for b in all_businesses:
        if b.get("curated"):
            all_fields.add("curated")
        elif "curated" in b:
            all_fields.add("curated")
    
    sorted_fields = sorted(all_fields)
    
    with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=sorted_fields, extrasaction="ignore")
        writer.writeheader()
        for business in all_businesses:
            row = {}
            for field in sorted_fields:
                value = business.get(field)
                if value is not None:
                    if isinstance(value, dict):
                        row[field] = str(value)
                    elif isinstance(value, list):
                        if field == "photo_urls":
                            row[field] = "|||".join(str(v) for v in value)
                        else:
                            row[field] = str(len(value)) + " items"
                    else:
                        row[field] = str(value)
                else:
                    row[field] = ""
            writer.writerow(row)

def merge_and_save(new_businesses, existing_rows):
    existing_by_key = {business_key(row): row for row in existing_rows}
    
    filtered_new = [b for b in new_businesses if b.get("name")]
    filtered_existing = [r for r in existing_rows if r.get("name")]
    
    existing_by_key = {business_key(row): row for row in filtered_existing}
    
    for business in filtered_new:
        key = business_key(business)
        if key in existing_by_key:
            existing = existing_by_key[key]
            if existing.get("curated"):
                business["curated"] = existing["curated"]
    
    all_businesses = filtered_new + [
        row for key, row in existing_by_key.items()
        if business_key(row) not in {business_key(b) for b in filtered_new}
    ]
    
    save_businesses_to_csv(all_businesses)
    return all_businesses

def update_business_slug(business_name, slug):
    existing_rows, _ = load_existing_csv()
    
    for row in existing_rows:
        if row.get("name", "").lower().strip() == business_name.lower().strip():
            if not row.get("curated"):
                row["curated"] = slug
                save_businesses_to_csv(existing_rows)
                return True
    
    return False

def run_website_generation(businesses):
    try:
        from generate_website import generate_website_for_business
    except ImportError:
        print("Error: Could not import generate_website module")
        return []
    
    businesses_to_curate = [b for b in businesses if not b.get("website") and not b.get("curated")]
    
    if not businesses_to_curate:
        print("No businesses need websites curated")
        return businesses
    
    updated_businesses = []
    curated_count = 0
    failed_count = 0
    
    for business in businesses_to_curate:
        print(f"\nCurating website for: {business.get('name')}")
        slug = generate_website_for_business(business, use_opencode=True)
        
        if slug:
            business["curated"] = slug
            curated_count += 1
            print(f"  Curated: {slug}")
        else:
            failed_count += 1
            print(f"  Failed to curate")
        
        updated_businesses.append(business)
    
    print(f"\nCuration complete: {curated_count} succeeded, {failed_count} failed")
    return updated_businesses

def load_code_file():
    code_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "lib", "code.json")
    if os.path.exists(code_file):
        try:
            with open(code_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

def print_sales_emails_from_code():
    print("\n" + "=" * 60)
    print("SALES EMAILS")
    print("=" * 60)
    
    code_data = load_code_file()
    for key in code_data:
        if key.endswith(".email"):
            slug = key.replace(".email", "")
            name = unquote(slug).replace("-", " ").replace("+", " ")
            print("\n--- " + name + " ---")
            print(code_data[key])
            print()

def process_area(client, lat, lng, area_name, keyword):
    print(f"\nSearching in {area_name}")
    print(f"Coordinates: {lat:.4f}, {lng:.4f}")
    
    businesses_to_curate, all_businesses = client.find_businesses_without_website(lat, lng, keyword, target_count=5)
    
    if not businesses_to_curate:
        print(f"No businesses without websites found in {area_name}")
        return False
    
    print(f"\nFound {len(businesses_to_curate)} businesses without websites out of {len(all_businesses)} total")
    
    existing_rows, _ = load_existing_csv()
    merged_businesses = merge_and_save(all_businesses, existing_rows)
    
    print(f"\nCSV updated")
    print(f"Total businesses: {len(merged_businesses)}")
    
    uncurated = [b for b in merged_businesses if not b.get("website") and not b.get("curated")]
    
    if not uncurated:
        print(f"All businesses in {area_name} have websites!")
        return False
    
    print(f"\n{len(uncurated)} businesses without websites:")
    for i, b in enumerate(uncurated, 1):
        print(f"  {i}. {b.get('name')}")
    
    print()
    response = input("Curate websites for these businesses? (y/n): ").strip().lower()
    
    if response == "y" or response == "yes":
        print("\nCurating websites...")
        run_website_generation(merged_businesses)
        
        websites_dir = os.path.join(os.path.dirname(__file__), "content", "websites")
        if os.path.exists(websites_dir):
            import shutil
            shutil.rmtree(websites_dir)
            print(f"\nCleaned up {websites_dir}")
        
        print_sales_emails_from_code()
        
        print("\nCommitting and pushing changes...")
        commit_and_push_changes()
        
        return True
    else:
        print("\nSkipped.")
        return False

def commit_and_push_changes():
    """Commit and push code.json changes to git"""
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
            ["git", "add", "src/lib/code.json"],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        commit_message = f"""Automated commit: Updated code.json

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

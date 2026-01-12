import os
import csv
import sys
from dotenv import load_dotenv
from maps_client import GoogleMapsClient, DEFAULT_LAT, DEFAULT_LNG

load_dotenv()

CSV_FILE = "businesses.csv"

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

def main():
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    
    if not api_key:
        print("Error: GOOGLE_MAPS_API_KEY not found in .env file")
        return
    
    client = GoogleMapsClient(api_key)
    
    print("Find Local Businesses Without Websites")
    print("-" * 50)
    
    lat_input = input(f"Latitude (Enter for {DEFAULT_LAT}): ").strip()
    lng_input = input(f"Longitude (Enter for {DEFAULT_LNG}): ").strip()
    
    lat = float(lat_input) if lat_input else DEFAULT_LAT
    lng = float(lng_input) if lng_input else DEFAULT_LNG
    
    if lat_input or lng_input:
        print(f"Using coordinates: {lat}, {lng}")
    
    keyword = input("Search keyword (optional): ").strip() or ""
    
    print("\nSearching for businesses without websites...")
    businesses_to_curate, all_businesses = client.find_businesses_without_website(lat, lng, keyword, target_count=5)
    
    if not businesses_to_curate:
        print("\nNo businesses without websites found in the area")
        return
    
    print(f"\nFound {len(businesses_to_curate)} businesses without websites out of {len(all_businesses)} total")
    
    existing_rows, _ = load_existing_csv()
    merged_businesses = merge_and_save(all_businesses, existing_rows)
    
    print(f"\nCSV updated")
    print(f"Total businesses: {len(merged_businesses)}")
    
    uncurated = [b for b in merged_businesses if not b.get("website") and not b.get("curated")]
    
    if not uncurated:
        if any(b.get("website") for b in merged_businesses):
            print("\nAll businesses have existing websites!")
        else:
            print("\nAll businesses have websites curated!")
        return
    
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
        
        print("\n" + "=" * 60)
        print("SALES EMAILS")
        print("=" * 60)
        
        existing_rows, _ = load_existing_csv()
        for row in existing_rows:
            email = row.get("sales_email", "").strip()
            if email:
                print(f"\n--- {row.get('name', 'Unknown')} ---")
                print(email)
                print()
    else:
        print("\nSkipped. Run generate_website.py later to generate websites.")

if __name__ == "__main__":
    main()

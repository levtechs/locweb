import os
import sys
import random
import json
from urllib.parse import unquote
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from maps_client import GoogleMapsClient, download_photos_locally, sanitize_folder_name, DEFAULT_LAT, DEFAULT_LNG
from generate_website import generate_website_for_business, PUBLIC_BUSINESSES_DIR

load_dotenv()

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

def get_random_area():
    area = random.choice(US_AREAS)
    return area["lat"], area["lng"], area["city"]

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

def get_current_count():
    return len(get_already_curated_slugs())

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

def commit_and_push_changes():
    try:
        import subprocess
        import os
        
        repo_dir = os.path.dirname(os.path.dirname(__file__))
        businesses_dir = os.path.join(repo_dir, "public", "businesses")
        
        result = subprocess.run(
            ["git", "status", "--porcelain", "--", businesses_dir],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        if not result.stdout.strip():
            print("No changes to commit in public/businesses")
            return
        
        result = subprocess.run(
            ["git", "add", "--", businesses_dir],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        result = subprocess.run(
            ["git", "diff", "--cached", "--stat"],
            cwd=repo_dir,
            capture_output=True,
            text=True
        )
        
        stats = result.stdout.strip()
        
        if not stats:
            print("No staged changes to commit")
            return
        
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


def search_for_businesses(client, keyword, goal):
    """Phase 1: Search regions until we find enough businesses to meet the goal."""
    import time
    print("\n" + "=" * 60)
    print(f"PHASE 1: Searching for {goal} businesses without websites")
    print("=" * 60)
    
    start_time = time.time()
    curated_slugs = get_already_curated_slugs()
    businesses_to_process = []
    searched_areas = set()
    total_scanned = 0
    
    while len(businesses_to_process) < goal:
        remaining = goal - len(businesses_to_process)
        print(f"\nNeed {remaining} more business(es)...")
        
        lat, lng, area_name = get_random_area()
        
        if area_name in searched_areas:
            if len(searched_areas) >= len(US_AREAS):
                print("Searched all available areas.")
                break
            continue
        
        searched_areas.add(area_name)
        print(f"\nSearching in {area_name} ({lat:.4f}, {lng:.4f})...")
        
        try:
            businesses_found, all_businesses = client.find_businesses_without_website(
                lat, lng, keyword, target_count=remaining
            )
            total_scanned += len(all_businesses)
        except Exception as e:
            print(f"  Error searching: {e}")
            continue
        
        if not businesses_found:
            print(f"  No businesses without websites found")
            continue
        
        new_businesses = []
        for b in businesses_found:
            slug = sanitize_folder_name(b.get("name", ""))
            if slug not in curated_slugs:
                already_queued = any(
                    sanitize_folder_name(queued.get("name", "")) == slug 
                    for queued in businesses_to_process
                )
                if not already_queued:
                    new_businesses.append(b)
        
        if new_businesses:
            print(f"  Found {len(new_businesses)} new business(es):")
            for b in new_businesses:
                print(f"    - {b.get('name')}")
            businesses_to_process.extend(new_businesses[:remaining])
        else:
            print(f"  All businesses already curated or queued")
    
    elapsed_time = time.time() - start_time
    regions_searched = len(searched_areas)
    
    print(f"\n{'=' * 60}")
    print(f"PHASE 1 SUMMARY")
    print(f"{'=' * 60}")
    print(f"  Businesses found: {len(businesses_to_process)}")
    print(f"  Total scanned: {total_scanned}")
    print(f"  Regions searched: {regions_searched}")
    print(f"  Time elapsed: {elapsed_time:.1f}s")
    print(f"{'=' * 60}\n")
    
    return businesses_to_process


def process_single_business(business):
    """Process a single business: download photos and generate website."""
    name = business.get("name", "Unknown")
    print(f"\n[AGENT] Starting: {name}")
    
    photo_urls = business.get("photo_urls", [])
    if photo_urls:
        local_paths = download_photos_locally(photo_urls, name)
        print(f"[AGENT] {name}: Downloaded {len(local_paths)} photos")
    else:
        local_paths = []
    
    slug = generate_website_for_business(business, photo_paths=local_paths, use_opencode=True)
    
    if slug:
        print(f"[AGENT] ✓ Completed: {name}")
    else:
        print(f"[AGENT] ✗ Failed: {name}")
    
    return slug


def process_businesses_parallel(businesses, parallel_workers):
    """Phase 2: Process businesses with parallel agents, keeping pool full."""
    print("\n" + "=" * 60)
    print(f"PHASE 2: Generating websites ({parallel_workers} parallel agents)")
    print("=" * 60)
    
    total = len(businesses)
    completed = 0
    success_count = 0
    
    with ThreadPoolExecutor(max_workers=parallel_workers) as executor:
        futures = {}
        business_queue = list(businesses)
        
        initial_batch = min(parallel_workers, len(business_queue))
        for _ in range(initial_batch):
            business = business_queue.pop(0)
            future = executor.submit(process_single_business, business)
            futures[future] = business
        
        while futures:
            done_futures = []
            for future in as_completed(futures):
                done_futures.append(future)
                break
            
            for future in done_futures:
                business = futures.pop(future)
                completed += 1
                
                try:
                    slug = future.result()
                    if slug:
                        success_count += 1
                except Exception as e:
                    print(f"[ERROR] {business.get('name')}: {e}")
                
                print(f"\n[PROGRESS] {completed}/{total} completed, {success_count} successful")
                
                if business_queue:
                    next_business = business_queue.pop(0)
                    new_future = executor.submit(process_single_business, next_business)
                    futures[new_future] = next_business
    
    return success_count


def main():
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    
    if not api_key:
        print("Error: GOOGLE_MAPS_API_KEY not found in .env file")
        return
    
    client = GoogleMapsClient(api_key)
    
    print("LocWeb - Local Business Website Generator")
    print("-" * 50)
    
    current_count = get_current_count()
    print(f"Currently have {current_count} websites generated.\n")
    
    goal_input = input("Goal (number of websites to generate, default 6): ").strip()
    parallel_input = input("Number of parallel agents (default 3): ").strip()
    keyword = input("Search keyword (optional): ").strip() or ""
    
    if goal_input:
        try:
            goal = max(1, int(goal_input))
        except ValueError:
            print("Invalid number, using default of 6.")
            goal = 6
    else:
        goal = 6
    
    if parallel_input:
        try:
            parallel_workers = max(1, int(parallel_input))
        except ValueError:
            print("Invalid number, using default of 3 parallel agents.")
            parallel_workers = 3
    else:
        parallel_workers = 3
    
    print(f"\nConfiguration:")
    print(f"  Goal: {goal} websites")
    print(f"  Parallel agents: {parallel_workers}")
    print(f"  Keyword: {keyword or '(none)'}")
    
    response = input("\nProceed? (y/n): ").strip().lower()
    if response != "y" and response != "yes":
        print("Cancelled.")
        return
    
    businesses = search_for_businesses(client, keyword, goal)
    
    if not businesses:
        print("\nNo businesses found to process.")
        return
    
    print(f"\n{'=' * 60}")
    print(f"Ready to generate {len(businesses)} website(s)")
    print(f"{'=' * 60}")
    for i, b in enumerate(businesses, 1):
        print(f"  {i}. {b.get('name')}")
    
    response = input("\nStart website generation? (y/n): ").strip().lower()
    if response != "y" and response != "yes":
        print("Cancelled.")
        return
    
    success_count = process_businesses_parallel(businesses, parallel_workers)
    
    print("\n" + "=" * 60)
    print(f"COMPLETE: Generated {success_count}/{len(businesses)} websites")
    print("=" * 60)
    
    print_phone_pitches()
    commit_and_push_changes()
    
    print("\nDone!")


if __name__ == "__main__":
    main()

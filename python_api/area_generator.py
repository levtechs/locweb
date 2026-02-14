"""
Deterministic area generator for business discovery.

Uses a hash-based permutation of US ZIP codes to systematically explore
the entire US without repeating areas. Progress is stored in public/stats.json.

ZIP code coordinates are resolved via the free Zippopotam.us API (no key needed).
"""

import hashlib
import json
import os
import requests

ZIP_MIN = 501
ZIP_MAX = 99950
ZIP_RANGE = ZIP_MAX - ZIP_MIN + 1

PERMUTATION_SEED = "locweb_v1"

STATS_FILE = os.path.join(os.path.dirname(__file__), "..", "public", "stats.json")

_zip_cache = {}


def _load_stats():
    """Load stats from public/stats.json, creating default if needed."""
    default = {
        "websites": {"numberOfWebsites": 0, "numberOfCities": 0, "numberOfZipcodes": 0},
        "scanned": {"websitesScanned": 0, "zipsScanned": 0, "percentZipsScanned": "0%"},
        "sales": {"numberOfSales": 0},
        "searchProgress": {"counter": 0, "areasExplored": 0, "totalAreas": 42000, "coveragePercent": "0.00%"}
    }
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f:
                data = json.load(f)
                if "searchProgress" not in data:
                    data["searchProgress"] = default["searchProgress"]
                return data
        except (json.JSONDecodeError, IOError):
            pass
    return default


def _save_stats(stats):
    """Save stats to public/stats.json atomically."""
    os.makedirs(os.path.dirname(STATS_FILE), exist_ok=True)
    temp_file = STATS_FILE + ".tmp"
    with open(temp_file, "w") as f:
        json.dump(stats, f, indent=2)
    os.replace(temp_file, STATS_FILE)


def _get_counter():
    """Get the current search counter from stats.json."""
    stats = _load_stats()
    return stats.get("searchProgress", {}).get("counter", 0)


def _set_counter(value):
    """Set the search counter and update coverage stats."""
    stats = _load_stats()
    if "searchProgress" not in stats:
        stats["searchProgress"] = {}
    stats["searchProgress"]["counter"] = value
    stats["searchProgress"]["areasExplored"] = value
    total = stats["searchProgress"].get("totalAreas", 42000)
    pct = round(value / total * 100, 2) if total > 0 else 0
    stats["searchProgress"]["coveragePercent"] = f"{pct}%"
    _save_stats(stats)


def _increment_counter(amount=1):
    """Increment the counter and return the value BEFORE incrementing."""
    current = _get_counter()
    _set_counter(current + amount)
    return current


def _hash_to_zip(index):
    """
    Deterministically map an index to a unique ZIP code using a hash permutation.
    """
    h = hashlib.sha256(f"{PERMUTATION_SEED}:{index}".encode()).hexdigest()
    num = int(h[:12], 16)
    zip_num = ZIP_MIN + (num % ZIP_RANGE)
    return f"{zip_num:05d}"


def _resolve_zip_coordinates(zip_code):
    """
    Resolve a ZIP code to lat/lng using the free Zippopotam.us API.
    Returns (lat, lng, city, state) or None if invalid ZIP.
    """
    if zip_code in _zip_cache:
        return _zip_cache[zip_code]
    
    try:
        resp = requests.get(
            f"https://api.zippopotam.us/us/{zip_code}",
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            places = data.get("places", [])
            if places:
                place = places[0]
                result = (
                    float(place["latitude"]),
                    float(place["longitude"]),
                    place.get("place name", ""),
                    place.get("state abbreviation", "")
                )
                _zip_cache[zip_code] = result
                return result
    except (requests.RequestException, ValueError, KeyError):
        pass
    
    _zip_cache[zip_code] = None
    return None


def get_next_areas(count=10, skip_invalid=True):
    """
    Get the next batch of unique areas to search.
    
    Returns a list of dicts: [{"zip": "02134", "lat": 42.35, "lng": -71.13, 
                                "city": "Allston", "state": "MA"}, ...]
    """
    stats = _load_stats()
    counter = stats["searchProgress"]["counter"]
    
    areas = []
    seen_zips = set()
    idx = counter
    attempts = 0
    max_attempts = count * 10
    
    while len(areas) < count and attempts < max_attempts:
        zip_code = _hash_to_zip(idx)
        idx += 1
        attempts += 1
        
        if zip_code in seen_zips:
            continue
        seen_zips.add(zip_code)
        
        coords = _resolve_zip_coordinates(zip_code)
        if coords is None:
            continue
        
        lat, lng, city, state = coords
        areas.append({
            "zip": zip_code,
            "lat": lat,
            "lng": lng,
            "city": city,
            "state": state,
            "name": f"{city}, {state} ({zip_code})"
        })
    
    stats["searchProgress"]["counter"] = idx
    stats["searchProgress"]["areasExplored"] = idx
    stats["searchProgress"]["coveragePercent"] = f"{round(idx / 42000 * 100, 2)}%"
    _save_stats(stats)
    
    if areas:
        print(f"\nGenerated {len(areas)} search areas:")
        for a in areas:
            print(f"  {a['name']} ({a['lat']:.3f}, {a['lng']:.3f})")
    
    return areas


def get_search_stats():
    """Get stats about how much of the ZIP space has been explored."""
    stats = _load_stats()
    sp = stats.get("searchProgress", {})
    return {
        "areas_explored": sp.get("areasExplored", 0),
        "total_areas": sp.get("totalAreas", 42000),
        "coverage_pct": float(sp.get("coveragePercent", "0").rstrip("%")),
        "remaining": max(0, sp.get("totalAreas", 42000) - sp.get("areasExplored", 0))
    }


def reset_counter():
    """Reset the search counter (start over from the beginning)."""
    stats = _load_stats()
    if "searchProgress" in stats:
        stats["searchProgress"]["counter"] = 0
        stats["searchProgress"]["areasExplored"] = 0
        stats["searchProgress"]["coveragePercent"] = "0.00%"
    _save_stats(stats)
    print("Search counter reset to 0.")


if __name__ == "__main__":
    print("Next 5 search areas:")
    areas = get_next_areas(count=5)
    for area in areas:
        print(f"  {area}")
    
    stats = get_search_stats()
    print(f"\nStats: {stats}")

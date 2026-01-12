import os
import csv
import subprocess
import time
import requests
import json
import shutil
from dotenv import load_dotenv

load_dotenv()

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "template")
WEBSITES_DIR = os.path.join(os.path.dirname(__file__), "content", "websites")
CODE_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "lib", "code.json")
CSV_FILE = os.path.join(os.path.dirname(__file__), "businesses.csv")

OPENCODE_API_KEY = os.environ.get("OPENCODE_API_KEY")
OPENCODE_HOST = os.environ.get("OPENCODE_HOST", "127.0.0.1")
OPENCODE_PORT = os.environ.get("OPENCODE_PORT", "4096")

OPENCODE_BASE_URL = f"http://{OPENCODE_HOST}:{OPENCODE_PORT}"

def sanitize_folder_name(name):
    return "".join(c if c.isalnum or c in " -_" else "_" for c in name).strip()[:50]

def load_code_file():
    if os.path.exists(CODE_FILE):
        try:
            with open(CODE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_code_file(code_data):
    os.makedirs(os.path.dirname(CODE_FILE), exist_ok=True)
    with open(CODE_FILE, "w", encoding="utf-8") as f:
        json.dump(code_data, f, indent=2)
    print(f"Saved code to {CODE_FILE}")

def is_opencode_server_running():
    try:
        response = requests.get(f"{OPENCODE_BASE_URL}/global/health", timeout=2)
        return response.status_code == 200 and response.json().get("healthy")
    except:
        return False

def ensure_opencode_server_running():
    if is_opencode_server_running():
        print(f"OpenCode server already running at {OPENCODE_BASE_URL}")
        return True
    
    print("Starting OpenCode server...")
    try:
        env = os.environ.copy()
        if OPENCODE_API_KEY:
            env["OPENCODE_API_KEY"] = OPENCODE_API_KEY
        
        subprocess.Popen(
            ["opencode", "serve", "--hostname", OPENCODE_HOST, "--port", OPENCODE_PORT],
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        for _ in range(10):
            time.sleep(1)
            if is_opencode_server_running():
                print(f"OpenCode server started at {OPENCODE_BASE_URL}")
                return True
        
        print("Failed to start OpenCode server")
        return False
    except FileNotFoundError:
        print("Error: opencode CLI not found. Install from https://opencode.ai/")
        return False

def run_opencode_session(business_name, prompt, timeout=120):
    session_id = None
    try:
        # Create session with business name
        session_response = requests.post(
            f"{OPENCODE_BASE_URL}/session",
            json={"title": f"Generate website for {business_name}"}
        )
        
        if session_response.status_code != 200:
            print(f"Failed to create session: {session_response.status_code}")
            return False, f"Failed to create session"
        
        session_id = session_response.json().get("id")
        print(f"Created session: {session_id}")
        
        message_response = requests.post(
            f"{OPENCODE_BASE_URL}/session/{session_id}/message",
            json={
                "model": {"providerID": "opencode", "modelID": "grok-code"},
                "parts": [{"type": "text", "text": prompt}]
            }
        )
        
        print(f"Message response status: {message_response.status_code}")
        
        if message_response.status_code == 200 and message_response.text.strip():
            try:
                result = message_response.json()
                print(f"OpenCode response received")
                return True, result
            except:
                pass
        
        if message_response.status_code not in [200, 202]:
            print(f"Response: {message_response.text[:200]}")
            return False, f"Failed to send message: {message_response.status_code}"
        
        print("Waiting for OpenCode agent to complete...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            time.sleep(3)
            
            messages_response = requests.get(
                f"{OPENCODE_BASE_URL}/session/{session_id}/message"
            )
            
            if messages_response.status_code == 200:
                messages = messages_response.json()
                if messages and len(messages) > 0:
                    last_msg = messages[-1]
                    msg_type = last_msg.get("info", {}).get("type", "")
                    if msg_type == "assistant":
                        print(f"OpenCode agent completed")
                        return True, last_msg
            
            print(f"  Still working...")
        
        print("Timeout waiting for OpenCode agent")
        return False, "Timeout"
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return False, str(e)
    
    finally:
        # Clean up session if it was created
        if session_id:
            try:
                delete_response = requests.delete(f"{OPENCODE_BASE_URL}/session/{session_id}")
                if delete_response.status_code == 200:
                    print(f"Cleaned up session: {session_id}")
                else:
                    print(f"Failed to cleanup session: {session_id}")
            except Exception as e:
                print(f"Error cleaning up session: {e}")

def generate_prompt_for_opencode(business_data, folder_path, slug):
    name = business_data.get("name") or "Our Business"
    address = business_data.get("vicinity") or business_data.get("formatted_address") or "Visit us in person"
    phone = business_data.get("formatted_phone_number") or business_data.get("international_phone_number") or "Call us"
    rating = business_data.get("rating") or "N/A"
    reviews = business_data.get("user_ratings_total") or "0"
    price_level = business_data.get("price_level")
    
    types_raw = business_data.get("types", "")
    if isinstance(types_raw, str) and types_raw.startswith("[") and types_raw.endswith("]"):
        import ast
        try:
            types = ast.literal_eval(types_raw)
        except:
            types = [t.strip() for t in types_raw.strip("[]").split(",") if t.strip()]
    elif isinstance(types_raw, list):
        types = types_raw
    else:
        types = [t.strip() for t in str(types_raw).split(",") if t.strip()]
    
    reviews_list_raw = business_data.get("reviews", "")
    if isinstance(reviews_list_raw, str) and reviews_list_raw.startswith("["):
        import ast
        try:
            reviews_list = ast.literal_eval(reviews_list_raw)
        except:
            reviews_list = []
    elif isinstance(reviews_list_raw, list):
        reviews_list = reviews_list_raw
    else:
        reviews_list = []
    
    positive_reviews = [r for r in reviews_list if isinstance(r.get("rating"), (int, float)) and r.get("rating", 0) >= 4]
    
    photo_urls_raw = business_data.get("photo_urls", "")
    if isinstance(photo_urls_raw, str) and "|||" in photo_urls_raw:
        photo_urls = photo_urls_raw.split("|||")
    elif isinstance(photo_urls_raw, list):
        photo_urls = photo_urls_raw
    elif isinstance(photo_urls_raw, str) and photo_urls_raw.startswith("["):
        import ast
        try:
            photo_urls = ast.literal_eval(photo_urls_raw)
        except:
            photo_urls = []
    else:
        photo_urls = []
    
    hours_data = business_data.get("opening_hours")
    if hours_data:
        if isinstance(hours_data, dict) and "weekday_text" in hours_data:
            opening_hours = "; ".join(hours_data["weekday_text"])
        else:
            opening_hours = str(hours_data)
    else:
        opening_hours = "Not available"
    
    review_texts = ""
    if isinstance(positive_reviews, list) and len(positive_reviews) > 0:
        sample_reviews = positive_reviews[:3]
        review_texts = "\nPositive customer reviews (4+ stars):\n"
        for r in sample_reviews:
            author = r.get("author_name", "Customer")
            text = r.get("text", "")[:200]
            rating = r.get("rating", "")
            review_texts += f"- {author} ({rating} stars): \"{text}...\"\n"
    else:
        review_texts = "\nNo positive reviews available."
    
    photos_section = ""
    if photo_urls:
        photos_section = f"\n**Business Photos ({len(photo_urls)} available):**\n" + "\n".join([f"- {url}" for url in photo_urls[:3]])
    
    prompt = f"""You are an expert web developer creating a complete HTML website for a local business.

**Business Information:**
- Name: {name}
- Address: {address}
- Phone: {phone}
- Rating: {rating}/5 ({reviews} reviews)
- Price Level: {"$" * int(price_level) if price_level and price_level != "N/A" else "Not specified"}
- Business Types: {", ".join(types) if types else "Restaurant"}
- Opening Hours: {opening_hours}
{review_texts}{photos_section}

**IMPORTANT: Work in this directory: {folder_path}**

**Website URL:**
When creating the email, use this placeholder for the website URL:
https://locweb.example.com/{slug.replace(" ", "-")}

**Your Task:**

Follow the detailed instructions in AGENTS.md to create a professional HTML website.

**Key Requirements:**
- READ data.json to understand the business
- MODIFY index.html to create a complete website
- Include hero section, business info, photo gallery, footer
- Use Tailwind CSS for all styling
- Make it responsive and professional
- Use real photo URLs from data.json
- Make all links functional

**Critical Rules:**
- DO NOT create additional files EXCEPT email.txt
- DO NOT delete existing files
- Only modify index.html and create email.txt
- Follow AGENTS.md instructions exactly

After modifying index.html and creating email.txt, verify everything is complete and professional."""
    return prompt

def create_temp_workspace(business_data, slug):
    temp_dir = os.path.join(WEBSITES_DIR, f".temp_{slug}")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Create data.json with business info
    with open(os.path.join(temp_dir, "data.json"), "w", encoding="utf-8") as f:
        json.dump(business_data, f, indent=2)
    
    # Copy the HTML template and AGENTS.md
    index_src = os.path.join(TEMPLATE_DIR, "index.html")
    agents_src = os.path.join(TEMPLATE_DIR, "AGENTS.md")
    
    if os.path.exists(index_src):
        shutil.copy2(index_src, os.path.join(temp_dir, "index.html"))
    
    if os.path.exists(agents_src):
        shutil.copy2(agents_src, os.path.join(temp_dir, "AGENTS.md"))
    
    return temp_dir

def parse_generated_code(temp_dir, slug):
    code_data = load_code_file()
    
    # Look for index.html (generated HTML)
    index_file = os.path.join(temp_dir, "index.html")
    
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            code_data[f"{slug}.html"] = f.read()
            print(f"Saved generated HTML to code.json")
    
    # Look for email.txt (but don't save to code.json - only to CSV)
    email_file = os.path.join(temp_dir, "email.txt")
    email_content = None
    if os.path.exists(email_file):
        with open(email_file, "r", encoding="utf-8") as f:
            email_content = f.read()
        print(f"Email generated for {slug}")
    
    save_code_file(code_data)
    print(f"Saved generated code to code.json")
    return email_content

def cleanup_temp_workspace(temp_dir):
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
        print(f"Cleaned up temp directory")

def update_csv_slug(business_name, slug, email_content=None):
    if not os.path.exists(CSV_FILE):
        return False
    
    businesses = []
    all_fields = set()
    
    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            businesses.append(row)
            all_fields.update(row.keys())
    
    updated = False
    for row in businesses:
        if row.get("name", "").lower().strip() == business_name.lower().strip():
            if not row.get("curated"):
                row["curated"] = slug
                if email_content:
                    row["sales_email"] = email_content
                    all_fields.add("sales_email")
                updated = True
                break
    
    if updated:
        all_fields.add("curated")
        sorted_fields = sorted(all_fields)
        
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=sorted_fields, extrasaction="ignore")
            writer.writeheader()
            for row in businesses:
                writer.writerow(row)
        print(f"Updated CSV: {business_name} -> {slug}")
    
    return updated

def generate_website_for_business(business_data, use_opencode=True):
    name = business_data.get("name") or "Unknown Business"
    slug = sanitize_folder_name(name)
    
    if business_data.get("website"):
        print(f"Skipping {name} - already has a website")
        return None
    
    print(f"Curating website for: {name} (slug: {slug})")
    
    if not use_opencode or not OPENCODE_API_KEY:
        os.makedirs(os.path.join(WEBSITES_DIR, slug), exist_ok=True)
        print(f"Folder created at {WEBSITES_DIR}/{slug}")
        if not OPENCODE_API_KEY:
            print("Note: OPENCODE_API_KEY not set - website not generated")
        return None
    
    if not ensure_opencode_server_running():
        print("Could not start OpenCode server, skipping AI customization")
        return None
    
    temp_dir = create_temp_workspace(business_data, slug)
    print(f"Created temp workspace: {temp_dir}")
    
    prompt = generate_prompt_for_opencode(business_data, temp_dir, slug)
    success, result = run_opencode_session(name, prompt)
    
    if success:
        print("OpenCode agent completed successfully")
        email_content = parse_generated_code(temp_dir, slug)
        print(f"Calling update_csv_slug for: {name}")
        updated = update_csv_slug(name, slug, email_content)
        print(f"update_csv_slug returned: {updated}")
        if updated:
            print(f"Updated CSV with slug: {slug}")
    else:
        print(f"OpenCode agent failed: {result}")
        print("Keeping temp directory for debugging")
        cleanup_temp_workspace(temp_dir)
        return None
    
    cleanup_temp_workspace(temp_dir)
    return slug

def load_all_businesses_from_csv():
    if not os.path.exists(CSV_FILE):
        print(f"CSV file not found: {CSV_FILE}")
        return []
    
    businesses = []
    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("website") and not row.get("curated"):
                businesses.append(row)
    
    return businesses

def main():
    print("Website Generator for Local Businesses")
    print("=" * 50)
    
    businesses = load_all_businesses_from_csv()
    
    if not businesses:
        print("No businesses without websites found in CSV")
        return
    
    print(f"Found {len(businesses)} businesses needing websites")
    
    use_opencode = bool(OPENCODE_API_KEY)
    if not use_opencode:
        print("Note: OPENCODE_API_KEY not set")
        return
    
    for i, business in enumerate(businesses, 1):
        print(f"\n[{i}/{len(businesses)}] Processing: {business.get('name', 'Unknown')}")
        generate_website_for_business(business, use_opencode=use_opencode)
    
    print(f"\nDone! Curated {len(businesses)} websites")
    
    websites_dir = os.path.join(os.path.dirname(__file__), "content", "websites")
    if os.path.exists(websites_dir):
        shutil.rmtree(websites_dir)
        print(f"Cleaned up {websites_dir}")
    
    print("\n" + "=" * 60)
    print("SALES EMAILS")
    print("=" * 60)
    
    businesses_with_emails = load_all_businesses_from_csv()
    for row in businesses_with_emails:
        email = row.get("sales_email", "").strip()
        if email:
            print(f"\n--- {row.get('name', 'Unknown')} ---")
            print(email)
            print()

if __name__ == "__main__":
    main()

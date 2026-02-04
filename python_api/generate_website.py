import os
import subprocess
import time
import requests
import json
import shutil
from dotenv import load_dotenv

load_dotenv()

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "template")
PUBLIC_BUSINESSES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "businesses")

OPENCODE_API_KEY = os.environ.get("OPENCODE_API_KEY")
OPENCODE_HOST = os.environ.get("OPENCODE_HOST", "127.0.0.1")
OPENCODE_PORT = os.environ.get("OPENCODE_PORT", "4096")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "contact@locweb.example.com")
OWNER_NAME = os.environ.get("OWNER_NAME", "The LocWeb Team")

OPENCODE_BASE_URL = f"http://{OPENCODE_HOST}:{OPENCODE_PORT}"

def sanitize_folder_name(name):
    return "".join(c if c.isalnum or c in " -_" else "_" for c in name).strip()[:50]

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

def run_opencode_session(business_name, prompt, timeout=600):
    session_id = None
    try:
        session_response = requests.post(
            f"{OPENCODE_BASE_URL}/session",
            json={"title": f"Generate website for {business_name}"},
            timeout=10
        )
        
        if session_response.status_code != 200:
            print(f"Failed to create session: {session_response.status_code}")
            return False, f"Failed to create session"
        
        session_id = session_response.json().get("id")
        print(f"Created session: {session_id}")
        
        message_response = requests.post(
            f"{OPENCODE_BASE_URL}/session/{session_id}/message",
            json={
                "model": {"providerID": "opencode", "modelID": "minimax-m2.1-free"},
                "parts": [{"type": "text", "text": prompt}]
            },
            timeout=30
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
            error_msg = message_response.text[:500] if message_response.text else "No response body"
            print(f"OpenCode error response: {error_msg}")
            return False, f"OpenCode request failed (status {message_response.status_code}): {error_msg}"
        
        print("Waiting for OpenCode agent to complete...")
        start_time = time.time()
        last_question_time = 0
        
        while time.time() - start_time < timeout:
            time.sleep(3)
            
            messages_response = requests.get(
                f"{OPENCODE_BASE_URL}/session/{session_id}/message",
                timeout=10
            )
            
            if messages_response.status_code == 200:
                messages = messages_response.json()
                if messages and len(messages) > 0:
                    last_msg = messages[-1]
                    msg_type = last_msg.get("info", {}).get("type", "")
                    
                    if msg_type == "assistant":
                        print(f"OpenCode agent completed")
                        return True, last_msg
                    
                    # Handle questions - auto-answer to continue execution
                    if msg_type == "question":
                        current_time = time.time()
                        # Avoid flooding with answers - only answer once per 10 seconds per question
                        if current_time - last_question_time > 10:
                            print("  Agent asked a question - answering automatically...")
                            last_question_time = current_time
                            
                            # Send custom answer to continue autonomously
                            answer_response = requests.post(
                                f"{OPENCODE_BASE_URL}/session/{session_id}/custom-answer",
                                json={"answer": "I cannot answer questions. Work autonomously and use your best judgment to make decisions. Do not ask for clarification - proceed with reasonable assumptions."}
                            )
                            
                            if answer_response.status_code != 200:
                                print(f"  Failed to send answer: {answer_response.status_code}")
            
            print(f"  Still working...")
        
        print("Timeout waiting for OpenCode agent")
        return False, "Timeout"
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return False, str(e)
    
    finally:
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
        review_texts = "\n**Positive customer reviews (4+ stars):**\n"
        for r in sample_reviews:
            author = r.get("author_name", "Customer")
            text = r.get("text", "")[:200]
            rating = r.get("rating", "")
            review_texts += f"- {author} ({rating} stars): \"{text}...\"\n"
    else:
        review_texts = "\nNo positive reviews available."
    
    local_photos = business_data.get("local_photos", [])
    photos_section = ""
    if local_photos:
        photos_section = f"\n**Local Photos ({len(local_photos)} available - USE THESE PATHS):**\n" + "\n".join([f"- {url}" for url in local_photos[:3]])
    
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

**Your Task:**

Follow the detailed instructions in AGENTS.md to create a professional HTML website.

**Key Requirements:**
- READ data.json to understand the business
- MODIFY index.html to create a complete website
- Include hero section, business info, photo gallery, footer
- Use Tailwind CSS for all styling
- Make it responsive and professional
- Use LOCAL photo paths from data.json (e.g., "photos/photo-1.jpg") - NOT Google Maps URLs
- Make all links functional

**Critical Rules:**
- DO NOT create additional files EXCEPT phone_pitch.txt
- DO NOT delete existing files
- Only modify index.html and create phone_pitch.txt
- Follow AGENTS.md instructions exactly
- CRITICAL: Use the local photo paths provided in data.json, NOT the Google Maps URLs
- CRITICAL: DO NOT ASK QUESTIONS. Make all decisions autonomously. Do not stop to ask for clarification. If information is missing, make a reasonable assumption and proceed.

After modifying index.html and creating phone_pitch.txt, verify everything is complete and professional."""
    return prompt

def create_business_folder(business_data, slug, photo_paths):
    folder_path = os.path.join(PUBLIC_BUSINESSES_DIR, slug)
    os.makedirs(folder_path, exist_ok=True)
    os.makedirs(os.path.join(folder_path, "photos"), exist_ok=True)
    
    business_data["owner_email"] = OWNER_EMAIL
    business_data["owner_name"] = OWNER_NAME
    business_data["local_photos"] = photo_paths
    
    with open(os.path.join(folder_path, "data.json"), "w", encoding="utf-8") as f:
        json.dump(business_data, f, indent=2)
    
    index_src = os.path.join(TEMPLATE_DIR, "index.html")
    agents_src = os.path.join(TEMPLATE_DIR, "AGENTS.md")
    
    if os.path.exists(index_src):
        shutil.copy2(index_src, os.path.join(folder_path, "index.html"))
    
    if os.path.exists(agents_src):
        shutil.copy2(agents_src, os.path.join(folder_path, "AGENTS.md"))
    
    return folder_path

def generate_website_for_business(business_data, photo_paths=None, use_opencode=True):
    name = business_data.get("name") or "Unknown Business"
    slug = sanitize_folder_name(name)
    
    if business_data.get("website"):
        print(f"Skipping {name} - already has a website")
        return None
    
    print(f"Curating website for: {name} (slug: {slug})")
    
    if not use_opencode or not OPENCODE_API_KEY:
        folder_path = os.path.join(PUBLIC_BUSINESSES_DIR, slug)
        os.makedirs(folder_path, exist_ok=True)
        print(f"Folder created at {folder_path}")
        if not OPENCODE_API_KEY:
            print("Note: OPENCODE_API_KEY not set - website not generated")
        return None
    
    if not ensure_opencode_server_running():
        print("Could not start OpenCode server, skipping AI customization")
        return None
    
    folder_path = create_business_folder(business_data, slug, photo_paths or [])
    print(f"Created business folder: {folder_path}")
    
    prompt = generate_prompt_for_opencode(business_data, folder_path, slug)
    success, result = run_opencode_session(name, prompt)
    
    if success:
        print("OpenCode agent completed successfully")
        
        agents_path = os.path.join(folder_path, "AGENTS.md")
        if os.path.exists(agents_path):
            try:
                os.remove(agents_path)
                print("Cleaned up AGENTS.md")
            except Exception as e:
                print(f"Error removing AGENTS.md: {e}")
                
        print(f"Generated website for: {name}")
    else:
        print(f"OpenCode agent failed: {result}")
        return None
    
    return slug

def main():
    print("Website Generator for Local Businesses")
    print("=" * 50)
    print("Using minimax-m2.1-free model")
    print(f"Output directory: {PUBLIC_BUSINESSES_DIR}")

if __name__ == "__main__":
    main()

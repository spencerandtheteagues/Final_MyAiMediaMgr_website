import requests
import json

# The base URL of the deployed application
BASE_URL = "https://myaimediamgr-prod-256820570287.us-central1.run.app"

# Admin credentials
EMAIL = "spencerandtheteagues@gmail.com"
PASSWORD = "TheMA$TERkey$$"
USERNAME = EMAIL.split('@')[0]

def login():
    """Logs in and returns the auth token and user ID."""
    login_url = f"{BASE_URL}/api/auth/login"
    payload = {
        "username": USERNAME,
        "email": EMAIL,
        "password": PASSWORD
    }
    headers = {"Content-Type": "application/json"}

    print(f"--- 1. Attempting Login for {EMAIL} ---")
    try:
        response = requests.post(login_url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        data = response.json()
        if data.get("success") and "token" in data and "user" in data:
            print("Login successful.")
            return data["token"], data["user"]["id"]
        else:
            print("Login failed. Response:", data)
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"Login request failed: {e}")
        return None, None

def test_generate_content(token, user_id):
    """Tests the AI content generation endpoint."""
    generate_url = f"{BASE_URL}/api/content/generate"
    payload = {
        "theme": "A test prompt about space exploration.",
        "uid": user_id,
        "contentType": "image",
        "platforms": ["twitter", "linkedin"],
        "generateText": True
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    print("\n--- 2. Testing Content Generation Endpoint ---")
    try:
        response = requests.post(generate_url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        data = response.json()
        print("Content generation endpoint response:", json.dumps(data, indent=2))
        if data.get("success") and data.get("data", {}).get("media_url"):
            print("Content generation successful.")
            return True
        else:
            print("Content generation failed.")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Content generation request failed: {e}")
        if e.response:
            print("Response status:", e.response.status_code)
            print("Response body:", e.response.text)
        return False

if __name__ == "__main__":
    print("--- Starting Content Generation Verification ---")
    auth_token, user_id = login()

    if auth_token and user_id:
        print(f"\nLogged in successfully. User ID: {user_id}")
        
        content_ok = test_generate_content(auth_token, user_id)

        print("\n--- Verification Summary ---")
        print(f"Content Generation Test: {'PASS' if content_ok else 'FAIL'}")

        if content_ok:
            print("\nContent generation test passed successfully!")
        else:
            print("\nContent generation test failed.")
    else:
        print("\n--- Verification Summary ---")
        print(f"Login API Test:          FAIL")
        print("\nCould not obtain auth token. Aborting tests.")
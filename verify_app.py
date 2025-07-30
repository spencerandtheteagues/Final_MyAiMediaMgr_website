
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

def test_check_access(token, user_id):
    """Tests the user access check endpoint."""
    access_url = f"{BASE_URL}/api/auth/check-access?user_id={user_id}"
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. Testing Access Check Endpoint ---")
    try:
        response = requests.get(access_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        print("Access check response:", json.dumps(data, indent=2))
        if data.get("success") and data.get("has_access"):
            print("Access check successful.")
            return True
        else:
            print("Access check failed or access denied.")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Access check request failed: {e}")
        return False

def test_user_details(token, user_id):
    """Tests the user details endpoint."""
    details_url = f"{BASE_URL}/api/user/details?user_id={user_id}"
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Testing User Details Endpoint ---")
    try:
        response = requests.get(details_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        print("User details response:", json.dumps(data, indent=2))
        if data.get("success") and "user" in data:
            print("User details fetched successfully.")
            return True
        else:
            print("Failed to fetch user details.")
            return False
    except requests.exceptions.RequestException as e:
        print(f"User details request failed: {e}")
        return False

if __name__ == "__main__":
    print("--- Starting Full Authentication Flow Verification ---")
    auth_token, user_id = login()

    if auth_token and user_id:
        print(f"\nLogged in successfully. User ID: {user_id}")
        
        access_ok = test_check_access(auth_token, user_id)
        details_ok = test_user_details(auth_token, user_id)

        print("\n--- Verification Summary ---")
        print(f"Login API Test:          PASS")
        print(f"Access Check API Test:   {'PASS' if access_ok else 'FAIL'}")
        print(f"User Details API Test:   {'PASS' if details_ok else 'FAIL'}")

        if access_ok and details_ok:
            print("\nAll authentication flow checks passed successfully!")
        else:
            print("\nOne or more authentication flow checks failed.")
    else:
        print("\n--- Verification Summary ---")
        print(f"Login API Test:          FAIL")
        print("\nCould not obtain auth token. Aborting tests.")

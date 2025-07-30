import requests
import json

url = "https://myaimediamgr-prod-256820570287.us-central1.run.app/api/auth/login"
headers = {"Content-Type": "application/json"}
data = {
    "username": "finaltestuser13",
    "password": "testpassword"
}

response = requests.post(url, headers=headers, data=json.dumps(data))

print(response.status_code)
print(response.text)
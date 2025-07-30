import requests
import json

url = "https://myaimediamgr-prod-256820570287.us-central1.run.app/api/users"
headers = {"Content-Type": "application/json"}
data = {
    "username": "finaltestuser11",
    "email": "finaltest11@example.com",
    "password": "testpassword"
}

response = requests.post(url, headers=headers, data=json.dumps(data))

print(response.status_code)
print(response.text)
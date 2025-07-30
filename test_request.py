import requests
import json

url = "https://myaimediamgr-prod-256820570287.us-central1.run.app/api/content/generate"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer demo_token_2"
}
data = {
    "theme": "a grand opening for a new local bookstore",
    "uid": 2,
    "contentType": "text"
}

response = requests.post(url, headers=headers, data=json.dumps(data))

print(response.status_code)
print(response.text)
import requests

url = "https://myaimediamgr-prod-256820570287.us-central1.run.app/api/content/create-manual"
files = {'media': open('placeholder.png', 'rb')}
data = {
    "uid": 2,
    "text": "This is a manually uploaded post with an image!",
    "platforms": '["twitter", "facebook"]'
}

response = requests.post(url, files=files, data=data)

print(response.status_code)
print(response.text)

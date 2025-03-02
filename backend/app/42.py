import time
import requests
import json
from decouple import config

UID = config("42API_UID")
SECRET = config("42API_SECRET")
REDIRECT_URI = "http://127.0.0.1:8000"

def post42(url, payload):
	url = "https://api.intra.42.fr" + url
	payload = payload
	headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
	response = requests.request("POST", url, headers=headers, data=payload)
	return response.json()

def get42(url, payload):
	url = "https://api.intra.42.fr" + url
	payload = payload
	headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
	response = requests.request("GET", url, headers=headers, data=payload)
	return response.json()

wtoken = post42("/oauth/token", {"grant_type": "client_credentials", \
								"client_id": UID, "client_secret": SECRET})
login = "soelalou"
user = get42("/v2/users/" + login, {"access_token": wtoken["access_token"]})

print(user)
print("-----------------")
print(user["image"]["link"])
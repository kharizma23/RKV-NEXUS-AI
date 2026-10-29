import asyncio
import sys
import httpx
from app.main import app

sys.stdout.reconfigure(line_buffering=True)

async def run_diagnostics():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=6.0) as client:
        resp_admin = await client.post("/api/v1/auth/login", json={"email": "admin23@gmail.com", "password": "ADMIN123"})
        admin_token = resp_admin.json()["access_token"]

        resp_fac = await client.post("/api/v1/auth/login", json={"email": "faculty@platform.edu", "password": "Faculty123"})
        fac_token = resp_fac.json()["access_token"]

        resp_stu = await client.post("/api/v1/auth/login", json={"email": "student@platform.edu", "password": "Student123"})
        stu_token = resp_stu.json()["access_token"]

        tokens = {
            "Admin": admin_token,
            "Faculty": fac_token,
            "Student": stu_token
        }

        get_routes = []
        for route in app.routes:
            if hasattr(route, "methods") and "GET" in route.methods:
                path = route.path
                if "{" not in path and not path.startswith(("/docs", "/openapi", "/health")) and path != "/" and "/stream" not in path and "/ws" not in path:
                    get_routes.append((path, route.name))

        get_routes = sorted(list(set(get_routes)))
        print(f"Total static GET routes to test: {len(get_routes)}", flush=True)

        fout = open("failing_endpoints.txt", "w", encoding="utf-8")
        failing_count = 0

        for idx, (path, name) in enumerate(get_routes):
            chosen_roles = ["Admin", "Faculty", "Student"]
            if "/student" in path or "student" in name:
                chosen_roles = ["Student", "Admin", "Faculty"]
            elif "/faculty" in path or "faculty" in name:
                chosen_roles = ["Faculty", "Admin", "Student"]
            elif "/admin" in path:
                chosen_roles = ["Admin", "Faculty", "Student"]

            route_ok = False
            last_err = None

            for role in chosen_roles:
                token = tokens[role]
                headers = {"Authorization": f"Bearer {token}"}
                try:
                    res = await client.get(path, headers=headers)
                    if res.status_code == 200:
                        route_ok = True
                        break
                    elif res.status_code >= 500:
                        last_err = f"[FAIL {res.status_code}] {path} ({role}) -> {res.text[:180]}"
                        break
                    elif res.status_code in (401, 403):
                        continue
                    else:
                        # 404, 400, 422 etc.
                        route_ok = True
                        break
                except Exception as e:
                    last_err = f"[EXCEPTION] {path} ({role}) -> {type(e).__name__}: {str(e)[:180]}"
                    break

            if last_err:
                failing_count += 1
                print(last_err, flush=True)
                fout.write(last_err + "\n")
                fout.flush()
            elif idx % 25 == 0:
                print(f"Progress: {idx}/{len(get_routes)}...", flush=True)

        fout.close()
        print(f"\nCompleted! Total failing endpoints found: {failing_count}", flush=True)

if __name__ == "__main__":
    asyncio.run(run_diagnostics())

import json
import urllib.request

def run_tests():
    print("Testing IUBAT Directory Build...")

    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    assert "Generated for Offline Reference" not in html, "Offline reference header still present!"
    assert "Fraunces" in html, "Fraunces font missing!"
    assert "searchInput" in html, "Search input missing!"
    assert "employeeList" in html, "Employee list container missing!"
    assert "totalEmployees" in html, "totalEmployees missing!"
    assert "totalDepartments" in html, "totalDepartments missing!"
    assert "totalPhotos" in html, "totalPhotos missing!"
    assert "departmentSelect" in html, "Department filter missing!"
    assert "modalOverlay" in html, "Modal overlay missing!"
    assert "data-open-request" in html, "Request button missing!"
    assert "toast" in html, "Toast notification missing!"
    print("[OK] index.html structure verified.")

    with open("js/app.js", "r", encoding="utf-8") as f:
        js = f.read()

    assert 'data-action="copy"' in js, "Copy button action missing in card template!"
    assert 'data-action="share"' in js, "Share button action missing in card template!"
    assert "copyText" in js, "copyText function missing!"
    assert "shareEmployee" in js, "shareEmployee function missing!"
    assert "Employee details copied" in js, "Toast message missing!"
    assert "assets/images/" in js, "Photo path missing!"
    assert "fetchEmployees" in js, "fetchEmployees missing!"
    print("[OK] js/app.js features and actions verified.")

    with open("css/styles.css", "r", encoding="utf-8") as f:
        css = f.read()

    assert "--brand: #187254" in css, "Brand color missing!"
    assert "employee-card--tone-" in css, "Tone styles missing!"
    assert "@media (max-width: 580px)" in css, "Mobile 580px media query missing!"
    assert "modal" in css, "Modal styles missing!"
    print("[OK] css/styles.css styles and responsiveness verified.")

    # Check 609 records
    with open("data/employees.json", "r", encoding="utf-8") as f:
        records = json.load(f)
    assert len(records) == 609, f"Expected 609 records, found {len(records)}"
    print(f"[OK] data/employees.json verified with {len(records)} employees.")

    # Check live HTTP server
    endpoints = [
        "http://localhost:8088/index.html",
        "http://localhost:8088/css/styles.css",
        "http://localhost:8088/css/responsive.css",
        "http://localhost:8088/js/app.js",
        "http://localhost:8088/data/employees.json",
        "http://localhost:8088/assets/images/emp-001.webp",
        "http://localhost:8088/assets/images/logo.png",
    ]
    for url in endpoints:
        res = urllib.request.urlopen(url)
        assert res.status == 200, f"Endpoint failed: {url}"
    print("[OK] All 7 live HTTP endpoints returned 200 OK.")

    print("\nSUCCESS: ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()

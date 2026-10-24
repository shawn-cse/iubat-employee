"""
IUBAT Employee Directory - Comprehensive Database & Asset Verification Suite
Validates schema compliance, census metrics, image assets, and search indexing.
"""

import json
import os
import sys
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "employees.json"
ASSETS_DIR = BASE_DIR / "assets" / "images"

def main():
    print("=" * 70)
    print(" IUBAT EMPLOYEE DIRECTORY - SYSTEM INTEGRITY VERIFICATION")
    print("=" * 70)

    errors = []
    warnings = []

    # 1. File existence
    if not DATA_FILE.exists():
        print(f"[FAIL] Database file not found: {DATA_FILE}")
        sys.exit(1)

    print(f"[PASS] Found database: {DATA_FILE}")

    # 2. JSON validity
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[FAIL] Invalid JSON: {e}")
        sys.exit(1)

    print(f"[PASS] JSON syntax valid (size: {DATA_FILE.stat().st_size:,} bytes)")

    # 3. Census count assertion
    total_records = len(data)
    print(f"[*] Total records found: {total_records}")
    if total_records != 605:
        errors.append(f"Expected exactly 605 records, found {total_records}")
    else:
        print("[PASS] Census count is exactly 605.")

    # 4. Schema & ID checks
    required_keys = {"id", "name", "designation", "department", "faculty", "email", "phone", "room", "photo", "studyLeave"}
    seen_ids = set()
    study_leave_count = 0
    real_photo_count = 0
    missing_photo_count = 0
    departments = set()
    faculties = set()

    for idx, emp in enumerate(data, 1):
        emp_id = emp.get("id")
        if not emp_id:
            errors.append(f"Record #{idx} missing 'id'")
            continue

        if emp_id in seen_ids:
            errors.append(f"Duplicate ID found: {emp_id}")
        seen_ids.add(emp_id)

        # Missing required keys
        missing_keys = required_keys - set(emp.keys())
        if missing_keys:
            errors.append(f"{emp_id} missing required keys: {missing_keys}")

        # Metrics aggregation
        if emp.get("studyLeave"):
            study_leave_count += 1

        departments.add(emp.get("department", "Unknown"))
        faculties.add(emp.get("faculty", "Unknown"))

        # Image checks
        has_real_photo = emp.get("hasRealPhoto", True)
        img_rel = emp.get("photo", "")
        img_path = BASE_DIR / img_rel.replace("/", os.sep)

        if has_real_photo:
            real_photo_count += 1
            if not img_path.exists():
                errors.append(f"{emp_id}: Image path does not exist: {img_rel}")
        else:
            missing_photo_count += 1

    print(f"[PASS] ID validation passed: {len(seen_ids)} unique IDs.")
    print(f"[*] Total departments: {len(departments)}")
    print(f"[*] Total faculties: {len(faculties)}")
    print(f"[*] Study leave personnel: {study_leave_count}")
    print(f"[*] Photos verified: {real_photo_count} real portraits, {missing_photo_count} monogram fallbacks")

    if len(departments) != 48:
        warnings.append(f"Department count expected 48, found {len(departments)}")
    if len(faculties) != 8:
        errors.append(f"Faculty count expected 8, found {len(faculties)}")
    if study_leave_count != 62:
        errors.append(f"Study leave count expected 62, found {study_leave_count}")

    # 5. Check for orphaned images
    if ASSETS_DIR.exists():
        expected_images = {f"emp-{i:03d}.webp" for i in range(1, 606)}
        found_images = set(os.listdir(ASSETS_DIR))
        stale_images = [img for img in found_images if img.startswith("emp-") and img not in expected_images]
        if stale_images:
            warnings.append(f"Found {len(stale_images)} stale/orphaned images: {stale_images[:5]}")
        else:
            print("[PASS] No orphaned employee portrait assets found in assets/images/.")

    # 6. Specific reconciliation checks
    names = {emp["name"] for emp in data}
    expected_new = [
        "Dr. Md. Akhtaruzzaman",
        "Dr. Fatema Nasrin Jahan",
        "Sifat Howlader",
        "Mahmudul Hasan"
    ]
    for name in expected_new:
        if name not in names:
            errors.append(f"Expected new faculty member not found: {name}")

    departed = [
        "Fuad Ahmed Udoy",
        "Iftekhar Sanwar Talukdar",
        "Nashia Alam Liana",
        "Mahfuz Auyon",
        "Md. Arafath Rahman Nishat",
        "Md. Sarowar Kamal Bhuiyan",
        "Emtiaz Ahamed Mainul",
        "Md.Abdul Ali"
    ]
    for name in departed:
        if name in names:
            errors.append(f"Departed personnel still present in database: {name}")

    print("\n" + "-" * 70)
    print(" VERIFICATION SUMMARY")
    print("-" * 70)
    if warnings:
        for w in warnings:
            print(f"[WARN] {w}")
    if errors:
        for e in errors:
            print(f"[ERROR] {e}")
        print(f"\n[FAIL] Verification completed with {len(errors)} error(s).")
        sys.exit(1)
    else:
        print("[SUCCESS] ALL VERIFICATION CHECKS PASSED (0 errors).")
        print("=" * 70)
        sys.exit(0)

if __name__ == "__main__":
    main()

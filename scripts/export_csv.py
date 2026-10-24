"""
IUBAT Employee Directory - CSV Export Utility
Exports normalized employees.json to UTF-8 BOM CSV (Excel-compatible).
"""

import csv
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_FILE = BASE_DIR / "data" / "employees.json"
CSV_FILE = BASE_DIR / "data" / "employees.csv"

def export_csv():
    print(f"Reading {JSON_FILE}...")
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    fieldnames = [
        "id",
        "slNo",
        "name",
        "designation",
        "department",
        "faculty",
        "email",
        "phone",
        "room",
        "ext",
        "qualifications",
        "studyLeave",
        "additionalResponsibility",
        "affiliation",
        "presentAddress",
        "permanentAddress",
        "hasRealPhoto"
    ]

    print(f"Writing {len(data)} records to {CSV_FILE}...")
    with open(CSV_FILE, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for emp in data:
            writer.writerow(emp)

    print(f"[SUCCESS] Exported {len(data)} records to {CSV_FILE} ({CSV_FILE.stat().st_size:,} bytes)")

if __name__ == "__main__":
    export_csv()

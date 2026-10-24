#!/usr/bin/env python3
"""
IUBAT Faculty & Staff Directory — Database Extraction & Rebuild Script

This script parses the authoritative `iubat faculty database/IUBAT.html` roster,
extracts all personnel records, performs validation and canonical normalization,
converts high-resolution portraits to optimized WebP format, and writes the
production `data/employees.json` dataset.

Usage:
    python scripts/rebuild_database.py
"""

import os
import re
import json
import shutil
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_HTML = os.path.join(BASE_DIR, 'iubat faculty database', 'IUBAT.html')
SOURCE_FILES_DIR = os.path.join(BASE_DIR, 'iubat faculty database', 'IUBAT_files')
TARGET_JSON = os.path.join(BASE_DIR, 'data', 'employees.json')
TARGET_IMG_DIR = os.path.join(BASE_DIR, 'assets', 'images')
BACKUP_DIR = os.path.join(BASE_DIR, 'data', 'backup')

dept_to_faculty = {
    "College of Agricultural Sciences": "Faculty of Agricultural Sciences",
    "School of Business": "Faculty of Business Administration",
    "IUBAT School of Computer Science and Engineering": "Faculty of Engineering & Technology",
    "Electrical and Electronic Engineering": "Faculty of Engineering & Technology",
    "Civil Engineering": "Faculty of Engineering & Technology",
    "Mechanical Engineering": "Faculty of Engineering & Technology",
    "Bachelor of Arts in Economics": "Faculty of Arts & Social Sciences",
    "Department of English and Modern Languages": "Faculty of Arts & Social Sciences",
    "Department of Philosophy": "Faculty of Arts & Social Sciences",
    "Department of Psychology": "Faculty of Arts & Social Sciences",
    "College of Arts and Science": "Faculty of Arts & Social Sciences",
    "Department of Chemistry": "Faculty of Basic Sciences",
    "Department of Physics": "Faculty of Basic Sciences",
    "Department of Mathematics": "Faculty of Basic Sciences",
    "Department of Statistics": "Faculty of Basic Sciences",
    "Department of Environmental Science": "Faculty of Basic Sciences",
    "College of Tourism and Hospitality Management": "Faculty of Tourism & Hospitality Management",
    "Department of Public Health": "Faculty of Allied Health Sciences",
    "College of Nursing": "Faculty of Allied Health Sciences",
    "Vice Chancellor's Office": "Administration & Support Services",
    "Pro Vice Chancellor's Office": "Administration & Support Services",
    "Accounts and Audit": "Administration & Support Services",
    "Controller of Examinations": "Administration & Support Services",
    "Office of the Registrar": "Administration & Support Services",
    "Proctor's Office": "Administration & Support Services",
    "Human Resource Department": "Administration & Support Services",
    "Office of Ranking & Recognition": "Administration & Support Services",
    "Technical Training Unit": "Administration & Support Services",
    "Procurement Office": "Administration & Support Services",
    "Miyan Research Institute": "Administration & Support Services",
    "International Program Office": "Administration & Support Services",
    "Professor Mahmuda Khanum Healthcare Centre": "Administration & Support Services",
    "Computer Education and Training Center (CETC)": "Administration & Support Services",
    "Lab Assistant": "Administration & Support Services",
    "Innovation Centre": "Administration & Support Services",
    "Library": "Administration & Support Services",
    "Branding and Public Relations Office": "Administration & Support Services",
    "Admission Office": "Administration & Support Services",
    "University Education Extension Unit (UEEU-KBAD)": "Administration & Support Services",
    "Automation": "Administration & Support Services",
    "Construction and Maintenance": "Administration & Support Services",
    "Transport Division": "Administration & Support Services",
    "Alumni Office": "Administration & Support Services",
    "IQAC Office": "Administration & Support Services",
    "Reception": "Administration & Support Services",
    "Telephone Exchange (PABX)": "Administration & Support Services",
    "Photocopy": "Administration & Support Services",
    "Lift Operating": "Administration & Support Services"
}

canonical_dept_names = {
    "OFFICE OF THE REGISTRAR": "Office of the Registrar",
    "Office of the Registrar": "Office of the Registrar",
    "Proctor`s Office": "Proctor's Office",
    "Proctor's Office": "Proctor's Office",
    "Vice Chancellor`s Office": "Vice Chancellor's Office",
    "Vice Chancellor's Office": "Vice Chancellor's Office",
    "Pro Vice Chancellor`s office": "Pro Vice Chancellor's Office",
    "Pro Vice Chancellor's office": "Pro Vice Chancellor's Office",
    "Pro Vice Chancellor's Office": "Pro Vice Chancellor's Office",
    "University Education Extension Unit ( UEEU-KBAD)": "University Education Extension Unit (UEEU-KBAD)",
    "University Education Extension Unit (UEEU-KBAD)": "University Education Extension Unit (UEEU-KBAD)",
    "Office of Ranking &amp; Recognition": "Office of Ranking & Recognition",
    "Office of Ranking & Recognition": "Office of Ranking & Recognition"
}

def clean_dept_name(raw_name):
    clean = re.sub(r'<[^>]+>', ' ', raw_name)
    clean = re.sub(r'&amp;', '&', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    clean = re.sub(r',\s*IUBAT$', '', clean, flags=re.IGNORECASE).strip()
    return canonical_dept_names.get(clean, clean)

def clean_name(raw_name):
    name = re.sub(r'<[^>]+>', '', raw_name)
    name = re.sub(r'&amp;', '&', name)
    name = re.sub(r'\s+', ' ', name).strip()
    name = re.sub(r'\bDrs\.?\s+', 'Dr. ', name, flags=re.IGNORECASE)
    name = re.sub(r'\bDr\.(?=[A-Za-z])', 'Dr. ', name)
    name = re.sub(r'\bMd\.(?=[A-Za-z])', 'Md. ', name)
    name = re.sub(r'\bSk\.(?=[A-Za-z])', 'Sk. ', name)
    name = re.sub(r'\bProf\.(?=[A-Za-z])', 'Prof. ', name)
    name = re.sub(r'\bProf\b(?!\.)', 'Prof.', name)
    name = re.sub(r'\bEngr\.(?=[A-Za-z])', 'Engr. ', name)
    name = re.sub(r'\s+\d+$', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def clean_designation(raw_desig, name, dept):
    desig = re.sub(r'<[^>]+>', '', raw_desig)
    desig = re.sub(r'&amp;', '&', desig)
    desig = re.sub(r'\s+', ' ', desig).strip()
    desig = re.sub(r'\s*&\s*', ' & ', desig)
    desig = re.sub(r'\s*,\s*', ', ', desig)
    if not desig:
        if "Sujan Chandra Roy" in name:
            desig = "Assistant Professor"
        elif dept == "Photocopy":
            desig = "Photocopy Staff"
        elif dept == "Lift Operating":
            desig = "Lift Operator"
        else:
            desig = "Staff Member"
    return desig

def rebuild():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    os.makedirs(TARGET_IMG_DIR, exist_ok=True)

    if os.path.exists(TARGET_JSON):
        shutil.copy2(TARGET_JSON, os.path.join(BACKUP_DIR, 'employees.backup.json'))

    with open(SOURCE_HTML, 'r', encoding='utf-8', errors='replace') as f:
        html = f.read()

    tbody_m = re.search(r'<tbody id="myTable">(.*?)</tbody>', html, re.DOTALL | re.IGNORECASE)
    if not tbody_m:
        raise ValueError("Could not locate tbody#myTable in source HTML")
    tbody = tbody_m.group(1)
    raw_trs = re.split(r'<tr[^>]*>', tbody)[1:]

    source_files_lookup = {f.lower(): f for f in os.listdir(SOURCE_FILES_DIR)}
    current_dept_header = ""
    employees = []
    emp_counter = 1

    for tr in raw_trs:
        hm = re.search(r'<td colspan="6"[^>]*>(.*?)</td>', tr, re.DOTALL | re.IGNORECASE)
        if hm:
            h = re.sub(r'<[^>]+>', '', hm.group(1)).strip()
            h = clean_dept_name(h)
            current_dept_header = h
            continue

        tds = re.findall(r'<td\b[^>]*>(.*?)</td>', tr, re.DOTALL | re.IGNORECASE)
        if len(tds) < 4:
            continue

        sl_raw = re.sub(r'<[^>]+>', '', tds[0]).strip()
        try:
            sl_no = int(sl_raw)
        except:
            sl_no = emp_counter

        img_m = re.search(r'<img\s+[^>]*src=["\']([^"\']+)["\']', tds[1], re.IGNORECASE)
        raw_img = img_m.group(1).strip() if img_m else ""
        photo_fn = os.path.basename(raw_img)
        has_real_photo = bool(photo_fn and photo_fn.lower() not in ['default.gif', 'facultymember.jpg', 'n/a', ''])
        actual_photo_fn = source_files_lookup.get(photo_fn.lower(), photo_fn) if has_real_photo else ""

        col2 = tds[2]
        b_tags = re.findall(r'<b>(.*?)</b>', col2, re.DOTALL | re.IGNORECASE)
        raw_name = b_tags[0] if len(b_tags) >= 1 else ""
        raw_desig = b_tags[1] if len(b_tags) >= 2 else ""

        qualifications = ""
        qm = re.search(r'</b>(.*?)<b>', col2, re.DOTALL | re.IGNORECASE)
        if qm:
            q = re.sub(r'<!--.*?-->', '', qm.group(1))
            q = re.sub(r'<br\s*/?>', ', ', q, flags=re.IGNORECASE)
            q = re.sub(r'<[^>]+>', '', q)
            q = re.sub(r'&amp;', '&', q)
            q = re.sub(r'\s*,\s*', ', ', q)
            q = re.sub(r'\s+', ' ', q).strip(' ,')
            qualifications = q

        after_b2 = ""
        parts = re.split(r'</b>', col2, flags=re.IGNORECASE)
        if len(parts) >= 3:
            after_b2 = parts[2]
        elif len(parts) == 2:
            after_b2 = parts[1]

        room_m = re.search(r'Room\s*#\s*([^&<\n\r]+)', after_b2, re.IGNORECASE)
        room = room_m.group(1).strip() if room_m else ""
        room = re.sub(r'\s+', ' ', room)
        if room.lower() in ['n/a', 'na', '-', '—']:
            room = ""

        ext_m = re.search(r'Ext\s*#\s*([^<\n\r]+)', after_b2, re.IGNORECASE)
        ext = ext_m.group(1).strip() if ext_m else ""
        ext = re.sub(r'\s*(?:Cell|Mobile|Phone|E-mail).*$', '', ext, flags=re.IGNORECASE).strip()
        ext = re.sub(r'\s+', ' ', ext)
        if ext.lower() in ['n/a', 'na', '-', '—']:
            ext = ""

        cell_m = re.search(r'(?:Cell|Mobile|Phone)\s*:\s*([^<\n\r]+)', after_b2, re.IGNORECASE)
        phone = cell_m.group(1).strip() if cell_m else ""
        phone = re.sub(r'\s*(?:E-mail|Email).*$', '', phone, flags=re.IGNORECASE).strip()
        phone = re.sub(r'\s+', ' ', phone)
        if phone.lower() in ['n/a', 'na', '-', '—']:
            phone = ""

        email_m = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', after_b2)
        email = email_m.group(1).strip().lower() if email_m else ""

        raw_dept = tds[3]
        dept_parts = re.split(r'<br\s*/?>\s*<br\s*/?>', raw_dept, flags=re.IGNORECASE)
        dept_name = clean_dept_name(dept_parts[0])
        if not dept_name:
            dept_name = current_dept_header

        affiliation = ""
        if len(dept_parts) > 1:
            aff = re.sub(r'<[^>]+>', ' ', dept_parts[1]).strip()
            aff = re.sub(r'&amp;', '&', aff)
            aff = re.sub(r'\s+', ' ', aff)
            if aff:
                affiliation = aff

        faculty = dept_to_faculty.get(dept_name, "Administration & Support Services")
        name = clean_name(raw_name)
        designation = clean_designation(raw_desig, name, dept_name)

        office_parts = []
        if room:
            office_parts.append(f"Room #{room}")
        if ext:
            office_parts.append(f"Ext #{ext}")
        office = ", ".join(office_parts)

        add_resp = re.sub(r'<[^>]+>', ' ', tds[4]).strip() if len(tds) > 4 else ""
        add_resp = re.sub(r'&amp;', '&', add_resp)
        add_resp = re.sub(r'\s+', ' ', add_resp)

        res_td = tds[5] if len(tds) > 5 else ""
        study_leave = bool(re.search(r'Study\s*Leave', res_td, re.IGNORECASE))

        pres_m = re.search(r'Present\s*address\s*:\s*(.*?)(?:Permanent\s*Address:|$)', res_td, re.DOTALL | re.IGNORECASE)
        pres_addr = ""
        if pres_m:
            raw_pres = pres_m.group(1)
            raw_pres = re.sub(r'Study\s*Leave', '', raw_pres, flags=re.IGNORECASE)
            raw_pres = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '', raw_pres)
            raw_pres = re.sub(r'<[^>]+>', ' ', raw_pres)
            raw_pres = re.sub(r'\s+', ' ', raw_pres).strip(' :')
            pres_addr = raw_pres

        perm_m = re.search(r'Permanent\s*Address\s*:\s*(.*?)$', res_td, re.DOTALL | re.IGNORECASE)
        perm_addr = ""
        if perm_m:
            raw_perm = perm_m.group(1)
            raw_perm = re.sub(r'<[^>]+>', ' ', raw_perm)
            raw_perm = re.sub(r'Thana/PS\s*:\s*(?:District|$)', '', raw_perm)
            raw_perm = re.sub(r'District\s*:\s*$', '', raw_perm)
            raw_perm = re.sub(r'\s+', ' ', raw_perm).strip(' :')
            perm_addr = raw_perm

        emp_id = f"EMP-{emp_counter:03d}"
        photo_rel_path = f"assets/images/emp-{emp_counter:03d}.webp" if has_real_photo else "assets/images/placeholder-avatar.svg"

        if has_real_photo and actual_photo_fn:
            src_img_path = os.path.join(SOURCE_FILES_DIR, actual_photo_fn)
            dest_img_path = os.path.join(TARGET_IMG_DIR, f"emp-{emp_counter:03d}.webp")
            if os.path.exists(src_img_path):
                try:
                    with Image.open(src_img_path) as im:
                        im = ImageOps.exif_transpose(im)
                        im = im.convert('RGB')
                        w, h = im.size
                        if w > 400 or h > 400:
                            im.thumbnail((400, 400), Image.Resampling.LANCZOS)
                        im.save(dest_img_path, 'WEBP', quality=88, method=4)
                except Exception as e:
                    print(f"Warning: Failed to convert image {src_img_path}: {e}")
                    has_real_photo = False
                    photo_rel_path = "assets/images/placeholder-avatar.svg"
            else:
                has_real_photo = False
                photo_rel_path = "assets/images/placeholder-avatar.svg"

        record = {
            "id": emp_id,
            "employeeId": emp_id,
            "slNo": sl_no,
            "name": name,
            "designation": designation,
            "department": dept_name,
            "section": dept_name,
            "faculty": faculty,
            "qualifications": qualifications,
            "office": office,
            "room": room,
            "ext": ext,
            "phone": phone,
            "email": email,
            "additionalResponsibility": add_resp,
            "affiliation": affiliation,
            "presentAddress": pres_addr,
            "permanentAddress": perm_addr,
            "studyLeave": study_leave,
            "photo": photo_rel_path,
            "originalPhoto": actual_photo_fn if has_real_photo else photo_fn,
            "hasRealPhoto": has_real_photo,
            "sourcePage": 1
        }
        employees.append(record)
        emp_counter += 1

    # Cleanup obsolete images
    for f in os.listdir(TARGET_IMG_DIR):
        m = re.match(r'^emp-(\d+)\.webp$', f)
        if m and int(m.group(1)) > len(employees):
            os.remove(os.path.join(TARGET_IMG_DIR, f))

    with open(TARGET_JSON, 'w', encoding='utf-8') as f:
        json.dump(employees, f, indent=2, ensure_ascii=False)

    print(f"Rebuild completed successfully! {len(employees)} records saved to {TARGET_JSON}.")

if __name__ == '__main__':
    rebuild()

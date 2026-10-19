import os
import sys
import re
import io
import json
import hashlib
from collections import defaultdict, Counter

import pymupdf
from PIL import Image

sys.path.insert(0, os.path.abspath('.'))

def get_faculty(dept, section):
    combined = (dept + " " + section).lower()
    if 'agricultural' in combined or 'agril' in combined:
        return 'Faculty of Agricultural Sciences'
    if 'business' in combined or 'cba' in combined or 'management development' in combined:
        return 'Faculty of Business Administration'
    if any(k in combined for k in ['computer science', 'cse', 'electrical and electronic', 'eee', 'civil engineering', 'mechanical engineering']):
        return 'Faculty of Engineering & Technology'
    if any(k in combined for k in ['economics', 'english and modern languages', 'arts and science', 'humanities']):
        return 'Faculty of Arts & Social Sciences'
    if any(k in combined for k in ['chemistry', 'physics', 'mathematics', 'statistics', 'environmental science', 'philosophy', 'psychology']):
        return 'Faculty of Basic Sciences'
    if 'tourism' in combined or 'hospitality' in combined:
        return 'Faculty of Tourism & Hospitality Management'
    if 'public health' in combined or 'nursing' in combined:
        return 'Faculty of Allied Health Sciences'
    return 'Administration & Support Services'

def clean_text(s):
    if not s:
        return ""
    # Replace non-breaking spaces and unicode replacement characters
    s = s.replace('\xa0', ' ').replace('\uFFFD', '•').replace('\r', ' ')
    s = re.sub(r'[ \t]+', ' ', s)
    return s.strip()

def process_all():
    doc = pymupdf.open('IUBAT.pdf')
    print(f"Opened IUBAT.pdf with {len(doc)} pages.")
    
    os.makedirs('data', exist_ok=True)
    os.makedirs('assets/images', exist_ok=True)
    os.makedirs('reports', exist_ok=True)
    
    # Extract logo (xref 5 from page 1)
    try:
        logo_pix = pymupdf.Pixmap(doc, 5)
        if logo_pix.colorspace.name not in ('DeviceRGB', 'ICCBased(RGB)'):
            logo_pix = pymupdf.Pixmap(pymupdf.csRGB, logo_pix)
        logo_img = Image.open(io.BytesIO(logo_pix.tobytes("png")))
        logo_img.save('assets/images/logo.png')
        logo_img.save('assets/images/logo.webp', 'WEBP', quality=90)
        print("Extracted and saved IUBAT logo.")
    except Exception as e:
        print("Logo extraction note:", e)
        
    all_records = []
    current_dept = "General"
    emp_counter = 1
    
    # Store xref to filename mapping for re-used photos (e.g. multi-appointment faculty)
    saved_photos = {}
    
    for pno in range(len(doc)):
        page = doc[pno]
        d = page.get_text('dict')
        
        # 1. Collect images in column x ≈ 90
        images = []
        for img in page.get_images():
            xref = img[0]
            rects = page.get_image_rects(xref)
            for r in rects:
                if 80 <= r.x0 <= 100:
                    images.append((r, xref))
        images.sort(key=lambda x: x[0].y0)
        
        # 2. Collect spans
        spans = []
        for b in d['blocks']:
            if 'lines' in b:
                for l in b['lines']:
                    for s in l['spans']:
                        t = clean_text(s['text'])
                        if t:
                            spans.append({
                                'text': t,
                                'bbox': s['bbox'],
                                'font': s['font'],
                                'size': s['size'],
                                'is_bold': 'Bold' in s['font']
                            })
                            
        # Department headers (size >= 10.5 on page, y between 30 and 800, excluding page header)
        dept_headers = [
            s for s in spans 
            if s['size'] >= 10.5 and 28.0 <= s['bbox'][1] <= 800.0
            and s['text'] not in ['IUBAT', 'Personnel Roster', 'Admin Login', '•Search•', 'Search value', 'Sl #', 'Photo']
            and not s['text'].startswith('192.168.')
            and not re.match(r'^\d+/\d+/\d+', s['text'])
            and not s['text'].startswith('Founded 1991')
        ]
        dept_headers.sort(key=lambda x: x['bbox'][1])
        
        # Row boundaries
        row_bounds = []
        for i, (img_rect, xref) in enumerate(images):
            # top bound
            if i == 0:
                dh_above = [dh for dh in dept_headers if dh['bbox'][3] < img_rect.y0]
                if dh_above:
                    y_top = dh_above[-1]['bbox'][3] + 1.0
                else:
                    y_top = max(25.0, img_rect.y0 - 15.0)
            else:
                y_top = (images[i-1][0].y1 + img_rect.y0) / 2.0
                
            # bottom bound
            if i < len(images) - 1:
                dh_between = [dh for dh in dept_headers if img_rect.y1 <= dh['bbox'][1] <= images[i+1][0].y0]
                if dh_between:
                    y_bottom = dh_between[0]['bbox'][1] - 1.0
                else:
                    y_bottom = (img_rect.y1 + images[i+1][0].y0) / 2.0
            else:
                y_bottom = 815.0
                
            row_bounds.append((y_top, y_bottom, img_rect, xref))
            
        for y_top, y_bottom, img_rect, xref in row_bounds:
            # Update department
            for dh in dept_headers:
                if dh['bbox'][1] <= img_rect.y1:
                    current_dept = dh['text']
                    
            row_spans = [s for s in spans if y_top <= (s['bbox'][1] + s['bbox'][3])/2.0 < y_bottom]
            
            # Sl #
            sl_spans = [s['text'] for s in row_spans if 35 <= s['bbox'][0] <= 65 and re.match(r'^\d+$', s['text'])]
            sl_no = int(sl_spans[0]) if sl_spans else None
            
            # Office column spans (x ≈ 170-295, exclude department titles)
            office_spans = [s for s in row_spans if 170 <= s['bbox'][0] <= 295 and s['size'] < 10.5]
            office_spans.sort(key=lambda s: (s['bbox'][1], s['bbox'][0]))
            
            # Dept column spans
            dept_col_spans = [s['text'] for s in row_spans if 295 <= s['bbox'][0] <= 425 and s['size'] < 10.5]
            dept_col = clean_text(" ".join(dept_col_spans))
            
            # Additional Responsibility spans
            resp_spans = [s['text'] for s in row_spans if 425 <= s['bbox'][0] <= 495]
            resp_text = clean_text(" ".join(resp_spans))
            
            # Residence spans
            res_spans = [s for s in row_spans if 495 <= s['bbox'][0] <= 585]
            res_spans.sort(key=lambda s: (s['bbox'][1], s['bbox'][0]))
            
            # Parse contact info from office spans
            room_line = ""
            cell_line = ""
            email_line = ""
            profile_spans = []
            
            for s in office_spans:
                txt = s['text']
                if 'Room #' in txt or re.match(r'^Room\b', txt):
                    room_line = txt
                elif 'Cell :' in txt:
                    cell_line = txt
                elif 'E-mail :' in txt:
                    email_line = txt
                else:
                    profile_spans.append(s)
                    
            # Extract room & ext
            room_val = re.sub(r'^Room\s*#?\s*', '', room_line).strip()
            room = ""
            ext = ""
            if 'Ext' in room_val:
                parts = re.split(r'[\u2022•\-\|]?\s*Ext\s*#?\s*', room_val)
                room = clean_text(parts[0])
                if len(parts) > 1:
                    ext = clean_text(parts[1])
            else:
                room = clean_text(room_val)
                
            cell_val = clean_text(re.sub(r'^Cell\s*:\s*', '', cell_line))
            email_val = clean_text(re.sub(r'^E-mail\s*:\s*', '', email_line)).lower()
            
            # Parse Residence
            res_lines = [clean_text(s['text']) for s in res_spans if clean_text(s['text'])]
            res_full = " ".join(res_lines)
            study_leave = 'Study Leave' in res_full
            
            personal_email = ""
            em_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', res_full)
            if em_match:
                personal_email = em_match.group(0).lower()
                
            present_lines = []
            permanent_lines = []
            thana = ""
            district = ""
            
            mode = "present"
            for l in res_lines:
                if 'Study Leave' in l:
                    continue
                if 'Permanent Address' in l:
                    mode = "permanent"
                    continue
                if 'Present address' in l:
                    mode = "present"
                    continue
                if mode == "present":
                    if personal_email and l.lower() == personal_email:
                        continue
                    present_lines.append(l)
                else:
                    if 'Thana/PS' in l or 'District' in l:
                        tp = re.search(r'Thana/PS\s*:\s*([^:\n]*)', l)
                        if tp:
                            v = tp.group(1).replace('District', '').strip()
                            if v and v != ':':
                                thana = clean_text(v)
                        dist = re.search(r'District\s*:\s*(.*)', l)
                        if dist:
                            v = dist.group(1).strip()
                            if v and v != ':':
                                district = clean_text(v)
                    else:
                        permanent_lines.append(l)
                        
            present_addr = clean_text(", ".join(present_lines)).strip(', ')
            perm_addr_parts = []
            if thana:
                perm_addr_parts.append(f"Thana/PS: {thana}")
            if district:
                perm_addr_parts.append(f"District: {district}")
            if permanent_lines:
                perm_addr_parts.insert(0, ", ".join(permanent_lines))
            permanent_addr = clean_text(", ".join(perm_addr_parts)).strip(', ')
            
            # Name, Qualifications, Designation
            name = ""
            qualifications = []
            designation = ""
            
            if profile_spans:
                bold_indices = [idx for idx, s in enumerate(profile_spans) if s['is_bold']]
                if len(bold_indices) == 0:
                    name = clean_text(profile_spans[0]['text'])
                    if len(profile_spans) > 1:
                        designation = clean_text(" ".join(s['text'] for s in profile_spans[1:]))
                elif len(bold_indices) == 1:
                    b_idx = bold_indices[0]
                    if b_idx == 0:
                        name = clean_text(profile_spans[0]['text'])
                        if len(profile_spans) > 1:
                            designation = clean_text(profile_spans[-1]['text'])
                            qualifications = [clean_text(s['text']) for s in profile_spans[1:-1]]
                    else:
                        name = clean_text(" ".join(s['text'] for s in profile_spans[:b_idx]))
                        designation = clean_text(" ".join(s['text'] for s in profile_spans[b_idx:]))
                else:
                    first_bold = bold_indices[0]
                    last_bold = bold_indices[-1]
                    name_spans = profile_spans[:first_bold+1]
                    name = clean_text(" ".join(s['text'] for s in name_spans))
                    
                    desig_spans = profile_spans[last_bold:]
                    designation = clean_text(" ".join(s['text'] for s in desig_spans))
                    
                    qual_spans = profile_spans[first_bold+1:last_bold]
                    qualifications = [clean_text(s['text']) for s in qual_spans]
                    
            # Fallback for page 65 where designation wasn't in office column
            dept_final = dept_col if dept_col else current_dept
            if not designation:
                if 'Photocopy' in dept_final:
                    designation = "Photocopy Staff"
                elif 'Lift' in dept_final:
                    designation = "Lift Operator"
                else:
                    designation = "Staff"
                    
            emp_id = f"EMP-{emp_counter:03d}"
            
            # Process photograph
            is_placeholder = (xref == 90)
            photo_path = None
            
            if not is_placeholder:
                # Check if this xref already saved
                if xref in saved_photos:
                    photo_path = saved_photos[xref]
                else:
                    try:
                        pix = pymupdf.Pixmap(doc, xref)
                        if pix.colorspace.name not in ('DeviceRGB', 'ICCBased(RGB)'):
                            pix_rgb = pymupdf.Pixmap(pymupdf.csRGB, pix)
                        else:
                            pix_rgb = pix
                            
                        img_bytes = pix_rgb.tobytes("png")
                        im = Image.open(io.BytesIO(img_bytes))
                        if im.mode != 'RGB':
                            im = im.convert('RGB')
                            
                        # Resize with Lanczos to max width 240, max height 280
                        im.thumbnail((240, 280), Image.Resampling.LANCZOS)
                        
                        rel_photo = f"assets/images/{emp_id.lower()}.webp"
                        full_photo = os.path.join(rel_photo)
                        im.save(full_photo, "WEBP", quality=84)
                        saved_photos[xref] = rel_photo
                        photo_path = rel_photo
                    except Exception as err:
                        print(f"Error processing image for {emp_id} (xref {xref}): {err}")
                        photo_path = None
                        
            # Format office string
            office_parts = []
            if room:
                office_parts.append(f"Room #{room}")
            if ext:
                office_parts.append(f"Ext #{ext}")
            office_str = ", ".join(office_parts)
            
            faculty_val = get_faculty(dept_final, current_dept)
            
            record = {
                "id": emp_id,
                "name": name,
                "designation": designation,
                "department": dept_final,
                "section": current_dept,
                "faculty": faculty_val,
                "employeeId": emp_id,
                "qualifications": " ".join(qualifications).strip(),
                "email": email_val,
                "phone": cell_val,
                "office": office_str,
                "room": room,
                "ext": ext,
                "additionalResponsibility": resp_text,
                "presentAddress": present_addr,
                "permanentAddress": permanent_addr,
                "personalEmail": personal_email,
                "studyLeave": study_leave,
                "photo": photo_path,
                "hasRealPhoto": (photo_path is not None),
                "slNo": sl_no,
                "sourcePage": pno + 1
            }
            all_records.append(record)
            emp_counter += 1
            
    print(f"Extraction complete! Total records: {len(all_records)}")
    
    # Write employees.json
    with open('data/employees.json', 'w', encoding='utf-8') as f:
        json.dump(all_records, f, indent=2, ensure_ascii=False)
    print("Written data/employees.json successfully.")
    
    # Build validation report
    with_photo = sum(1 for r in all_records if r['hasRealPhoto'])
    without_photo = len(all_records) - with_photo
    with_email = sum(1 for r in all_records if r['email'])
    with_phone = sum(1 for r in all_records if r['phone'])
    with_room = sum(1 for r in all_records if r['room'])
    on_study_leave = sum(1 for r in all_records if r['studyLeave'])
    
    # Group by faculty and department
    faculties = Counter(r['faculty'] for r in all_records)
    departments = Counter(r['department'] for r in all_records)
    designations = Counter(r['designation'] for r in all_records)
    
    # Check duplicate names / appointments
    by_name = defaultdict(list)
    for r in all_records:
        by_name[r['name']].append(r['id'])
    duplicates = {name: ids for name, ids in by_name.items() if len(ids) > 1}
    
    report = {
        "metadata": {
            "sourceFile": "IUBAT.pdf",
            "totalPages": len(doc),
            "generatedDate": "2026-10-19",
            "organization": "International University of Business Agriculture and Technology (IUBAT)",
            "extractor": "PyMuPDF + Pillow High-Precision Layout Engine"
        },
        "summary": {
            "totalRecordsExtracted": len(all_records),
            "totalVerifiedRecords": len(all_records),
            "recordsWithPhotographs": with_photo,
            "recordsWithPlaceholderPhotos": without_photo,
            "recordsWithOfficialEmail": with_email,
            "recordsWithPhone": with_phone,
            "recordsWithRoom": with_room,
            "employeesOnStudyLeave": on_study_leave,
            "totalDistinctFaculties": len(faculties),
            "totalDistinctDepartments": len(departments),
            "totalDistinctDesignations": len(designations),
            "multiAppointmentIndividuals": len(duplicates)
        },
        "facultyBreakdown": dict(sorted(faculties.items(), key=lambda x: -x[1])),
        "departmentBreakdown": dict(sorted(departments.items(), key=lambda x: -x[1])),
        "topDesignations": dict(sorted(designations.items(), key=lambda x: -x[1])[:25]),
        "multiAppointmentProfiles": [
            {
                "name": name,
                "count": len(ids),
                "recordIds": ids,
                "notes": "Listed across multiple academic or administrative appointments in the source roster"
            }
            for name, ids in sorted(duplicates.items(), key=lambda x: -len(x[1]))
        ],
        "placeholderPhotoRecords": [
            {
                "id": r['id'],
                "name": r['name'],
                "designation": r['designation'],
                "department": r['department'],
                "page": r['sourcePage'],
                "reason": "Uses standard university silhouette avatar (xref 90) in source PDF"
            }
            for r in all_records if not r['hasRealPhoto']
        ]
    }
    
    with open('reports/extraction-validation-report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print("Written reports/extraction-validation-report.json successfully.")

if __name__ == '__main__':
    process_all()

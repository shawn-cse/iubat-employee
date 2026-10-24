# Database Schema & Data Dictionary: IUBAT Employee Directory

This specification documents the schema, field types, constraints, and organizational hierarchy of [`data/employees.json`](file:///d:/001_LO/Coding/iubat-employee-main/data/employees.json).

---

## 1. Schema Overview

- **Primary Storage:** JSON Array of objects in [`data/employees.json`](file:///d:/001_LO/Coding/iubat-employee-main/data/employees.json).
- **Secondary Export:** UTF-8 BOM CSV in [`data/employees.csv`](file:///d:/001_LO/Coding/iubat-employee-main/data/employees.csv).
- **Total Record Count:** Exactly 605 active personnel.
- **Unique Identifier:** `EMP-001` through `EMP-605`.

---

## 2. Field Specifications

| Field Name | Type | Required | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | **Yes** | Unique primary key formatted as `EMP-###`. | `"EMP-001"` |
| `employeeId` | `string` | **Yes** | Standardized employee reference ID. | `"EMP-001"` |
| `slNo` | `integer` | **Yes** | 1-based sequential ordering index. | `1` |
| `name` | `string` | **Yes** | Full academic/honorific title and name. | `"Professor Dr. Engr. Mohammad Abu Eusuf"` |
| `designation` | `string` | **Yes** | Official university title or appointment. | `"Professor & Dean"` |
| `department` | `string` | **Yes** | Canonical department or administrative office. | `"Civil Engineering"` |
| `section` | `string` | No | Operational sub-unit or section. | `"College of Agricultural Sciences"` |
| `faculty` | `string` | **Yes** | Overarching academic faculty or executive division. | `"Faculty of Engineering & Technology"` |
| `qualifications` | `string` | No | Earned degrees, certifications, and granting universities. | `"Ph.D (Japan), M.Sc (BUET), B.Sc (BUET)"` |
| `office` | `string` | No | Raw office and telephone extension text. | `"Room #426, Ext #412"` |
| `room` | `string` | No | Extracted office room number. | `"426"` |
| `ext` | `string` | No | Extracted internal telephone PBX extension. | `"412"` |
| `phone` | `string` | No | Official direct mobile or desk contact number. | `"01711423009"` |
| `email` | `string` | No | Official university email address (`@iubat.edu`). | `"eusuf@iubat.edu"` |
| `additionalResponsibility`| `string` | No | Secondary appointments (e.g., Proctor, Coordinator). | `"Proctor"` |
| `affiliation` | `string` | No | Institutional external affiliations for Adjuncts. | `"Universiti Sains Malaysia"` |
| `presentAddress` | `string` | No | Campus or residential address on record. | `"Dhaka, Bangladesh"` |
| `permanentAddress` | `string` | No | Home district or permanent address on record. | `"Cumilla, Bangladesh"` |
| `studyLeave` | `boolean` | **Yes** | Flag indicating academic study leave status. | `true` or `false` |
| `photo` | `string` | **Yes** | Relative path to optimized WebP portrait. | `"assets/images/emp-001.webp"` |
| `originalPhoto` | `string` | No | Filename of original JPEG portrait from source. | `"DrIsmailHossainAgr.jpg"` |
| `hasRealPhoto` | `boolean` | **Yes** | `false` if entry uses default university placeholder. | `true` |
| `sourcePage` | `integer` | **Yes** | Source pagination index from university directory. | `1` |

---

## 3. Academic Faculties (8 Groups)

All 48 departments roll up into one of the following 8 faculties:

1. **Faculty of Engineering & Technology (FET):**
   - Civil Engineering (CE)
   - Computer Science & Engineering (CSE)
   - Electrical & Electronic Engineering (EEE)
   - Mechanical Engineering (ME)
2. **Faculty of Business Administration (FBA):**
   - Bachelor of Business Administration (BBA)
   - Master of Business Administration (MBA)
3. **Faculty of Agricultural Sciences (FAS):**
   - College of Agricultural Sciences (CAS)
4. **Faculty of Nursing (FN):**
   - College of Nursing (CON)
5. **Faculty of Tourism & Hospitality Management (FTHM):**
   - College of Tourism & Hospitality Management (CTHM)
6. **Faculty of Arts & Sciences (FASc):**
   - Department of Languages (English)
   - Department of Economics
   - Department of Mathematics
   - Department of Physics
   - Department of Chemistry
   - Department of Sociology
7. **Executive & Central Administration:**
   - Office of the Chairman / Board of Trustees
   - Vice Chancellor's Office
   - Pro-Vice Chancellor's Office
   - Treasurer's Office
   - Office of the Registrar
   - Proctor's Office
   - Office of the Controller of Examinations
   - Academic Planning & Quality Assurance
8. **Administrative & Campus Operations:**
   - Engineering & Operations (Maintenance, Electrical, Civil)
   - Information Technology Support (ITSO)
   - Library & Information Center
   - Finance & Accounts
   - Medical Center
   - Transport Department
   - Security & Safety Department
   - Student Affairs & Placement (DSA)
   - Admissions & Public Relations

---

## 4. Reconciliation History (Census Correction)

The dataset was reconciled against [`iubat faculty database/IUBAT.html`](file:///d:/001_LO/Coding/iubat-employee-main/iubat%20faculty%20database/IUBAT.html):

| Metric | Old Database | Authoritative Source | Reconciliation Action |
| :--- | :---: | :---: | :--- |
| **Total Records** | 609 | **605** | Removed 8 departed records; added 4 new appointments. |
| **Active Faculties** | 8 | **8** | Preserved canonical mapping. |
| **Departments** | 48 | **48** | Canonicalized department names and naming consistency. |
| **Study Leave** | 0 (Untracked) | **62** | Extracted `(On Study Leave)` suffix into boolean field. |
| **Monogram Fallbacks** | 0 | **12** | Generated SVG fallbacks for missing portraits. |
| **Image Format** | Stale / Mixed | **WebP** | All 593 portraits converted to lightweight WebP. |

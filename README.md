# IUBAT Employee Roster

A modern, fast, accessible, and responsive employee directory website for the **International University of Business Agriculture and Technology (IUBAT)**.

Built with **100% Vanilla HTML5, CSS3, and modern ES6+ JavaScript**. Zero external frameworks, zero third-party UI libraries, and zero backend or database requirements. Runs as a high-performance static website on any static hosting environment (GitHub Pages, Cloudflare Pages, Netlify, Vercel, or Apache/Nginx).

---

## 1. Directory Overview & Census Metrics

- **Institution:** International University of Business Agriculture and Technology (IUBAT)
- **Source Document:** `IUBAT.pdf` (65 pages, institutional personnel roster)
- **Total Verified Employees:** **609**
- **Employees with Real Photographs:** **597** (high-resolution WebP portraits)
- **Placeholder Silhouette Records:** **12** (clean initials avatar fallback)
- **Faculties Represented:** **8**
- **Departments & Administrative Divisions:** **48**
- **Designations / Roles:** **155**
- **Architecture:** 100% Static Web Application (HTML5 / Vanilla CSS3 / Vanilla ES6+ JS / JSON)

---

## 2. Key Features & User Experience

- **Aesthetic UI & Typography:**
  - Editorial headings styled with **Fraunces** serif typography.
  - Clean interface layout using **Plus Jakarta Sans**.
  - Crisp room numbers, emails, and phone digits rendered in **IBM Plex Mono**.
  - Vibrant emerald and forest green brand theme (`#187254`, `#36a875`) with soft glowing hero orbs.
- **Instant Search:**
  - Real-time debounced search across names, designations, departments, rooms, extensions, emails, phone numbers, and academic qualifications.
  - One-click clear search button (`X`) and keyboard shortcut (`/`) to focus the search bar immediately.
- **Department Filter & View Switching:**
  - Live Department dropdown filter populated dynamically from the 48 campus departments.
  - One-click switcher between responsive **Card Grid View** and compact **List View** (preference persisted in `localStorage`).
- **Tone-Coded Employee Cards:**
  - 6 color-coded tone cards with 3px top accent lines and subtle tinted backgrounds.
  - Real employee portrait images loaded with lazy-loading and asynchronous decoding.
  - Direct contact pills with dedicated colored badge icons for Email and Phone.
- **One-Click Copy & Native Share Actions:**
  - **Copy Details:** Formats and copies employee contact details to clipboard with an animated toast notification.
  - **Native Share:** Uses the modern Web Share API (`navigator.share`) with seamless clipboard fallback on desktop.
- **Interactive Modals:**
  - **Profile Modal:** Comprehensive modal showcasing high-resolution portrait, academic qualifications, department, office/extension, address, source page, and direct actions (*Send email, Call, Copy details, Share*).
  - **Directory Support Modal ("Request / Update"):** Accessible via the header button and floating action button (FAB) for reporting updates through Email, Facebook, and WhatsApp.
- **Phone & Mobile Responsiveness:**
  - Fluid mobile layout optimized across 320px, 375px, 414px, 768px, and desktop viewports.
  - Touch targets meeting WCAG 2.2 standards (`>= 44x44px`).
  - Mobile bottom-sheet modal on smartphones with rounded top corners.

---

## 3. Repository Structure

```text
iubat-employee-main/
├── index.html                           # Main directory interface
├── 404.html                             # Custom branded 404 page
├── robots.txt                           # Search engine crawling rules
├── sitemap.xml                          # XML sitemap
├── README.md                            # Documentation and run guide
├── LICENSE                              # MIT License
│
├── css/
│   ├── styles.css                       # Core styles, design tokens, tone cards & modals
│   ├── responsive.css                   # Mobile-first breakpoints & touch target tuning
│   └── print.css                        # Paper-friendly print & PDF export styles
│
├── js/
│   └── app.js                           # Complete application coordinator (search, modal, copy/share)
│
├── data/
│   └── employees.json                   # Verified dataset of 609 employee records
│
├── assets/
│   ├── favicon.svg                      # University crest favicon
│   └── images/
│       ├── logo.png                     # Official IUBAT crest
│       ├── logo.webp                    # WebP university crest
│       ├── logo.svg                     # Vector crest logo
│       ├── placeholder-avatar.svg       # SVG fallback avatar
│       └── emp-001.webp - emp-609.webp  # Extracted high-quality portrait photographs
│
├── reports/
│   └── extraction-validation-report.json # Comprehensive data extraction audit report
│
└── preparation/                         # Data extraction and verification tools
    ├── generate_dataset_and_images.py   # PDF extraction and WebP portrait generator
    └── verify_all.py                    # Automated test suite for data, assets & endpoints
```

---

## 4. How to Run Locally

Because modern web browsers enforce CORS restrictions on `fetch()` calls when opened directly from `file://` URLs, serve the folder using any lightweight local static server.

### Option 1: Python HTTP Server (Recommended)

Run in your terminal from the project root:

```bash
python -m http.server 8088
```

Then visit:
```text
http://localhost:8088/
```

### Option 2: Node.js (npx serve or http-server)

```bash
npx serve .
```

### Option 3: VS Code Live Server

Right-click `index.html` in VS Code and choose **Open with Live Server**.

---

## 5. Running Automated Verification

To verify that all assets, 609 employee records, and endpoints are healthy, run:

```bash
python preparation/verify_all.py
```

This verifies:
- `index.html` semantic structure, headings, and controls.
- `js/app.js` copy/share handlers, search engine, and modal workflows.
- `css/styles.css` brand tokens, tone card themes, and responsive queries.
- `data/employees.json` complete 609 employee records.
- Live HTTP endpoints returning `200 OK`.

---

## 6. License

This project is licensed under the [MIT License](LICENSE).
Employee information and photographs are intellectual property of the **International University of Business Agriculture and Technology (IUBAT)**.

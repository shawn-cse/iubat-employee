# IUBAT Employee Roster — Faculty & Staff Directory

<p align="center">
  <img src="assets/images/logo.png" alt="IUBAT Official Logo" width="110" height="110" />
</p>

<p align="center">
  <strong>International University of Business Agriculture and Technology (IUBAT)</strong><br />
  <em>The First Non-Government University in Bangladesh (Established 1991)</em>
</p>

<p align="center">
  <a href="https://github.com/shawn-cse/iubat-employee"><img src="https://img.shields.io/badge/Platform-Static%20Web%20App-155f45?style=for-the-badge&logo=html5&logoColor=white" alt="Platform Static Web App" /></a>
  <a href="https://github.com/shawn-cse/iubat-employee"><img src="https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla ES6+" /></a>
  <a href="https://github.com/shawn-cse/iubat-employee"><img src="https://img.shields.io/badge/CSS3-Modern%20Design%20Tokens-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3 Design Tokens" /></a>
  <a href="https://github.com/shawn-cse/iubat-employee"><img src="https://img.shields.io/badge/Employees-609%20Verified-2fa874?style=for-the-badge" alt="609 Verified Employees" /></a>
  <a href="https://github.com/shawn-cse/iubat-employee"><img src="https://img.shields.io/badge/Dependencies-Zero-success?style=for-the-badge" alt="Zero Dependencies" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" /></a>
</p>

---

A fast, accessible, responsive, and lightweight faculty and staff directory built for the **International University of Business Agriculture and Technology (IUBAT)**. 

Engineered with **100% Vanilla HTML5, CSS3, and modern ES6+ JavaScript** with **zero third-party dependencies**, **zero npm build steps**, and **zero external UI frameworks**. Delivers near-instant search and contact discovery across **609 campus employees** and **48 academic and administrative departments**.

---

## Visual Showcase

### Desktop Roster View
Crisp, multi-column tone-coded employee cards with lazy-loaded portraits, contact badges, live department filtering, and view toggling.
![Desktop View](screenshots/desktop-roster.png)

---

### Tablet Roster View
Adaptive dual-column layout with fluid touch targets and instant keyboard shortcuts (`/` to search, `Esc` to close modals).
![Tablet View](screenshots/tablet-roster.png)

---

### Mobile View & Smart Keyboard-Aware Search UI
| Standard Mobile Roster | Active Search (Above Virtual Keyboard) |
| :---: | :---: |
| ![Standard Mobile View](screenshots/mobile-roster.png) | ![Active Mobile Search](screenshots/mobile-search.png) |
| *Streamlined hero with instant access to contacts* | *Hero auto-collapses to sticky bar; results stay 100% visible above keyboard* |

---

## 1. Directory Overview & Census Metrics

| Metric | Count | Details |
| :--- | :--- | :--- |
| **Total Verified Personnel** | **609** | 100% verified institutional roster entries |
| **Employees with Portraits** | **597** | High-resolution WebP photographs (`assets/images/emp-*.webp`) |
| **Initial Avatar Fallbacks** | **12** | Clean dynamic monogram avatars with high-contrast palette |
| **Academic Faculties** | **8** | Agricultural Sciences, Business, Engineering, Nursing, etc. |
| **Departments & Divisions** | **48** | Academic departments, research institutes, and administrative units |
| **Unique Designations / Roles** | **155** | Professors, Chairs, Registrars, Officers, Technical Staff |
| **Runtime Dependencies** | **0** | Pure vanilla web standards; zero runtime or build overhead |

### Top Departments by Personnel Count

| Department / Division | Personnel |
| :--- | :---: |
| **IUBAT School of Computer Science and Engineering (CSE)** | **79** |
| **School of Business (BBA / MBA)** | **52** |
| **Department of English and Modern Languages** | **47** |
| **Department of Civil Engineering (CE)** | **42** |
| **College of Agricultural Sciences (CAS)** | **36** |
| **Department of Electrical and Electronic Engineering (EEE)** | **29** |
| **College of Nursing (CON)** | **26** |
| **Department of Mechanical Engineering (ME)** | **25** |
| **Department of Mathematics** | **23** |
| **Lab Assistants & Technical Staff** | **23** |
| **Office of the Registrar** | **18** |
| **Department of Physics** | **12** |
| **Computer Education and Training Center (CETC)** | **12** |
| **Department of Economics** | **11** |
| **Department of Psychology** | **11** |
| **College of Tourism and Hospitality Management (CTHM)** | **11** |
| **Construction and Maintenance Division** | **11** |

---

## 2. Key Features & Architectural Highlights

### 📱 Smart Mobile Keyboard Occlusion Fix
On smartphones, opening the virtual keyboard typically consumes 40–50% of vertical screen height. Standard headers push search results off-screen:
- **Auto-Docking Hero:** When the search input is focused or typed into on mobile screens (`<= 768px`), the large university hero banner automatically collapses into a **slim 52px sticky search bar**.
- **Compact Results Counter:** The directory title collapses into a single-line summary (`Showing 1 of 609 employees`), allocating **over 350px of visible viewport height directly to result cards**.
- **Smooth Auto-Scroll:** Typing automatically aligns the search bar to the top of the viewport so users immediately see employee results as they type.
- **No Native Browser Duplicate Buttons:** Explicitly disables WebKit search cancel decorations (`::-webkit-search-cancel-button`), ensuring only the custom clear button (`X`) is visible.
- **Auto-Zoom Prevention:** Search input is styled with `font-size: 16px` on mobile, preventing mobile Safari and Chrome from jarringly zooming into the page.

### ⚡ Instant Multi-Field Client-Side Search
- Searches across **13 distinct attributes** simultaneously: Name, Designation, Department, Faculty, Section, Office Room, Phone Extension, Email Address, Mobile Number, Qualifications, and Address.
- Debounced with `requestAnimationFrame` for buttery 60 FPS typing response.
- **URL Deep-Linking:** Supports initial query strings (`?q=rizna` or `?dept=CSE`) to allow sharing direct links to specific employees or departments.
- Pressing `/` anywhere on desktop instantly focuses and selects the search input.

### 🎨 Modern Typography & Color-Coded Tone Cards
- **Plus Jakarta Sans:** Crisp geometric sans-serif typeface with weights ranging from 400 to 800, replacing bulky traditional serifs with modern institutional clarity.
- **Legible Proportions:** High-contrast 15px base text, 16.5px bold employee names, 13.5px role badges, and 12.5px contact pills.
- **6 Tone Variants:** Cards dynamically rotate through 6 cohesive border and tint themes (Emerald Green, Teal, Indigo Blue, Violet, Amber Gold, Rose).
- **View Toggle:** Seamlessly switch between **Card Grid View** and compact **List View** with preferences saved to `localStorage`.

### 📋 One-Click Copy & Native Web Share
- **Copy Details:** Formats employee name, role, department, room, phone, and email into clean text and copies directly to the clipboard with an animated status toast.
- **Native Web Share:** Leverages `navigator.share` on mobile devices for sharing to WhatsApp, Messenger, or SMS, with seamless clipboard fallback on desktop.

### 🛡️ Offline Resilience & Fast Caching
- Saves directory data locally to `localStorage` on initial load. If network connectivity drops or the user revisits offline, the directory loads instantly with a discreet notification.

---

## 3. Complete Repository Structure

```text
iubat-employee-main/
│
├── index.html                           # Main interactive directory page
├── 404.html                             # Custom branded 404 error page
├── robots.txt                           # Search engine crawling directives
├── sitemap.xml                          # Search engine XML sitemap
├── README.md                            # Comprehensive project documentation
├── LICENSE                              # MIT Open Source License
│
├── css/
│   ├── styles.css                       # Core design system tokens, typography, hero & cards
│   ├── responsive.css                   # Fine-grained responsive breakpoints & touch-target tuning
│   └── print.css                        # Paper-friendly print and PDF export stylesheet
│
├── js/
│   └── app.js                           # Complete coordinator (search index, modal, copy/share, cache)
│
├── data/
│   └── employees.json                   # Verified dataset of 609 IUBAT employee records
│
├── assets/
│   ├── favicon.svg                      # Scalable SVG university crest favicon
│   └── images/
│       ├── logo.png                     # Official IUBAT crest (PNG)
│       ├── logo.webp                    # WebP university crest
│       ├── logo.svg                     # Vector crest logo
│       ├── placeholder-avatar.svg       # SVG fallback avatar silhouette
│       └── emp-001.webp - emp-609.webp  # Extracted high-quality portrait photographs (597 files)
│
└── screenshots/                         # High-resolution documentation screenshots
    ├── desktop-roster.png               # Desktop grid view (1280x820)
    ├── tablet-roster.png                # Tablet view (768x1024)
    ├── mobile-roster.png                # Standard mobile view (390x844)
    └── mobile-search.png                # Mobile search view above on-screen keyboard
```

### File & Directory Summary

- **`index.html`**: Semantic HTML5 interface containing the accessible header, collapsible hero, stats pills, instant search bar, department filter dropdown, view switcher, loading skeleton, error states, and modal overlays.
- **`css/styles.css`**: Complete design token architecture using CSS custom properties (`--brand`, `--ink`, `--surface`, `--accent-*`), typography scale, tone card layouts, modal dialogs, and mobile keyboard-aware collapse rules.
- **`css/responsive.css`**: Media queries ensuring WCAG 2.2 touch-target compliance (`>= 44x44px`), small-screen typography scaling (<= 360px), and landscape viewport handling.
- **`js/app.js`**: Vanilla JavaScript coordinator featuring state management, client-side search normalization, fuzzy token matching, DOM caching, URL parameter parsing, keyboard navigation, copy/share actions, and offline caching.
- **`data/employees.json`**: Verified and structured database of 609 university employees including official names, designations, departments, rooms, extensions, emails, phone numbers, and portrait file paths.
- **`assets/images/`**: Houses all 597 WebP employee portraits along with the university crest in PNG, WebP, and SVG formats.

---

## 4. How to Run Locally

Because modern web browsers enforce CORS restrictions on `fetch()` calls when opened directly via the `file://` protocol, serve the project folder using any static web server:

### Option 1: Python Built-in Server (Recommended)

Run directly from the project root in your terminal:

```bash
# Python 3
python -m http.server 8088
```

Open your browser and navigate to:
```text
http://localhost:8088/
```

### Option 2: Node.js (`npx serve` or `http-server`)

```bash
# Using npx (no installation required)
npx serve . -p 8088
```

### Option 3: VS Code Live Server Extension

1. Open the `iubat-employee-main` folder in **VS Code**.
2. Right-click [`index.html`](file:///d:/001_LO/Coding/iubat-employee-main/index.html) and select **Open with Live Server**.

### Option 4: Docker / Nginx Container

```bash
docker run --rm -p 8088:80 -v $(pwd):/usr/share/nginx/html:ro nginx:alpine
```

---

## 5. Developer Information

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/shawn-cse.png" width="130" height="130" style="border-radius: 50%;" alt="Shawn" /><br />
      <strong>Shawn</strong><br />
      <em>Software Engineer & Web Developer</em><br />
      Department of Computer Science and Engineering (CSE)<br />
      <strong>International University of Business Agriculture and Technology (IUBAT)</strong>
    </td>
  </tr>
</table>

### Connect & Support

- **GitHub:** [@shawn-cse](https://github.com/shawn-cse)
- **Email:** [shawn.cse@yahoo.com](mailto:shawn.cse@yahoo.com)
- **Facebook:** [shawnazd](https://facebook.com/shawnazd)
- **WhatsApp:** [+880 1873-319733](https://wa.me/8801873319733)
- **Project Repository:** [github.com/shawn-cse/iubat-employee](https://github.com/shawn-cse/iubat-employee)

Have an update for an employee listing, room change, or new joining? Use the in-app **Request / Update** button or contact directly via Email or WhatsApp.

---

## 6. License & Disclaimer

This project is open-source and released under the **[MIT License](LICENSE)**.

*Employee data, photographs, and university insignias are the intellectual property of the **International University of Business Agriculture and Technology (IUBAT)**. This application is an independent, non-official directory project built to empower students, faculty, and campus staff with fast, accessible communication.*

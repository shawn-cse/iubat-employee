# Contributing to IUBAT Employee Directory

Welcome! This guide outlines the workflow, coding standards, testing procedures, and data governance policies for contributing to the IUBAT Faculty & Staff Directory.

---

## 1. Guiding Principles

1. **Authoritative Ground Truth:** All personnel records must reflect official university appointments. Never invent, guess, or extrapolate personal data.
2. **Zero Runtime Dependencies:** Keep the application lightweight, fast, and framework-free. Never add npm dependencies to the runtime bundle.
3. **Data Integrity:** Run the verification test suite before committing any changes.

---

## 2. Local Development Setup

No build tools, bundlers, or Node packages are required:

```bash
# Clone the repository
git clone https://github.com/shawn-cse/iubat-employee.git
cd iubat-employee-main

# Start a local web server (Python 3.x)
python -m http.server 8088
```

Open `http://localhost:8088/` in your browser.

---

## 3. Personnel Updates & Database Rebuilding

### Adding or Modifying Personnel
1. Place updated university HTML directory files or portraits into `iubat faculty database/`.
2. Execute the automated normalization script:
   ```bash
   python scripts/rebuild_database.py
   ```
3. Run the automated integrity suite:
   ```bash
   python scripts/verify_database.py
   ```
4. Export updated administrative CSV:
   ```bash
   python scripts/export_csv.py
   ```

---

## 4. Code Standards & Style

### HTML5
- Use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<footer>`).
- All buttons must declare `type="button"` or `type="submit"`.
- All images must include informative `alt` attributes and `loading="lazy"`.

### CSS3
- Use CSS Custom Properties defined in `:root` in `css/styles.css`.
- Avoid inline styles where classes can be reused.
- Keep mobile-first layout rules in `css/styles.css` and media queries in `css/responsive.css`.
- Preserve clean page breaks in `css/print.css`.

### JavaScript (ES6+)
- Use `const` and `let` (never `var`).
- Keep DOM manipulation efficient and batched using `DocumentFragment`.
- Ensure keyboard accessibility and focus management for all interactive components.

---

## 5. Verification Checklist Before Pull Request

- [ ] `python scripts/verify_database.py` exits with code 0 (no errors).
- [ ] No broken links or console errors in developer tools.
- [ ] Responsive behavior tested on mobile, tablet, and desktop viewports.
- [ ] Portrait assets exist for all entries with `hasRealPhoto: true`.
- [ ] Monogram avatars render cleanly for placeholder entries.
- [ ] Print preview (`Ctrl + P`) renders clean two-column grid.

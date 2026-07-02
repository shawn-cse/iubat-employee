/**
 * IUBAT Employee Directory — script.js
 * Supabase-connected employee directory with search, filter,
 * sort, pagination, copy-to-clipboard, FAB, and feedback modal.
 */

"use strict";

/* ── Config ─────────────────────────────────────────────── */
const SUPABASE_URL = "https://kkhwsjfloftekkzisrak.supabase.co";
const SUPABASE_KEY = "sb_publishable_jJFUr_C6YXjG6zy1OvLK2Q_SkWqFTLO";
const TABLE_NAME = "Employee";
const FEEDBACK_EMAIL = "shawn.iubat@gmail.com";

/* ── State ──────────────────────────────────────────────── */
let allEmployees = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 20;
let sortCol = "Name";
let sortDir = "asc";
let searchQuery = "";
let deptFilter = "";
let fabOpen = false;
let toastTimer = null;

/* ── DOM refs ───────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

const els = {
  loading: $("loading-state"),
  error: $("error-state"),
  errorTitle: $("error-title"),
  errorMsg: $("error-message"),
  empty: $("empty-state"),
  tableWrap: $("table-wrap"),
  tableBody: $("table-body"),
  mobileCards: $("mobile-cards-list"),
  searchInput: $("search-input"),
  clearBtn: $("clear-search"),
  deptFilter: $("dept-filter"),
  rowsPerPage: $("rows-per-page"),
  statTotal: $("stat-total"),
  statShowing: $("stat-showing"),
  statDepts: $("stat-depts"),
  pagination: $("pagination"),
  pageNumbers: $("page-numbers"),
  btnPrev: $("btn-prev"),
  btnNext: $("btn-next"),
  toast: $("toast"),
  lastUpdated: $("last-updated"),
  fabActions: $("fab-actions"),
  fabMain: $("fab-main"),
  fabIconPlus: document.querySelector(".fab-icon--plus"),
  fabIconClose: document.querySelector(".fab-icon--close"),
  modal: $("feedback-modal"),
};

/* ── Init ───────────────────────────────────────────────── */
async function initApp() {
  showState("loading");
  try {
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await client
      .from(TABLE_NAME)
      .select("*")
      .order("Name", { ascending: true });

    if (error) {
      throw new Error(error.message || "Database error");
    }

    allEmployees = data || [];
    buildDeptFilter();
    updateLastUpdated();
    applyFilters();
    showState("table");
  } catch (err) {
    console.error("[IUBAT Directory]", err);
    els.errorTitle.textContent = "Connection Failed";
    els.errorMsg.textContent =
      err.message || "Unable to reach the database. Check your credentials.";
    showState("error");
  }
}

/* ── State management ───────────────────────────────────── */
function showState(state) {
  els.loading.classList.add("hidden");
  els.error.classList.add("hidden");
  els.empty.classList.add("hidden");
  els.tableWrap.classList.add("hidden");

  if (state === "loading") els.loading.classList.remove("hidden");
  if (state === "error") els.error.classList.remove("hidden");
  if (state === "empty") els.empty.classList.remove("hidden");
  if (state === "table") els.tableWrap.classList.remove("hidden");
}

/* ── Department filter builder ──────────────────────────── */
function buildDeptFilter() {
  const depts = [
    ...new Set(
      allEmployees
        .map((e) => (e["Department or Office"] || "").trim())
        .filter(Boolean),
    ),
  ].sort();

  while (els.deptFilter.options.length > 1) els.deptFilter.remove(1);

  depts.forEach((dept) => {
    const opt = document.createElement("option");
    opt.value = dept;
    opt.textContent = dept;
    els.deptFilter.appendChild(opt);
  });

  els.statDepts.textContent = depts.length;
  els.statTotal.textContent = allEmployees.length;
}

/* ── Filters + Sort ─────────────────────────────────────── */
function applyFilters() {
  const q = searchQuery.toLowerCase().trim();

  filteredData = allEmployees.filter((emp) => {
    if (deptFilter && (emp["Department or Office"] || "").trim() !== deptFilter)
      return false;
    if (q) {
      const haystack = [
        emp.Name || "",
        emp.Designation || "",
        emp["Department or Office"] || "",
        emp.Email || "",
        emp.Cell || "",
        emp.Room || "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  filteredData.sort((a, b) => {
    const valA = (a[sortCol] || "").toString().toLowerCase();
    const valB = (b[sortCol] || "").toString().toLowerCase();
    return sortDir === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  currentPage = 1;
  els.statShowing.textContent = filteredData.length;
  renderAll();

  if (filteredData.length === 0 && (q || deptFilter)) {
    showState("empty");
  } else {
    showState("table");
  }
}

function renderAll() {
  renderTable();
  renderMobileCards();
  renderPagination();
}

/* ── Desktop Table Render ───────────────────────────────── */
function renderTable() {
  const start = (currentPage - 1) * rowsPerPage;
  const slice = filteredData.slice(start, start + rowsPerPage);

  if (slice.length === 0) {
    els.tableBody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No records on this page.</td></tr>';
    return;
  }

  els.tableBody.innerHTML = slice
    .map((emp, idx) => {
      const globalIdx = start + idx;
      const name = escHtml(emp.Name || "—");
      const desig = escHtml(emp.Designation || "—");
      const dept = escHtml(emp["Department or Office"] || "—");
      const room = escHtml(emp.Room || "—");
      const email = emp.Email ? emp.Email.trim() : "";
      const cell = emp.Cell ? emp.Cell.trim() : "";

      const emailHtml = email
        ? `<a class="link-email" href="mailto:${escHtml(email)}" title="Send email">✉ ${escHtml(email)}</a>`
        : '<span style="color:var(--text-muted)">—</span>';

      const cellHtml = cell
        ? `<a class="link-phone" href="tel:${escHtml(cell)}" title="Call">📞 ${escHtml(cell)}</a>`
        : '<span style="color:var(--text-muted)">—</span>';

      return `
      <tr>
        <td class="cell-name">${name}</td>
        <td class="cell-designation">${desig}</td>
        <td><span class="dept-badge" title="${dept}">${dept}</span></td>
        <td class="cell-room">${room}</td>
        <td>${emailHtml}</td>
        <td>${cellHtml}</td>
        <td class="col-action-cell">
          <button class="btn-copy-row" onclick="copyRow(${globalIdx})" title="Copy employee info">
            <svg viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M3 11V3a1 1 0 011-1h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Copy
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

/* ── Mobile Contact-Card Render ────────────────────────── */
function renderMobileCards() {
  const start = (currentPage - 1) * rowsPerPage;
  const slice = filteredData.slice(start, start + rowsPerPage);

  if (slice.length === 0) {
    els.mobileCards.innerHTML = "";
    return;
  }

  els.mobileCards.innerHTML = slice
    .map((emp, idx) => {
      const globalIdx = start + idx;
      const name = (emp.Name || "").trim();
      const desig = (emp.Designation || "").trim();
      const dept = (emp["Department or Office"] || "").trim();
      const room = (emp.Room || "").trim();
      const email = (emp.Email || "").trim();
      const cell = (emp.Cell || "").trim();

      let html = `
      <div class="mobile-card">
        <div class="mobile-card__accent"></div>
        <div class="mobile-card__body">
      `;

      if (name) {
        html += `<p class="mobile-card__field mobile-card__field--name">${escHtml(name)}</p>`;
      }
      if (desig) {
        html += `<p class="mobile-card__field mobile-card__field--designation">${escHtml(desig)}</p>`;
      }
      if (dept) {
        html += `<p class="mobile-card__field">${escHtml(dept)}</p>`;
      }
      if (room) {
        html += `<p class="mobile-card__field">Room # ${escHtml(room)}</p>`;
      }
      if (email) {
        html += `
          <p class="mobile-card__field mobile-card__field--clickable">
            <a href="mailto:${escHtml(email)}" class="mobile-card__link mobile-card__link--email">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M2 5l8 6 8-6M2 5v10a2 2 0 002 2h12a2 2 0 002-2V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${escHtml(email)}
            </a>
          </p>
        `;
      }
      if (cell) {
        html += `
          <p class="mobile-card__field mobile-card__field--clickable">
            <a href="tel:${escHtml(cell)}" class="mobile-card__link mobile-card__link--phone">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M6 2L4 5a13 13 0 007 7l3-2 3 4a2 2 0 01-1 3A17 17 0 011 5a2 2 0 012-1l4 3z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${escHtml(cell)}
            </a>
          </p>
        `;
      }

      html += `
        </div>
        <div class="mobile-card__footer">
          <button class="btn-copy-card" onclick="copyCard(${globalIdx}, this)" title="Copy employee info">
            <svg class="btn-copy-card__icon" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M3 11V3a1 1 0 011-1h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            <svg class="btn-copy-card__check" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="btn-copy-card__label">Copy</span>
          </button>
        </div>
      </div>
      `;

      return html;
    })
    .join("");
}

/* ── Column sort ────────────────────────────────────────── */
function initSortHeaders() {
  document.querySelectorAll(".dir-table th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortCol = col;
        sortDir = "asc";
      }
      document.querySelectorAll(".dir-table th.sortable").forEach((t) => {
        t.classList.remove("sort-asc", "sort-desc");
      });
      th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");
      applyFilters();
    });
  });
}

/* ── Pagination ─────────────────────────────────────────── */
function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  els.btnPrev.disabled = currentPage === 1;
  els.btnNext.disabled = currentPage === totalPages;

  const pages = getPagesArray(currentPage, totalPages);
  els.pageNumbers.innerHTML = pages
    .map((p) => {
      if (p === "…") return `<span class="page-ellipsis">…</span>`;
      return `<button class="page-num${p === currentPage ? " active" : ""}" onclick="goToPage(${p})">${p}</button>`;
    })
    .join("");
}

function getPagesArray(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (cur > 3) pages.push("…");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++)
    pages.push(p);
  if (cur < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

function goToPage(p) {
  currentPage = p;
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Utility: HTML escape ───────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Build plain-text contact block for copying ─────────── */
function buildContactText(emp) {
  const name = (emp.Name || "").trim();
  const desig = (emp.Designation || "").trim();
  const dept = (emp["Department or Office"] || "").trim();
  const room = (emp.Room || "").trim();
  const email = (emp.Email || "").trim();
  const cell = (emp.Cell || "").trim();

  const fields = [];
  if (name) fields.push(name);
  if (desig) fields.push(desig);
  if (dept) fields.push(dept);
  if (room) fields.push(`Room # ${room}`);
  if (email) fields.push(email);
  if (cell) fields.push(cell);

  return fields.join("\n");
}

function copyTextToClipboard(text, onDone) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (onDone) onDone();
      })
      .catch((err) => {
        console.error("Clipboard API failed:", err);
        fallbackCopy(text, onDone);
      });
  } else {
    fallbackCopy(text, onDone);
  }
}

function fallbackCopy(text, onDone) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "0";
  ta.style.left = "0";
  ta.style.width = "1px";
  ta.style.height = "1px";
  ta.style.opacity = "0";
  ta.style.pointerEvents = "none";
  ta.style.border = "none";
  ta.style.outline = "none";
  document.body.appendChild(ta);

  ta.select();
  ta.setSelectionRange(0, 99999);

  try {
    const success = document.execCommand("copy");
    if (success && onDone) {
      onDone();
    }
  } catch (err) {
    console.error("Fallback copy error:", err);
  }

  setTimeout(() => {
    document.body.removeChild(ta);
  }, 100);
}

/* ── Copy row (desktop table) ───────────────────────────── */
function copyRow(idx) {
  const emp = filteredData[idx];
  if (!emp) {
    showToast("⚠️ Employee not found");
    return;
  }
  const text = buildContactText(emp);
  copyTextToClipboard(text, () => {
    showToast("✅ Employee info copied to clipboard");
    const buttons = document.querySelectorAll(".btn-copy-row");
    const btn = buttons[idx];
    if (btn) {
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1500);
    }
  });
}

/* ── Copy card (mobile) ─────────────────────────────────── */
function copyCard(idx, btnEl) {
  const emp = filteredData[idx];
  if (!emp) {
    showToast("⚠️ Employee not found");
    return;
  }
  const text = buildContactText(emp);
  copyTextToClipboard(text, () => {
    showToast("✅ Employee info copied to clipboard");
    if (btnEl) {
      btnEl.classList.add("copied");
      const label = btnEl.querySelector(".btn-copy-card__label");
      const prevLabel = label ? label.textContent : null;
      if (label) label.textContent = "Copied!";
      setTimeout(() => {
        btnEl.classList.remove("copied");
        if (label && prevLabel !== null) label.textContent = prevLabel;
      }, 1500);
    }
  });
}

/* ── Toast ──────────────────────────────────────────────── */
function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer);
  els.toast.textContent = msg;
  els.toast.classList.remove("hidden");
  toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 3000);
}

/* ── FAB ────────────────────────────────────────────────── */
function toggleFab() {
  fabOpen = !fabOpen;
  els.fabActions.classList.toggle("open", fabOpen);
  els.fabMain.setAttribute("aria-expanded", fabOpen);
  els.fabIconPlus.classList.toggle("hidden", fabOpen);
  els.fabIconClose.classList.toggle("hidden", !fabOpen);
}

document.addEventListener("click", (e) => {
  if (fabOpen && !e.target.closest(".fab-container")) {
    fabOpen = false;
    els.fabActions.classList.remove("open");
    els.fabMain.setAttribute("aria-expanded", "false");
    els.fabIconPlus.classList.remove("hidden");
    els.fabIconClose.classList.add("hidden");
  }
});

/* ── Modal ──────────────────────────────────────────────── */
function openModal() {
  if (fabOpen) toggleFab();
  els.modal.classList.remove("hidden");
  setTimeout(() => $("form-name").focus(), 50);
}

function closeModal() {
  els.modal.classList.add("hidden");
}

els.modal.addEventListener("click", (e) => {
  if (e.target === els.modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !els.modal.classList.contains("hidden"))
    closeModal();
});

function submitFeedback() {
  const name = ($("form-name").value || "").trim();
  const email = ($("form-email").value || "").trim();
  const message = ($("form-message").value || "").trim();

  if (!name || !email || !message) {
    showToast("⚠️ Please fill in all fields");
    return;
  }

  const subject = encodeURIComponent(`Directory Inquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  );
  window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
  closeModal();
  showToast("📧 Email client opened");
}

/* ── Clear all ──────────────────────────────────────────── */
function clearAll() {
  searchQuery = "";
  deptFilter = "";
  els.searchInput.value = "";
  els.deptFilter.value = "";
  els.clearBtn.classList.add("hidden");
  applyFilters();
}

/* ── Last updated badge ─────────────────────────────────── */
function updateLastUpdated() {
  const now = new Date();
  els.lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

/* ── Event listeners ────────────────────────────────────── */
function initEvents() {
  els.searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    els.clearBtn.classList.toggle("hidden", !searchQuery);
    applyFilters();
  });

  els.clearBtn.addEventListener("click", () => {
    searchQuery = "";
    els.searchInput.value = "";
    els.clearBtn.classList.add("hidden");
    els.searchInput.focus();
    applyFilters();
  });

  els.deptFilter.addEventListener("change", (e) => {
    deptFilter = e.target.value;
    applyFilters();
  });

  els.rowsPerPage.addEventListener("change", (e) => {
    rowsPerPage = parseInt(e.target.value, 10);
    currentPage = 1;
    renderAll();
  });

  els.btnPrev.addEventListener("click", () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  });
  els.btnNext.addEventListener("click", () => {
    const total = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < total) goToPage(currentPage + 1);
  });
}

/* ── Bootstrap ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  initSortHeaders();
  initApp();
});

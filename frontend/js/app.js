(() => {
  "use strict";

  const config = window.APP_CONFIG;
  if (!config) {
    console.error("Missing APP_CONFIG. Ensure js/config.js loads before js/app.js.");
    return;
  }

  const COL = Object.freeze({
    name: "Name",
    designation: "Designation",
    department: "Department/Office",
    room: "Room",
    email: "Email",
    phone: "Cell",
  });

  const storedView = (() => {
    try {
      return localStorage.getItem("iubat_directory_view");
    } catch (_) {
      return null;
    }
  })();

  const state = {
    employees: [],
    filteredEmployees: [],
    cardEntries: [],
    query: "",
    view: storedView === "list" ? "list" : "grid",
    activeModal: null,
    lastFocusedElement: null,
    searchFrame: null,
    toastTimer: null,
  };

  const elements = {
    searchInput: document.getElementById("searchInput"),
    searchBtn: document.getElementById("searchBtn"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    emptyResetBtn: document.getElementById("emptyResetBtn"),
    gridViewBtn: document.getElementById("gridViewBtn"),
    listViewBtn: document.getElementById("listViewBtn"),
    employeeList: document.getElementById("employeeList"),
    loadingState: document.getElementById("loadingState"),
    errorState: document.getElementById("errorState"),
    errorMessage: document.getElementById("errorMessage"),
    emptyState: document.getElementById("emptyState"),
    retryBtn: document.getElementById("retryBtn"),
    resultSummary: document.getElementById("resultSummary"),
    totalEmployees: document.getElementById("totalEmployees"),
    totalDepartments: document.getElementById("totalDepartments"),
    contactCoverage: document.getElementById("contactCoverage"),
    dataNotice: document.getElementById("dataNotice"),
    dataNoticeText: document.getElementById("dataNoticeText"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalPanel: document.getElementById("modalPanel"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    modalContent: document.getElementById("modalContent"),
    backToTopBtn: document.getElementById("backToTopBtn"),
    toast: document.getElementById("toast"),
    currentYear: document.getElementById("currentYear"),
  };

  const icons = {
    building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M9 14h.01M9 18h.01M15 10h.01M15 14h.01M15 18h.01"/></svg>',
    room: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M6 21V4h12v17M9 8h.01M9 12h.01M9 16h.01M14 8h1M14 12h1M14 16h1"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.65 2.8a2 2 0 0 1-.45 2.11L9 10.91a16 16 0 0 0 4.1 4.1l1.28-1.28a2 2 0 0 1 2.11-.45c.9.3 1.84.52 2.8.65A2 2 0 0 1 22 16.92Z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanValue(value) {
    if (value == null) return "";
    const cleaned = String(value).trim();
    return /^(null|undefined|n\/a|na|-|—)$/i.test(cleaned) ? "" : cleaned;
  }

  function getEmployeeValue(employee, column) {
    return cleanValue(employee?.[column]);
  }

  function formatRoom(value) {
    const room = cleanValue(value);
    if (!room) return "";
    return /^room\b/i.test(room) ? room : `Room ${room}`;
  }

  function phoneParts(value) {
    const raw = cleanValue(value);
    if (!raw) return { display: "", tel: "" };

    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("00880")) digits = digits.slice(5);
    else if (digits.startsWith("880")) digits = digits.slice(3);
    else if (digits.startsWith("0")) digits = digits.slice(1);

    if (/^1\d{9}$/.test(digits)) {
      return {
        display: `+880 ${digits.slice(0, 4)}-${digits.slice(4)}`,
        tel: `+880${digits}`,
      };
    }

    return {
      display: raw,
      tel: raw.replace(/(?!^\+)[^\d]/g, ""),
    };
  }

  function safeEmail(value) {
    const email = cleanValue(value);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
  }

  function initials(name) {
    const words = cleanValue(name).split(/\s+/).filter(Boolean);
    if (!words.length) return "IU";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }


  function employeeTone(employee) {
    const seed = `${getEmployeeValue(employee, COL.department)}|${getEmployeeValue(employee, COL.name)}`;
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
    }
    return Math.abs(hash) % 6;
  }

  function buildEmployeeText(employee) {
    const name = getEmployeeValue(employee, COL.name) || "IUBAT Employee";
    const designation = getEmployeeValue(employee, COL.designation);
    const department = getEmployeeValue(employee, COL.department);
    const room = formatRoom(getEmployeeValue(employee, COL.room));
    const email = safeEmail(getEmployeeValue(employee, COL.email));
    const phone = phoneParts(getEmployeeValue(employee, COL.phone)).display;

    return [
      name,
      designation,
      department,
      room,
      email && `Email: ${email}`,
      phone && `Phone: ${phone}`,
    ].filter(Boolean).join("\n");
  }

  function showToast(message) {
    clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    state.toastTimer = setTimeout(() => {
      elements.toast.classList.remove("is-visible");
    }, 2400);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Copy command failed");
  }

  function buildApiUrl() {
    const base = config.SUPABASE_URL.replace(/\/$/, "");
    const table = encodeURIComponent(config.TABLE_NAME);
    const params = new URLSearchParams({
      select: "*",
      order: `${COL.name}.asc.nullslast`,
    });
    return `${base}/rest/v1/${table}?${params.toString()}`;
  }

  async function fetchEmployees() {
    const response = await fetch(buildApiUrl(), {
      method: "GET",
      headers: {
        apikey: config.SUPABASE_KEY,
        Authorization: `Bearer ${config.SUPABASE_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let message = `Directory request failed (${response.status}).`;
      try {
        const error = await response.json();
        message = error.message || error.hint || message;
      } catch (_) {
        // Keep the status-based message when the response is not JSON.
      }
      throw new Error(message);
    }

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("The directory returned an invalid response.");
    return data;
  }

  function saveCache(employees) {
    try {
      localStorage.setItem(
        config.CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), employees }),
      );
    } catch (_) {
      // Storage may be disabled. The live directory still works normally.
    }
  }

  function readCache() {
    try {
      const parsed = JSON.parse(localStorage.getItem(config.CACHE_KEY) || "null");
      if (!parsed || !Array.isArray(parsed.employees) || !parsed.employees.length) return null;
      const maxAge = Number(config.CACHE_MAX_AGE_MS) || 0;
      if (maxAge > 0 && Date.now() - Number(parsed.savedAt || 0) > maxAge) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function showDataNotice(message) {
    elements.dataNoticeText.textContent = message;
    elements.dataNotice.hidden = false;
  }

  function hideDataNotice() {
    elements.dataNotice.hidden = true;
  }

  function uniqueDepartments(employees) {
    return [...new Set(
      employees
        .map((employee) => getEmployeeValue(employee, COL.department))
        .filter(Boolean),
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function updateStats() {
    const total = state.employees.length;
    const departments = uniqueDepartments(state.employees).length;
    const contactable = state.employees.filter((employee) => {
      return safeEmail(getEmployeeValue(employee, COL.email)) || phoneParts(getEmployeeValue(employee, COL.phone)).tel;
    }).length;
    const coverage = total ? Math.round((contactable / total) * 100) : 0;

    elements.totalEmployees.textContent = total.toLocaleString();
    elements.totalDepartments.textContent = departments.toLocaleString();
    elements.contactCoverage.textContent = `${coverage}%`;
  }

  function buildSearchIndex(employee) {
    return [
      COL.name,
      COL.designation,
      COL.department,
      COL.room,
      COL.email,
      COL.phone,
    ].map((column) => normalize(getEmployeeValue(employee, column))).join(" ");
  }

  function employeeCardTemplate(employee, index) {
    const name = getEmployeeValue(employee, COL.name) || "Unnamed employee";
    const designation = getEmployeeValue(employee, COL.designation) || "Employee";
    const department = getEmployeeValue(employee, COL.department);
    const room = formatRoom(getEmployeeValue(employee, COL.room));
    const email = safeEmail(getEmployeeValue(employee, COL.email));
    const phone = phoneParts(getEmployeeValue(employee, COL.phone));
    const employeeIndex = Number(index);

    const details = [
      department && `<li>${icons.building}<span title="${escapeHtml(department)}">${escapeHtml(department)}</span></li>`,
      room && `<li>${icons.room}<span title="${escapeHtml(room)}">${escapeHtml(room)}</span></li>`,
    ].filter(Boolean).join("");

    const contacts = [
      email && `<a class="contact-button" href="mailto:${escapeHtml(email)}" title="Email ${escapeHtml(name)}">${icons.mail}<span>${escapeHtml(email)}</span></a>`,
      phone.tel && `<a class="contact-button" href="tel:${escapeHtml(phone.tel)}" title="Call ${escapeHtml(name)}">${icons.phone}<span>${escapeHtml(phone.display)}</span></a>`,
    ].filter(Boolean).join("");

    return `
      <li class="employee-card employee-card--tone-${employeeTone(employee)}" data-employee-index="${employeeIndex}">
        <article>
          <div class="employee-card__header">
            <div class="avatar" aria-hidden="true">${escapeHtml(initials(name))}</div>
            <div class="employee-card__identity">
              <h3 title="${escapeHtml(name)}">${escapeHtml(name)}</h3>
              <p title="${escapeHtml(designation)}">${escapeHtml(designation)}</p>
            </div>
          </div>

          ${details ? `<ul class="employee-meta">${details}</ul>` : '<p class="employee-meta employee-meta--empty">Additional office details are not available.</p>'}

          ${contacts ? `<div class="employee-contacts">${contacts}</div>` : '<p class="contact-unavailable">Contact information is not available.</p>'}

          <div class="employee-card__footer">
            <button class="text-button" type="button" data-action="profile" title="Open full profile for ${escapeHtml(name)}">
              View profile ${icons.arrow}
            </button>
            <div class="employee-card__quick-actions">
              <button class="icon-btn" type="button" data-action="copy" aria-label="Copy ${escapeHtml(name)} details" data-tooltip="Copy details" title="Copy ${escapeHtml(name)} details">${icons.copy}</button>
              <button class="icon-btn" type="button" data-action="share" aria-label="Share ${escapeHtml(name)} details" data-tooltip="Share details" title="Share ${escapeHtml(name)} details">${icons.share}</button>
            </div>
          </div>
        </article>
      </li>
    `;
  }

  function renderEmployees() {
    elements.employeeList.classList.toggle("employee-grid--list", state.view === "list");
    elements.employeeList.innerHTML = state.employees
      .map(employeeCardTemplate)
      .join("");

    state.cardEntries = [...elements.employeeList.querySelectorAll(".employee-card")].map((card, index) => {
      card.style.setProperty("--delay", `${Math.min(index, 12) * 35}ms`);
      return {
        card,
        employee: state.employees[index],
        searchText: buildSearchIndex(state.employees[index]),
      };
    });
  }

  function updateResultSummary() {
    const shown = state.filteredEmployees.length;
    const total = state.employees.length;

    if (!total) {
      elements.resultSummary.textContent = "No employees are currently available.";
      return;
    }

    if (state.query) {
      elements.resultSummary.textContent = `Showing ${shown.toLocaleString()} of ${total.toLocaleString()} employees`;
    } else {
      elements.resultSummary.textContent = `${total.toLocaleString()} employee${total === 1 ? "" : "s"} available`;
    }
  }

  function updateSearchControls() {
    elements.clearSearchBtn.hidden = !state.query;
  }

  function applyFilters() {
    const query = normalize(state.query);
    const matches = [];

    state.cardEntries.forEach((entry) => {
      const visible = !query || entry.searchText.includes(query);
      entry.card.hidden = !visible;
      if (visible) matches.push(entry.employee);
    });

    state.filteredEmployees = matches;
    updateResultSummary();
    updateSearchControls();

    const empty = matches.length === 0;
    elements.emptyState.hidden = !empty;
    elements.employeeList.hidden = empty;
  }

  function setLoading(isLoading) {
    elements.loadingState.hidden = !isLoading;
    elements.employeeList.setAttribute("aria-busy", String(isLoading));
    if (isLoading) {
      elements.errorState.hidden = true;
      elements.emptyState.hidden = true;
      elements.employeeList.hidden = true;
    }
  }

  async function loadDirectory() {
    setLoading(true);
    hideDataNotice();

    try {
      const employees = await fetchEmployees();
      state.employees = employees;
      saveCache(employees);
      elements.errorState.hidden = true;
      updateStats();
      renderEmployees();
      applyFilters();
    } catch (error) {
      console.error("Failed to load employee directory:", error);
      const cache = readCache();

      if (cache) {
        state.employees = cache.employees;
        updateStats();
        renderEmployees();
        applyFilters();
        const ageHours = Math.max(1, Math.round((Date.now() - cache.savedAt) / 3_600_000));
        showDataNotice(`Live data is unavailable. Showing the last saved directory from about ${ageHours} hour${ageHours === 1 ? "" : "s"} ago.`);
      } else {
        elements.errorMessage.textContent = error.message || "Please check your connection and try again.";
        elements.errorState.hidden = false;
        elements.employeeList.hidden = true;
        elements.resultSummary.textContent = "Directory unavailable";
      }
    } finally {
      setLoading(false);
    }
  }

  function clearSearch({ focusSearch = false } = {}) {
    if (state.searchFrame) {
      cancelAnimationFrame(state.searchFrame);
      state.searchFrame = null;
    }
    state.query = "";
    elements.searchInput.value = "";
    applyFilters();
    if (focusSearch) elements.searchInput.focus();
  }

  function setView(view) {
    state.view = view;
    try {
      localStorage.setItem("iubat_directory_view", view);
    } catch (_) {
      // The view still changes when browser storage is unavailable.
    }
    elements.gridViewBtn.classList.toggle("is-active", view === "grid");
    elements.gridViewBtn.setAttribute("aria-pressed", String(view === "grid"));
    elements.listViewBtn.classList.toggle("is-active", view === "list");
    elements.listViewBtn.setAttribute("aria-pressed", String(view === "list"));
    elements.employeeList.classList.toggle("employee-grid--list", view === "list");
  }

  function findEmployeeFromCard(card) {
    const index = Number(card?.dataset.employeeIndex);
    return Number.isInteger(index) ? state.employees[index] : null;
  }

  function profileModalTemplate(employee) {
    const name = getEmployeeValue(employee, COL.name) || "Unnamed employee";
    const designation = getEmployeeValue(employee, COL.designation) || "Employee";
    const department = getEmployeeValue(employee, COL.department) || "Not provided";
    const room = formatRoom(getEmployeeValue(employee, COL.room)) || "Not provided";
    const email = safeEmail(getEmployeeValue(employee, COL.email));
    const phone = phoneParts(getEmployeeValue(employee, COL.phone));

    return `
      <div class="profile-modal">
        <div class="profile-modal__hero">
          <div class="avatar avatar--large" aria-hidden="true">${escapeHtml(initials(name))}</div>
          <div>
            <p class="modal__eyebrow">Employee profile</p>
            <h2 id="modalTitle">${escapeHtml(name)}</h2>
            <p>${escapeHtml(designation)}</p>
          </div>
        </div>
        <dl class="profile-details">
          <div><dt>Department / Office</dt><dd>${escapeHtml(department)}</dd></div>
          <div><dt>Room</dt><dd>${escapeHtml(room)}</dd></div>
          <div><dt>Email</dt><dd>${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : "Not provided"}</dd></div>
          <div><dt>Phone</dt><dd>${phone.tel ? `<a href="tel:${escapeHtml(phone.tel)}">${escapeHtml(phone.display)}</a>` : "Not provided"}</dd></div>
        </dl>
        <div class="modal__actions">
          ${email ? `<a class="btn btn--primary" href="mailto:${escapeHtml(email)}">${icons.mail} Send email</a>` : ""}
          ${phone.tel ? `<a class="btn btn--outline" href="tel:${escapeHtml(phone.tel)}">${icons.phone} Call</a>` : ""}
          <button class="btn btn--soft" type="button" data-modal-action="copy">${icons.copy} Copy details</button>
        </div>
      </div>
    `;
  }

  function requestModalTemplate() {
    return `
      <div class="request-modal">
        <p class="modal__eyebrow">Directory support</p>
        <h2 id="modalTitle">Request or update a listing</h2>
        <p class="modal__lead">Report incorrect information or request a new employee entry through your preferred contact channel.</p>
        <div class="request-options">
          <a href="mailto:${escapeHtml(config.CONTACT.email)}?subject=IUBAT%20Employee%20Directory%20Update" class="request-option">
            <span>${icons.mail}</span><div><strong>Email</strong><small>${escapeHtml(config.CONTACT.email)}</small></div>${icons.arrow}
          </a>
          <a href="${escapeHtml(config.CONTACT.facebook)}" target="_blank" rel="noopener noreferrer" class="request-option">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg></span><div><strong>Facebook</strong><small>Message shawnazd</small></div>${icons.arrow}
          </a>
          <a href="${escapeHtml(config.CONTACT.whatsapp)}" target="_blank" rel="noopener noreferrer" class="request-option">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l5.9-1.6A11.8 11.8 0 0 0 20.5 3.5ZM12 21a9.7 9.7 0 0 1-4.9-1.3l-.4-.2-3.5 1 1-3.4-.2-.4A9.7 9.7 0 1 1 12 21Z"/><path d="M8.6 6.8c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 3s1.3 3.5 1.5 3.7c.2.2 2.6 4 6.3 5.6 3.1 1.4 3.7 1.1 4.4 1 .7-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5l-2.6-1.2c-.4-.1-.7-.2-1 .2l-1.1 1.4c-.3.3-.5.3-.9.1a8 8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.4 0-.6.1-.8l.6-.7.4-.7c.1-.3 0-.5 0-.7L9.8 7.3c-.3-.7-.6-.6-1.2-.5Z"/></svg></span><div><strong>WhatsApp</strong><small>+880 1873 319733</small></div>${icons.arrow}
          </a>
        </div>
      </div>
    `;
  }

  function getFocusableElements() {
    return [...elements.modalPanel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => !element.hasAttribute("hidden"));
  }

  function openModal(type, employee = null) {
    state.lastFocusedElement = document.activeElement;
    state.activeModal = { type, employee };
    elements.modalContent.innerHTML = type === "profile" && employee
      ? profileModalTemplate(employee)
      : requestModalTemplate();
    elements.modalOverlay.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
      elements.modalOverlay.classList.add("is-visible");
      const focusable = getFocusableElements();
      (focusable[0] || elements.modalPanel).focus();
    });
  }

  function closeModal() {
    if (elements.modalOverlay.hidden) return;
    elements.modalOverlay.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    setTimeout(() => {
      elements.modalOverlay.hidden = true;
      elements.modalContent.innerHTML = "";
      state.activeModal = null;
      state.lastFocusedElement?.focus?.();
    }, 180);
  }

  async function shareEmployee(employee) {
    const name = getEmployeeValue(employee, COL.name) || "IUBAT Employee";
    const text = buildEmployeeText(employee);

    if (navigator.share) {
      try {
        await navigator.share({ title: name, text });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    await copyText(text);
    showToast("Sharing is unavailable, so the details were copied.");
  }

  function runSearchNow() {
    if (state.searchFrame) {
      cancelAnimationFrame(state.searchFrame);
      state.searchFrame = null;
    }
    state.query = elements.searchInput.value;
    applyFilters();
  }

  function handleSearchInput() {
    state.query = elements.searchInput.value;
    updateSearchControls();

    if (state.searchFrame) cancelAnimationFrame(state.searchFrame);
    state.searchFrame = requestAnimationFrame(() => {
      state.searchFrame = null;
      applyFilters();
    });
  }

  elements.searchInput.addEventListener("input", handleSearchInput);
  elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearchNow();
      document.getElementById("directory").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  elements.searchBtn.addEventListener("click", () => {
    runSearchNow();
    document.getElementById("directory").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.clearSearchBtn.addEventListener("click", () => clearSearch({ focusSearch: true }));
  elements.emptyResetBtn.addEventListener("click", () => clearSearch({ focusSearch: true }));
  elements.retryBtn.addEventListener("click", loadDirectory);
  elements.gridViewBtn.addEventListener("click", () => setView("grid"));
  elements.listViewBtn.addEventListener("click", () => setView("list"));

  elements.employeeList.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const employee = findEmployeeFromCard(actionButton.closest(".employee-card"));
    if (!employee) return;

    try {
      switch (actionButton.dataset.action) {
        case "profile":
          openModal("profile", employee);
          break;
        case "copy":
          await copyText(buildEmployeeText(employee));
          showToast("Employee details copied.");
          break;
        case "share":
          await shareEmployee(employee);
          break;
      }
    } catch (error) {
      console.error(error);
      showToast("That action could not be completed.");
    }
  });

  document.querySelectorAll("[data-open-request]").forEach((button) => {
    button.addEventListener("click", () => openModal("request"));
  });

  elements.modalCloseBtn.addEventListener("click", closeModal);
  elements.modalOverlay.addEventListener("click", (event) => {
    if (event.target === elements.modalOverlay) closeModal();
  });

  elements.modalContent.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-modal-action]")?.dataset.modalAction;
    if (action === "copy" && state.activeModal?.employee) {
      try {
        await copyText(buildEmployeeText(state.activeModal.employee));
        showToast("Employee details copied.");
      } catch (_) {
        showToast("Could not copy the employee details.");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (elements.modalOverlay.hidden) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        elements.modalPanel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("scroll", () => {
    elements.backToTopBtn.hidden = window.scrollY < 500;
  }, { passive: true });

  elements.backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  elements.currentYear.textContent = String(new Date().getFullYear());
  setView(state.view);
  loadDirectory();
})();

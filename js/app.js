/**
 * IUBAT Employee Directory - Modern Application Coordinator
 * High-performance vanilla ES6+ engine with client-side indexing,
 * instant multi-field search, faculty & department hierarchical filtering,
 * study leave filtering, tone-coded cards, real WebP portraits, copy/share actions,
 * interactive profile modal, update request modal, and WCAG AA accessibility.
 */

(() => {
  "use strict";

  const CONFIG = Object.freeze({
    DATA_URL: "data/employees.json",
    CACHE_KEY: "iubat_employee_directory_cache_v4",
    CACHE_MAX_AGE_MS: 24 * 60 * 60 * 1000,
    CONTACT: Object.freeze({
      email: "shawn.cse@yahoo.com",
      github: "https://github.com/shawn-cse",
      facebook: "https://facebook.com/shawnazd",
      whatsapp: "https://wa.me/8801873319733",
    }),
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
    selectedFaculty: "",
    selectedDepartment: "",
    filterStudyLeave: false,
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
    facultySelect: document.getElementById("facultySelect"),
    departmentSelect: document.getElementById("departmentSelect"),
    studyLeaveBtn: document.getElementById("studyLeaveBtn"),
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
    totalFaculties: document.getElementById("totalFaculties"),
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
    academic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  };

  function escapeHtml(value) {
    if (value == null) return "";
    const div = document.createElement("div");
    div.textContent = String(value);
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

  function getEmployeeProp(employee, key) {
    if (!employee) return "";
    let val = "";
    if (employee[key] !== undefined && employee[key] !== null) {
      val = cleanValue(employee[key]);
    } else {
      const lowerKey = key.toLowerCase();
      for (const k of Object.keys(employee)) {
        if (k.toLowerCase() === lowerKey) {
          val = cleanValue(employee[k]);
          break;
        }
      }
    }
    return val;
  }

  function formatRoom(value, ext) {
    const room = cleanValue(value);
    const extension = cleanValue(ext);
    const parts = [];
    if (room) {
      parts.push(/^room\b/i.test(room) ? room : `Room ${room}`);
    }
    if (extension) {
      parts.push(`Ext ${extension}`);
    }
    return parts.join(" • ");
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
    const clean = cleanValue(name).replace(/^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?|Engr\.?|Md\.?|Sk\.?)\s+/i, "");
    const words = clean.split(/\s+/).filter(Boolean);
    if (!words.length) return "IU";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  function employeeTone(employee) {
    const dept = getEmployeeProp(employee, "department") || "";
    const name = getEmployeeProp(employee, "name") || "";
    const seed = `${dept}|${name}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 6;
  }

  function buildEmployeeText(employee) {
    const name = getEmployeeProp(employee, "name") || "IUBAT Employee";
    const designation = getEmployeeProp(employee, "designation");
    const department = getEmployeeProp(employee, "department");
    const faculty = getEmployeeProp(employee, "faculty");
    const room = formatRoom(getEmployeeProp(employee, "room"), getEmployeeProp(employee, "ext"));
    const email = safeEmail(getEmployeeProp(employee, "email"));
    const phone = phoneParts(getEmployeeProp(employee, "phone")).display;
    const additionalResp = getEmployeeProp(employee, "additionalResponsibility");
    const affiliation = getEmployeeProp(employee, "affiliation");
    const address = getEmployeeProp(employee, "presentAddress");
    const onLeave = Boolean(employee.studyLeave);

    return [
      name,
      designation,
      onLeave ? "Status: Currently on Academic Study Leave" : "",
      department ? `Department: ${department}` : "",
      faculty ? `Faculty: ${faculty}` : "",
      additionalResp ? `Additional Role: ${additionalResp}` : "",
      affiliation ? `Affiliation: ${affiliation}` : "",
      room ? `Office: ${room}` : "",
      email ? `Email: ${email}` : "",
      phone ? `Phone: ${phone}` : "",
      address ? `Address: ${address}` : "",
    ].filter(Boolean).join("\n");
  }

  function showToast(message) {
    if (!elements.toast) return;
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

  async function shareEmployee(employee) {
    const name = getEmployeeProp(employee, "name") || "IUBAT Employee";
    const text = buildEmployeeText(employee);

    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — IUBAT Directory`, text });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    await copyText(text);
    showToast("Employee details copied to clipboard.");
  }

  async function fetchEmployees() {
    const response = await fetch(CONFIG.DATA_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Directory request failed (${response.status}).`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("The directory returned an invalid response.");
    return data;
  }

  function saveCache(employees) {
    try {
      localStorage.setItem(
        CONFIG.CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), employees }),
      );
    } catch (_) {
      // Storage full or unavailable
    }
  }

  function readCache() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY) || "null");
      if (!parsed || !Array.isArray(parsed.employees) || !parsed.employees.length) return null;
      const maxAge = Number(CONFIG.CACHE_MAX_AGE_MS) || 0;
      if (maxAge > 0 && Date.now() - Number(parsed.savedAt || 0) > maxAge) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function showDataNotice(message) {
    if (!elements.dataNoticeText || !elements.dataNotice) return;
    elements.dataNoticeText.textContent = message;
    elements.dataNotice.hidden = false;
  }

  function hideDataNotice() {
    if (elements.dataNotice) elements.dataNotice.hidden = true;
  }

  function uniqueFaculties(employees) {
    return [...new Set(
      employees.map((emp) => getEmployeeProp(emp, "faculty")).filter(Boolean),
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function uniqueDepartments(employees, facultyFilter = "") {
    const list = facultyFilter
      ? employees.filter((emp) => getEmployeeProp(emp, "faculty") === facultyFilter)
      : employees;
    return [...new Set(
      list.map((emp) => getEmployeeProp(emp, "department")).filter(Boolean),
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function updateStats() {
    const total = state.employees.length;
    const depts = uniqueDepartments(state.employees).length;
    const faculties = uniqueFaculties(state.employees).length;

    if (elements.totalEmployees) elements.totalEmployees.textContent = total.toLocaleString();
    if (elements.totalDepartments) elements.totalDepartments.textContent = depts.toLocaleString();
    if (elements.totalFaculties) elements.totalFaculties.textContent = faculties.toLocaleString();
  }

  function populateFacultySelect() {
    if (!elements.facultySelect) return;
    const faculties = uniqueFaculties(state.employees);
    const current = state.selectedFaculty;

    elements.facultySelect.innerHTML = '<option value="">All Faculties</option>' +
      faculties.map((f) => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join("");

    elements.facultySelect.value = current;
  }

  function populateDepartmentSelect() {
    if (!elements.departmentSelect) return;
    const depts = uniqueDepartments(state.employees, state.selectedFaculty);
    const current = state.selectedDepartment;

    const label = state.selectedFaculty ? `All Departments in ${state.selectedFaculty}` : "All Departments";
    elements.departmentSelect.innerHTML = `<option value="">${escapeHtml(label)}</option>` +
      depts.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");

    if (depts.includes(current)) {
      elements.departmentSelect.value = current;
    } else {
      elements.departmentSelect.value = "";
      state.selectedDepartment = "";
    }
  }

  function buildSearchIndex(employee) {
    return [
      getEmployeeProp(employee, "name"),
      getEmployeeProp(employee, "designation"),
      getEmployeeProp(employee, "department"),
      getEmployeeProp(employee, "section"),
      getEmployeeProp(employee, "faculty"),
      getEmployeeProp(employee, "room"),
      getEmployeeProp(employee, "ext"),
      getEmployeeProp(employee, "office"),
      getEmployeeProp(employee, "email"),
      getEmployeeProp(employee, "phone"),
      getEmployeeProp(employee, "qualifications"),
      getEmployeeProp(employee, "additionalResponsibility"),
      getEmployeeProp(employee, "affiliation"),
      getEmployeeProp(employee, "presentAddress"),
      employee.studyLeave ? "study leave abroad" : "active campus",
    ].map(normalize).join(" ");
  }

  function employeeCardTemplate(employee, index) {
    const name = getEmployeeProp(employee, "name") || "IUBAT Employee";
    const designation = getEmployeeProp(employee, "designation") || "Employee";
    const department = getEmployeeProp(employee, "department");
    const room = formatRoom(getEmployeeProp(employee, "room"), getEmployeeProp(employee, "ext")) || getEmployeeProp(employee, "office");
    const email = safeEmail(getEmployeeProp(employee, "email"));
    const phone = phoneParts(getEmployeeProp(employee, "phone"));
    const photo = employee.photo || `assets/images/emp-${String(index + 1).padStart(3, "0")}.webp`;
    const employeeIndex = Number(index);
    const tone = employeeTone(employee);
    const onStudyLeave = Boolean(employee.studyLeave);
    const addResp = getEmployeeProp(employee, "additionalResponsibility");
    const affiliation = getEmployeeProp(employee, "affiliation");

    const badges = [
      onStudyLeave && '<span class="badge badge--study-leave" title="Currently on Academic Study Leave">Study Leave</span>',
      addResp && `<span class="badge badge--role" title="Additional Role: ${escapeHtml(addResp)}">${escapeHtml(addResp)}</span>`,
      affiliation && `<span class="badge badge--affiliation" title="Affiliation: ${escapeHtml(affiliation)}">${escapeHtml(affiliation)}</span>`,
    ].filter(Boolean).join("");

    const details = [
      department && `<li>${icons.building}<span title="${escapeHtml(department)}">${escapeHtml(department)}</span></li>`,
      room && `<li>${icons.room}<span title="${escapeHtml(room)}">${escapeHtml(room)}</span></li>`,
    ].filter(Boolean).join("");

    const contacts = [
      email && `<a class="contact-button" href="mailto:${escapeHtml(email)}" title="Email ${escapeHtml(name)}">${icons.mail}<span>${escapeHtml(email)}</span></a>`,
      phone.tel && `<a class="contact-button" href="tel:${escapeHtml(phone.tel)}" title="Call ${escapeHtml(name)}">${icons.phone}<span>${escapeHtml(phone.display)}</span></a>`,
    ].filter(Boolean).join("");

    const avatarHtml = employee.hasRealPhoto !== false
      ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML='<span class=\\'initials\\'>${escapeHtml(initials(name))}</span>';">`
      : `<span class="initials">${escapeHtml(initials(name))}</span>`;

    return `
      <li class="employee-card employee-card--tone-${tone}" data-employee-index="${employeeIndex}">
        <article>
          <div class="employee-card__header">
            <div class="avatar" aria-hidden="true">${avatarHtml}</div>
            <div class="employee-card__identity">
              <h3 title="${escapeHtml(name)}">${escapeHtml(name)}</h3>
              <p title="${escapeHtml(designation)}">${escapeHtml(designation)}</p>
              ${badges ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">${badges}</div>` : ""}
            </div>
          </div>

          ${details ? `<ul class="employee-meta">${details}</ul>` : '<p class="employee-meta employee-meta--empty">Office details not provided.</p>'}

          ${contacts ? `<div class="employee-contacts">${contacts}</div>` : '<p class="contact-unavailable">Contact information unavailable.</p>'}

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
      const emp = state.employees[index];
      return {
        card,
        employee: emp,
        faculty: normalize(getEmployeeProp(emp, "faculty")),
        department: normalize(getEmployeeProp(emp, "department")),
        isStudyLeave: Boolean(emp.studyLeave),
        searchText: buildSearchIndex(emp),
      };
    });
  }

  function updateResultSummary() {
    const shown = state.filteredEmployees.length;
    const total = state.employees.length;

    if (!total) {
      elements.resultSummary.textContent = "No employees available.";
      return;
    }

    const filters = [];
    if (state.selectedFaculty) filters.push(state.selectedFaculty);
    if (state.selectedDepartment) filters.push(state.selectedDepartment);
    if (state.filterStudyLeave) filters.push("Study Leave");
    if (state.query) filters.push(`"${state.query}"`);

    if (filters.length) {
      elements.resultSummary.textContent = `Showing ${shown.toLocaleString()} of ${total.toLocaleString()} employees (${filters.join(", ")})`;
    } else {
      elements.resultSummary.textContent = `${total.toLocaleString()} verified personnel available`;
    }
  }

  function updateSearchControls() {
    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.hidden = !state.query;
    }
    if (elements.studyLeaveBtn) {
      elements.studyLeaveBtn.classList.toggle("is-active", state.filterStudyLeave);
      elements.studyLeaveBtn.setAttribute("aria-pressed", String(state.filterStudyLeave));
    }
  }

  function applyFilters() {
    const query = normalize(state.query);
    const selectedFaculty = normalize(state.selectedFaculty);
    const selectedDept = normalize(state.selectedDepartment);
    const filterStudyLeave = state.filterStudyLeave;
    const matches = [];

    // Tokenized query matching: all tokens must be present
    const tokens = query ? query.split(/\s+/).filter(Boolean) : [];

    state.cardEntries.forEach((entry) => {
      const matchesTokens = !tokens.length || tokens.every((tok) => entry.searchText.includes(tok));
      const matchesFaculty = !selectedFaculty || entry.faculty === selectedFaculty;
      const matchesDept = !selectedDept || entry.department === selectedDept;
      const matchesStudyLeave = !filterStudyLeave || entry.isStudyLeave;

      const visible = matchesTokens && matchesFaculty && matchesDept && matchesStudyLeave;
      entry.card.hidden = !visible;
      if (visible) matches.push(entry.employee);
    });

    state.filteredEmployees = matches;
    updateResultSummary();
    updateSearchControls();

    const empty = matches.length === 0;
    if (elements.emptyState) elements.emptyState.hidden = !empty;
    if (elements.employeeList) elements.employeeList.hidden = empty;
  }

  function setLoading(isLoading) {
    if (elements.loadingState) elements.loadingState.hidden = !isLoading;
    if (elements.employeeList) {
      elements.employeeList.setAttribute("aria-busy", String(isLoading));
      if (isLoading) elements.employeeList.hidden = true;
    }
    if (isLoading) {
      if (elements.errorState) elements.errorState.hidden = true;
      if (elements.emptyState) elements.emptyState.hidden = true;
    }
  }

  async function loadDirectory() {
    setLoading(true);
    hideDataNotice();

    try {
      const employees = await fetchEmployees();
      state.employees = employees;
      saveCache(employees);
      if (elements.errorState) elements.errorState.hidden = true;
      updateStats();
      populateFacultySelect();
      populateDepartmentSelect();
      renderEmployees();

      // Read optional URL parameters (?q=...&faculty=...&dept=...&studyleave=1)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const initialQuery = urlParams.get("q") || urlParams.get("search");
        const initialFaculty = urlParams.get("faculty");
        const initialDept = urlParams.get("dept") || urlParams.get("department");
        const initialStudy = urlParams.get("studyleave");

        if (initialQuery) {
          state.query = initialQuery;
          if (elements.searchInput) elements.searchInput.value = initialQuery;
        }
        if (initialFaculty) {
          state.selectedFaculty = initialFaculty;
          if (elements.facultySelect) elements.facultySelect.value = initialFaculty;
          populateDepartmentSelect();
        }
        if (initialDept) {
          state.selectedDepartment = initialDept;
          if (elements.departmentSelect) elements.departmentSelect.value = initialDept;
        }
        if (initialStudy === "1" || initialStudy === "true") {
          state.filterStudyLeave = true;
        }
      } catch (_) {}

      updateMobileSearchState();
      applyFilters();
    } catch (error) {
      console.warn("Direct fetch failed, checking local cache...", error);
      const cache = readCache();

      if (cache) {
        state.employees = cache.employees;
        updateStats();
        populateFacultySelect();
        populateDepartmentSelect();
        renderEmployees();
        applyFilters();
        const ageHours = Math.max(1, Math.round((Date.now() - cache.savedAt) / 3_600_000));
        showDataNotice(`Showing saved offline directory from about ${ageHours} hour${ageHours === 1 ? "" : "s"} ago.`);
      } else {
        if (elements.errorMessage) {
          elements.errorMessage.textContent = error.message || "Please check your connection and try again.";
        }
        if (elements.errorState) elements.errorState.hidden = false;
        if (elements.employeeList) elements.employeeList.hidden = true;
        if (elements.resultSummary) elements.resultSummary.textContent = "Directory unavailable";
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
    if (elements.searchInput) elements.searchInput.value = "";
    state.selectedFaculty = "";
    if (elements.facultySelect) elements.facultySelect.value = "";
    state.selectedDepartment = "";
    state.filterStudyLeave = false;
    populateDepartmentSelect();
    applyFilters();
    updateMobileSearchState();
    if (focusSearch && elements.searchInput) {
      elements.searchInput.focus();
    } else {
      document.body.classList.remove("is-search-active");
      const heroEl = document.querySelector(".hero");
      if (heroEl) heroEl.classList.remove("is-search-active");
    }
  }

  function setView(view) {
    state.view = view;
    try {
      localStorage.setItem("iubat_directory_view", view);
    } catch (_) {}

    if (elements.gridViewBtn) {
      elements.gridViewBtn.classList.toggle("is-active", view === "grid");
      elements.gridViewBtn.setAttribute("aria-pressed", String(view === "grid"));
    }
    if (elements.listViewBtn) {
      elements.listViewBtn.classList.toggle("is-active", view === "list");
      elements.listViewBtn.setAttribute("aria-pressed", String(view === "list"));
    }
    if (elements.employeeList) {
      elements.employeeList.classList.toggle("employee-grid--list", view === "list");
    }
  }

  function findEmployeeFromCard(card) {
    const index = Number(card?.dataset.employeeIndex);
    return Number.isInteger(index) ? state.employees[index] : null;
  }

  function profileModalTemplate(employee) {
    const name = getEmployeeProp(employee, "name") || "IUBAT Employee";
    const designation = getEmployeeProp(employee, "designation") || "Employee";
    const department = getEmployeeProp(employee, "department") || "Not provided";
    const faculty = getEmployeeProp(employee, "faculty") || "Not specified";
    const room = formatRoom(getEmployeeProp(employee, "room"), getEmployeeProp(employee, "ext")) || getEmployeeProp(employee, "office") || "Not provided";
    const email = safeEmail(getEmployeeProp(employee, "email"));
    const phone = phoneParts(getEmployeeProp(employee, "phone"));
    const qualifications = getEmployeeProp(employee, "qualifications");
    const additionalResp = getEmployeeProp(employee, "additionalResponsibility");
    const affiliation = getEmployeeProp(employee, "affiliation");
    const presentAddress = getEmployeeProp(employee, "presentAddress");
    const permanentAddress = getEmployeeProp(employee, "permanentAddress");
    const onStudyLeave = Boolean(employee.studyLeave);
    const photo = employee.photo || "";

    const avatarHtml = employee.hasRealPhoto !== false && photo
      ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:18px;font-weight:800;color:white;\\'>${escapeHtml(initials(name))}</span>';">`
      : `<span style="font-size:18px;font-weight:800;color:white;">${escapeHtml(initials(name))}</span>`;

    return `
      <div class="profile-modal">
        <div class="profile-modal__hero">
          <div class="avatar avatar--large" aria-hidden="true">${avatarHtml}</div>
          <div>
            <p class="modal__eyebrow">Employee profile</p>
            <h2 id="modalTitle">${escapeHtml(name)}</h2>
            <p>${escapeHtml(designation)}</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
              ${onStudyLeave ? '<span class="badge badge--study-leave">On Academic Study Leave</span>' : '<span class="badge" style="background:#e6f4ea;color:#137333;border:1px solid #ceead6;">Active Faculty / Staff</span>'}
              ${additionalResp ? `<span class="badge badge--role">${escapeHtml(additionalResp)}</span>` : ""}
            </div>
          </div>
        </div>

        <dl class="profile-details">
          <div><dt>Department / Office</dt><dd>${escapeHtml(department)}</dd></div>
          <div><dt>Faculty / Division</dt><dd>${escapeHtml(faculty)}</dd></div>
          <div><dt>Office / Room</dt><dd>${escapeHtml(room)}</dd></div>
          <div><dt>Phone / Contact</dt><dd>${phone.tel ? `<a href="tel:${escapeHtml(phone.tel)}">${escapeHtml(phone.display)}</a>` : "Not provided"}</dd></div>
          <div class="full-width"><dt>Official Email</dt><dd>${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : "Not provided"}</dd></div>
          ${qualifications ? `<div class="full-width"><dt>Academic Qualifications</dt><dd>${escapeHtml(qualifications)}</dd></div>` : ""}
          ${affiliation ? `<div class="full-width"><dt>Institutional Affiliation</dt><dd>${escapeHtml(affiliation)}</dd></div>` : ""}
          ${presentAddress ? `<div class="full-width"><dt>Present Address</dt><dd>${escapeHtml(presentAddress)}</dd></div>` : ""}
          ${permanentAddress ? `<div class="full-width"><dt>Permanent Address</dt><dd>${escapeHtml(permanentAddress)}</dd></div>` : ""}
        </dl>

        <div class="modal__actions">
          ${email ? `<a class="btn btn--primary" href="mailto:${escapeHtml(email)}">${icons.mail} Send email</a>` : ""}
          ${phone.tel ? `<a class="btn btn--outline" href="tel:${escapeHtml(phone.tel)}">${icons.phone} Call</a>` : ""}
          <button class="btn btn--soft" type="button" data-modal-action="copy">${icons.copy} Copy details</button>
          <button class="btn btn--soft" type="button" data-modal-action="share">${icons.share} Share</button>
        </div>
      </div>
    `;
  }

  function requestModalTemplate() {
    return `
      <div class="request-modal">
        <p class="modal__eyebrow">Directory Support</p>
        <h2 id="modalTitle">Request or update a listing</h2>
        <p class="modal__lead">Report updated employee details or request additions via any of the channels below.</p>
        <div class="request-options">
          <a href="mailto:${escapeHtml(CONFIG.CONTACT.email)}?subject=IUBAT%20Employee%20Directory%20Update" class="request-option">
            <span>${icons.mail}</span><div><strong>Email</strong><small>${escapeHtml(CONFIG.CONTACT.email)}</small></div>${icons.arrow}
          </a>
          <a href="${escapeHtml(CONFIG.CONTACT.github)}" target="_blank" rel="noopener noreferrer" class="request-option">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg></span><div><strong>GitHub</strong><small>shawn-cse</small></div>${icons.arrow}
          </a>
          <a href="${escapeHtml(CONFIG.CONTACT.facebook)}" target="_blank" rel="noopener noreferrer" class="request-option">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg></span><div><strong>Facebook</strong><small>Message shawnazd</small></div>${icons.arrow}
          </a>
          <a href="${escapeHtml(CONFIG.CONTACT.whatsapp)}" target="_blank" rel="noopener noreferrer" class="request-option">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l5.9-1.6A11.8 11.8 0 0 0 20.5 3.5ZM12 21a9.7 9.7 0 0 1-4.9-1.3l-.4-.2-3.5 1 1-3.4-.2-.4A9.7 9.7 0 1 1 12 21Z"/><path d="M8.6 6.8c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 3s1.3 3.5 1.5 3.7c.2.2 2.6 4 6.3 5.6 3.1 1.4 3.7 1.1 4.4 1 .7-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5l-2.6-1.2c-.4-.1-.7-.2-1 .2l-1.1 1.4c-.3.3-.5.3-.9.1a8 8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.4 0-.6.1-.8l.6-.7.4-.7c.1-.3 0-.5 0-.7L9.8 7.3c-.3-.7-.6-.6-1.2-.5Z"/></svg></span><div><strong>WhatsApp</strong><small>+880 1873 319733</small></div>${icons.arrow}
          </a>
        </div>
      </div>
    `;
  }

  function getFocusableElements() {
    return [...elements.modalPanel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((el) => !el.hasAttribute("hidden"));
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

  function updateMobileSearchState() {
    const hasQuery = Boolean(state.query && state.query.trim());
    const isFocused = document.activeElement === elements.searchInput;
    const shouldBeActive = hasQuery || (isFocused && window.innerWidth <= 768);

    document.body.classList.toggle("is-search-active", shouldBeActive);
    const heroEl = document.querySelector(".hero");
    if (heroEl) {
      heroEl.classList.toggle("is-search-active", shouldBeActive);
    }
  }

  function handleSearchFocus() {
    if (window.innerWidth <= 768) {
      document.body.classList.add("is-search-active");
      const heroEl = document.querySelector(".hero");
      if (heroEl) heroEl.classList.add("is-search-active");
      requestAnimationFrame(() => {
        elements.searchInput?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function handleSearchBlur() {
    if (!elements.searchInput?.value.trim()) {
      document.body.classList.remove("is-search-active");
      const heroEl = document.querySelector(".hero");
      if (heroEl) heroEl.classList.remove("is-search-active");
    }
  }

  function runSearchNow() {
    if (state.searchFrame) {
      cancelAnimationFrame(state.searchFrame);
      state.searchFrame = null;
    }
    state.query = elements.searchInput.value;
    updateMobileSearchState();
    applyFilters();
  }

  function handleSearchInput() {
    state.query = elements.searchInput.value;
    updateSearchControls();
    updateMobileSearchState();

    if (state.searchFrame) cancelAnimationFrame(state.searchFrame);
    state.searchFrame = requestAnimationFrame(() => {
      state.searchFrame = null;
      applyFilters();
    });
  }

  function bindEvents() {
    if (elements.searchInput) {
      elements.searchInput.addEventListener("input", handleSearchInput);
      elements.searchInput.addEventListener("focus", handleSearchFocus);
      elements.searchInput.addEventListener("blur", handleSearchBlur);
      elements.searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          runSearchNow();
          document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (elements.searchBtn) {
      elements.searchBtn.addEventListener("click", () => {
        runSearchNow();
        document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.addEventListener("click", () => clearSearch({ focusSearch: true }));
    }
    if (elements.emptyResetBtn) {
      elements.emptyResetBtn.addEventListener("click", () => clearSearch({ focusSearch: true }));
    }
    if (elements.retryBtn) {
      elements.retryBtn.addEventListener("click", loadDirectory);
    }

    if (elements.facultySelect) {
      elements.facultySelect.addEventListener("change", (e) => {
        state.selectedFaculty = e.target.value;
        populateDepartmentSelect();
        applyFilters();
      });
    }

    if (elements.departmentSelect) {
      elements.departmentSelect.addEventListener("change", (e) => {
        state.selectedDepartment = e.target.value;
        applyFilters();
      });
    }

    if (elements.studyLeaveBtn) {
      elements.studyLeaveBtn.addEventListener("click", () => {
        state.filterStudyLeave = !state.filterStudyLeave;
        applyFilters();
      });
    }

    if (elements.gridViewBtn) {
      elements.gridViewBtn.addEventListener("click", () => setView("grid"));
    }
    if (elements.listViewBtn) {
      elements.listViewBtn.addEventListener("click", () => setView("list"));
    }

    // Grid Event Delegation for Profile, Copy, Share
    if (elements.employeeList) {
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
          showToast("Action could not be completed.");
        }
      });
    }

    // Modal internal action buttons (Copy / Share from inside modal)
    if (elements.modalPanel) {
      elements.modalPanel.addEventListener("click", async (event) => {
        const modalBtn = event.target.closest("[data-modal-action]");
        if (!modalBtn || !state.activeModal?.employee) return;

        const emp = state.activeModal.employee;
        if (modalBtn.dataset.modalAction === "copy") {
          try {
            await copyText(buildEmployeeText(emp));
            showToast("Employee details copied.");
          } catch (e) {
            showToast("Failed to copy details.");
          }
        } else if (modalBtn.dataset.modalAction === "share") {
          await shareEmployee(emp);
        }
      });
    }

    // Modal Triggers & Controls
    document.querySelectorAll("[data-open-request]").forEach((button) => {
      button.addEventListener("click", () => openModal("request"));
    });

    if (elements.modalCloseBtn) {
      elements.modalCloseBtn.addEventListener("click", closeModal);
    }
    if (elements.modalOverlay) {
      elements.modalOverlay.addEventListener("click", (event) => {
        if (event.target === elements.modalOverlay) closeModal();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.modalOverlay.hidden) {
        closeModal();
      }
      if (event.key === "/" && document.activeElement !== elements.searchInput && !elements.modalOverlay.classList.contains("is-visible")) {
        event.preventDefault();
        elements.searchInput?.focus();
        elements.searchInput?.select();
      }
    });

    // Back to Top button
    if (elements.backToTopBtn) {
      elements.backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      window.addEventListener("scroll", () => {
        elements.backToTopBtn.hidden = window.scrollY < 300;
      }, { passive: true });
    }

    if (elements.currentYear) {
      elements.currentYear.textContent = String(new Date().getFullYear());
    }
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    loadDirectory();
  });
})();

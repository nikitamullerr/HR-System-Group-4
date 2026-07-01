/* ============================================
   TIME OFF MANAGEMENT — LOGIC
   Dummy data only, all client-side.
   ============================================ */

(function () {
  "use strict";

  /* ---- Data (loaded from JSON files, see loadData()) ---- */
  let requests = [];

  const typeLabel = { vacation: "Vacation", sick: "Sick Leave", personal: "Personal" };
  const avatarColors = { vacation: "#2a6df4", sick: "#e74c5e", personal: "#d8932b" };

  // Maps a free-text leave reason from attendance.json to one of our 3 chip types.
  const reasonToType = (reason) => {
    const r = reason.toLowerCase();
    if (r.includes("sick")) return "sick";
    if (r.includes("vacation")) return "vacation";
    return "personal"; // personal, family responsibility, medical, bereavement, childcare...
  };

  // Maps attendance.json's status wording to the status values this page uses internally.
  const statusMap = { approved: "approved", pending: "pending", denied: "declined" };

  const today = new Date(2026, 5, 30); // 30 June 2026
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;

  /* ---- Load dummy data from JSON files ---- */
  async function loadData() {
    try {
      const res = await fetch("data/attendance.json");
      if (!res.ok) throw new Error("Could not load attendance.json");
      const data = await res.json();

      let nextId = 1;
      requests = data.attendanceAndLeave.flatMap(employee =>
        employee.leaveRequests.map(lr => ({
          id: nextId++,
          name: employee.name,
          type: reasonToType(lr.reason),
          status: statusMap[lr.status.toLowerCase()] || "pending",
          start: lr.date,
          end: lr.date,
        }))
      );
    } catch (err) {
      console.error(err);
      showToast("Couldn't load leave data — check the file path", "danger");
      requests = [];
    }
  }

  /* ---- Helpers ---- */
  function initials(name) {
    return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  }

  function fmtRange(start, end) {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    const opts = { month: "short", day: "numeric" };
    if (start === end) return s.toLocaleDateString("en-US", opts);
    if (s.getMonth() === e.getMonth()) {
      return `${s.toLocaleDateString("en-US", { month: "short" })} ${s.getDate()}-${e.getDate()}`;
    }
    return `${s.toLocaleDateString("en-US", opts)} - ${e.toLocaleDateString("en-US", opts)}`;
  }

  function dateInRange(dateStr, start, end) {
    return dateStr >= start && dateStr <= end;
  }

  function toISO(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  /* ---- Toast ---- */
  function showToast(msg, kind) {
    const el = document.getElementById("toastMsg");
    const icon = kind === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill";
    el.innerHTML = `<i class="bi ${icon}"></i> ${msg}`;
    el.className = `toast-msg show ${kind}`;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.classList.remove("show"); }, 2400);
  }

  /* ---- Stats ---- */
  function renderStats() {
    const pendingCount = requests.filter(r => r.status === "pending").length;
    const approvedCount = requests.filter(r => r.status === "approved").length;
    const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());
    const outToday = requests.filter(r => r.status === "approved" && dateInRange(todayISO, r.start, r.end)).length;

    document.getElementById("statPending").textContent = pendingCount;
    document.getElementById("statApproved").textContent = approvedCount;
    document.getElementById("statToday").textContent = outToday;
  }

  /* ---- Pending list ---- */
  function renderPendingList() {
    const list = document.getElementById("pendingList");
    const empty = document.getElementById("pendingEmpty");
    const pending = requests.filter(r => r.status === "pending");

    list.innerHTML = "";

    if (pending.length === 0) {
      empty.classList.remove("d-none");
      return;
    }
    empty.classList.add("d-none");

    pending.forEach(r => {
      const item = document.createElement("div");
      item.className = "request-item";
      item.innerHTML = `
        <div class="request-left">
          <div class="avatar" style="background:${avatarColors[r.type]}">${initials(r.name)}</div>
          <div class="request-info">
            <span class="request-name">${r.name}</span>
            <span class="request-dates">${fmtRange(r.start, r.end)}
              <span class="type-chip type-${r.type}">${typeLabel[r.type]}</span>
            </span>
          </div>
        </div>
        <div class="request-actions">
          <button class="req-btn approve" title="Approve" data-id="${r.id}" data-action="approved"><i class="bi bi-check2"></i></button>
          <button class="req-btn decline" title="Decline" data-id="${r.id}" data-action="declined"><i class="bi bi-x"></i></button>
        </div>`;
      list.appendChild(item);
    });
  }

  function handleListClick(e) {
    const btn = e.target.closest(".req-btn");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const req = requests.find(r => r.id === id);
    if (!req) return;

    req.status = action === "approved" ? "approved" : "declined";
    renderPendingList();
    renderStats();
    renderCalendar();
    if (selectedDate) renderDayDetail(selectedDate);

    showToast(
      action === "approved" ? `${req.name}'s request was approved` : `${req.name}'s request was declined`,
      action === "approved" ? "success" : "danger"
    );
  }

  /* ---- Calendar ---- */
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function requestsOnDate(dateStr) {
    return requests.filter(r => r.status !== "declined" && dateInRange(dateStr, r.start, r.end));
  }

  function renderCalendar() {
    document.getElementById("monthYearLabel").textContent = `${monthNames[viewMonth]} ${viewYear}`;

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    dayLabels.forEach(l => {
      const el = document.createElement("div");
      el.className = "day-label";
      el.textContent = l;
      grid.appendChild(el);
    });

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, otherMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, otherMonth: false });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, otherMonth: true });
    }

    cells.forEach(cell => {
      const dateStr = !cell.otherMonth ? toISO(viewYear, viewMonth, cell.day) : null;
      const el = document.createElement("div");
      el.className = "day-cell";
      if (cell.otherMonth) el.classList.add("other-month");
      if (dateStr === toISO(today.getFullYear(), today.getMonth(), today.getDate())) el.classList.add("today");
      if (dateStr && dateStr === selectedDate) el.classList.add("selected");

      const num = document.createElement("span");
      num.textContent = cell.day;
      el.appendChild(num);

      if (dateStr) {
        const dayReqs = requestsOnDate(dateStr);
        if (dayReqs.length) {
          const dots = document.createElement("div");
          dots.className = "day-dots";
          const seenTypes = [...new Set(dayReqs.map(r => r.type))];
          seenTypes.forEach(t => {
            const d = document.createElement("span");
            d.className = `dot dot-${t}`;
            dots.appendChild(d);
          });
          el.appendChild(dots);
        }
        el.addEventListener("click", () => {
          selectedDate = dateStr;
          renderCalendar();
          renderDayDetail(dateStr);
        });
      }

      grid.appendChild(el);
    });
  }

  function renderDayDetail(dateStr) {
    const wrap = document.getElementById("dayDetail");
    const dayReqs = requestsOnDate(dateStr);
    const niceDate = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    if (!dayReqs.length) {
      wrap.innerHTML = `<p class="day-detail-empty">No one is out on ${niceDate}.</p>`;
      return;
    }

    wrap.innerHTML = `<div class="day-detail-title">${niceDate} — ${dayReqs.length} ${dayReqs.length === 1 ? "person" : "people"} out</div>`;
    dayReqs.forEach(r => {
      const row = document.createElement("div");
      row.className = "day-detail-item";
      row.innerHTML = `
        <div class="avatar" style="background:${avatarColors[r.type]}">${initials(r.name)}</div>
        <div>
          <strong>${r.name}</strong>
          <span class="type-chip type-${r.type}">${typeLabel[r.type]}</span>
          ${r.status === "pending" ? '<span class="type-chip" style="background:#eee;color:#888;">Pending</span>' : ""}
        </div>`;
      wrap.appendChild(row);
    });
  }

  /* ---- Tabs ---- */
  function setupTabs() {
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.dataset.tab;
        document.querySelectorAll(".tab-panel").forEach(p => {
          p.classList.toggle("d-none", p.dataset.panel !== target);
        });
      });
    });
  }

  /* ---- Month navigation ---- */
  function setupCalendarNav() {
    document.getElementById("prevMonth").addEventListener("click", () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    document.getElementById("nextMonth").addEventListener("click", () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });
  }

  /* ---- Init ---- */
  document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("pendingList").addEventListener("click", handleListClick);
    setupTabs();
    setupCalendarNav();

    await loadData();

    // Point the calendar at the most recent leave request's month so there's
    // something to see right away, instead of defaulting to "today" (which
    // has no dummy data in it).
    if (requests.length) {
      const latest = requests.reduce((a, b) => (a.start > b.start ? a : b));
      const d = new Date(latest.start + "T00:00:00");
      viewYear = d.getFullYear();
      viewMonth = d.getMonth();
    }

    renderStats();
    renderPendingList();
    renderCalendar();
  });
})();
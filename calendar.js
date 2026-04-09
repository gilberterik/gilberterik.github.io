// calendar.js — Rendering engine. Edit data.js instead.

const DAY_NAMES_FULL  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_NAMES_SHORT = ["S","M","T","W","T","F","S"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function parseDate(str) {
  // Parse YYYY-MM-DD as local date (avoid UTC shift)
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildDayMap(periods) {
  // Map from "YYYY-MM-DD" -> { status, label }
  const map = new Map();
  for (const p of periods) {
    const start = parseDate(p.start);
    const end   = parseDate(p.end);
    const cur   = new Date(start);
    while (cur <= end) {
      map.set(toDateKey(cur), { status: p.status, label: p.label || null });
      cur.setDate(cur.getDate() + 1);
    }
  }
  return map;
}

function getDisplayRange(periods) {
  const starts = periods.map(p => parseDate(p.start));
  const ends   = periods.map(p => parseDate(p.end));
  const minDate = starts.reduce((a, b) => a < b ? a : b);
  const maxDate = ends.reduce((a, b) => a > b ? a : b);
  return {
    startMonth: new Date(minDate.getFullYear(), minDate.getMonth(), 1),
    endMonth:   new Date(maxDate.getFullYear(), maxDate.getMonth(), 1),
  };
}

function renderMonth(year, month, dayMap, todayKey) {
  const section = document.createElement("section");
  section.className = "month";
  section.id = `month-${year}-${String(month + 1).padStart(2, "0")}`;

  // Month header
  const header = document.createElement("h2");
  header.className = "month__title";
  header.textContent = `${MONTH_NAMES[month]} ${year}`;
  section.appendChild(header);

  // Day-of-week header row
  const grid = document.createElement("div");
  grid.className = "month__grid";

  const isMobile = window.innerWidth < 420;
  for (let i = 0; i < 7; i++) {
    const dh = document.createElement("div");
    dh.className = "month__dow";
    dh.setAttribute("aria-hidden", "true");
    dh.textContent = isMobile ? DAY_NAMES_SHORT[i] : DAY_NAMES_FULL[i];
    grid.appendChild(dh);
  }

  // First day offset
  const firstDay = new Date(year, month, 1);
  const offset   = firstDay.getDay(); // 0=Sun

  // Empty cells before the 1st
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "day day--empty";
    grid.appendChild(empty);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const key      = toDateKey(cellDate);
    const info     = dayMap.get(key);

    const cell = document.createElement("div");
    cell.className = "day";
    if (info) {
      cell.classList.add(`day--${info.status}`);
    } else {
      cell.classList.add("day--unknown");
    }

    if (key === todayKey) {
      cell.classList.add("day--today");
    }

    if (cellDate < today) {
      cell.classList.add("day--past");
    }

    const num = document.createElement("span");
    num.className = "day__num";
    num.textContent = d;
    cell.appendChild(num);

    if (info) {
      const icon = document.createElement("span");
      icon.className = "day__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = info.status === "texas" ? "🤠" : "🐊";
      cell.appendChild(icon);
    }

    // Tooltip
    if (info || key === todayKey) {
      const tip = document.createElement("div");
      tip.className = "day__tooltip";
      const lines = [];
      if (key === todayKey) lines.push("Today");
      if (info) {
        lines.push(info.status === "texas" ? "Texas" : "Florida");
        if (info.label) lines.push(info.label);
      }
      tip.textContent = lines.join(" · ");
      cell.appendChild(tip);
      cell.setAttribute("tabindex", "0");
      cell.setAttribute("aria-label", lines.join(", "));
    }

    grid.appendChild(cell);
  }

  section.appendChild(grid);
  return section;
}

export function renderCalendar({ periods, ownerName, texasCity }) {
  const container = document.getElementById("calendar");
  if (!container) return;
  container.innerHTML = "";

  const sorted  = [...periods].sort((a, b) => a.start.localeCompare(b.start));
  const dayMap  = buildDayMap(sorted);
  const todayKey = toDateKey(new Date());
  const { startMonth, endMonth } = getDisplayRange(sorted);

  let cur = new Date(startMonth);
  let todaySection = null;

  while (cur <= endMonth) {
    const section = renderMonth(cur.getFullYear(), cur.getMonth(), dayMap, todayKey);
    container.appendChild(section);

    // Track the section containing today for scroll-to
    const [ty, tm] = todayKey.split("-").map(Number);
    if (cur.getFullYear() === ty && cur.getMonth() === tm - 1) {
      todaySection = section;
    }

    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  // Wire up the "Jump to today" button
  const jumpBtn = document.getElementById("jump-today");
  if (jumpBtn) {
    jumpBtn.addEventListener("click", () => {
      if (todaySection) {
        todaySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Build the quick-nav month list
  buildMonthNav(sorted);
}

function buildMonthNav(periods) {
  const nav = document.getElementById("month-nav");
  if (!nav) return;
  nav.innerHTML = "";

  const { startMonth, endMonth } = getDisplayRange(periods);
  let cur = new Date(startMonth);
  while (cur <= endMonth) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const btn = document.createElement("button");
    btn.className = "month-nav__btn";
    btn.textContent = `${MONTH_NAMES[m].slice(0, 3)} ${y}`;
    btn.addEventListener("click", () => {
      const id = `month-${y}-${String(m + 1).padStart(2, "0")}`;
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(btn);
    cur = new Date(y, m + 1, 1);
  }
}

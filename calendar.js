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

function renderUnifiedCalendar(startMonth, endMonth, dayMap, todayKey, labels) {
  const wrapper = document.createElement("div");
  wrapper.className = "calendar-unified";

  const grid = document.createElement("div");
  grid.className = "calendar-unified__grid";
  wrapper.appendChild(grid);

  const isMobile = window.innerWidth < 420;
  for (let i = 0; i < 7; i++) {
    const dh = document.createElement("div");
    dh.className = "month__dow";
    dh.setAttribute("aria-hidden", "true");
    dh.textContent = isMobile ? DAY_NAMES_SHORT[i] : DAY_NAMES_FULL[i];
    grid.appendChild(dh);
  }

  let curMonthStart = new Date(startMonth);
  let curDow = curMonthStart.getDay();

  // Divider for the very first month
  const firstDivider = document.createElement("div");
  firstDivider.className = "month-divider";
  firstDivider.textContent = `${MONTH_NAMES[curMonthStart.getMonth()]} ${curMonthStart.getFullYear()}`;
  grid.appendChild(firstDivider);

  // Initial padding
  for (let i = 0; i < curDow; i++) {
    const empty = document.createElement("div");
    empty.className = "day day--empty";
    grid.appendChild(empty);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  window.monthNavAnchors = {}; // Store scroll anchors

  while (curMonthStart <= endMonth) {
    const year = curMonthStart.getFullYear();
    const month = curMonthStart.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add anchor to first cell of the month
    const firstDayCellId = `month-${year}-${String(month + 1).padStart(2, "0")}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const key      = toDateKey(cellDate);
      const info     = dayMap.get(key);

      const cell = document.createElement("div");
      cell.className = "day";

      if (d === 1) {
        cell.id = firstDayCellId;
        window.monthNavAnchors[firstDayCellId] = cell;
      }

      if (info) {
        cell.classList.add(`day--${info.status}`);
      } else {
        cell.classList.add("day--unknown");
      }

      if (key === todayKey) {
        cell.classList.add("day--today");
        window.todayAnchor = cell;
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
        if (info.status === "texas") icon.textContent = "🤠";
        else if (info.status === "florida") icon.textContent = "🐊";
        else if (info.status === "uncertain") icon.textContent = "❓";
        cell.appendChild(icon);
      }

      // Tooltip
      if (info || key === todayKey) {
        const tip = document.createElement("div");
        tip.className = "day__tooltip";
        const lines = [];
        if (key === todayKey) lines.push("Today");
        if (info) {
          if (info.status === "texas") lines.push(labels.texas);
          else if (info.status === "florida") lines.push(labels.florida);
          else if (info.status === "uncertain") lines.push("Uncertain");
          if (info.label) lines.push(info.label);
        }
        tip.textContent = lines.join(" · ");
        cell.appendChild(tip);
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("aria-label", lines.join(", "));
      }

      grid.appendChild(cell);
      curDow = (curDow + 1) % 7;
    }

    curMonthStart = new Date(year, month + 1, 1);

    if (curMonthStart <= endMonth) {
      // Pad out the rest of the week
      if (curDow !== 0) {
        for (let i = curDow; i < 7; i++) {
          const empty = document.createElement("div");
          empty.className = "day day--empty";
          grid.appendChild(empty);
        }
      }
      // Insert divider
      const divider = document.createElement("div");
      divider.className = "month-divider";
      divider.textContent = `${MONTH_NAMES[curMonthStart.getMonth()]} ${curMonthStart.getFullYear()}`;
      grid.appendChild(divider);

      // Update curDow for the next month
      curDow = curMonthStart.getDay();

      // Pad the start of the next month
      for (let i = 0; i < curDow; i++) {
        const empty = document.createElement("div");
        empty.className = "day day--empty";
        grid.appendChild(empty);
      }
    }
  }

  return wrapper;
}

export function renderCalendar({ periods, ownerName, texasCity, floridaCity }) {
  const container = document.getElementById("calendar");
  if (!container) return;

  const sorted  = [...periods].sort((a, b) => a.start.localeCompare(b.start));
  const dayMap  = buildDayMap(sorted);
  const todayKey = toDateKey(new Date());
  const { startMonth, endMonth } = getDisplayRange(sorted);
  const labels = { texas: texasCity, florida: floridaCity };

  // Store data globally for re-rendering
  window.calendarData = { startMonth, endMonth, dayMap, todayKey, labels };

  container.innerHTML = "";
  container.className = "break-view";
  const unified = renderUnifiedCalendar(startMonth, endMonth, dayMap, todayKey, labels);
  container.appendChild(unified);

  // Wire up the "Jump to today" button
  const jumpBtn = document.getElementById("jump-today");
  if (jumpBtn && !jumpBtn.hasAttribute("data-bound")) {
    jumpBtn.addEventListener("click", () => {
      if (window.todayAnchor) {
        window.todayAnchor.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    jumpBtn.setAttribute("data-bound", "true");
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
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    nav.appendChild(btn);
    cur = new Date(y, m + 1, 1);
  }
}

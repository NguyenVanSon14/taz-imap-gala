// ============================================================
// LỊCH CHIẾU — 2 vé suất chiếu, lịch tháng 11/2026, 2 đồng hồ đếm ngược
// Mọi số liệu đọc từ event-data.js
// ============================================================
import { SHOWS, CALENDAR, showStart, showDayEnd } from "./event-data.js";
import { byId, escapeHtml as esc } from "./utils.js";

const PIN_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-7.58 7-12A7 7 0 0 0 5 10c0 4.42 7 12 7 12Z"/><circle cx="12" cy="10" r="2.6"/></svg>`;

const STAR_ICON = `<svg class="calendar__star" viewBox="0 0 40 40" aria-hidden="true"><polygon fill="#f0c96a" stroke="#fff3c4" stroke-width="1.2" stroke-linejoin="round" points="20,2 25,14.1 38.1,15.1 28.1,23.6 31.2,36.4 20,29.5 8.8,36.4 11.9,23.6 1.9,15.1 15,14.1"/></svg>`;

// ---------- Vé xem phim ----------
export function renderTickets() {
  const wrap = byId("tickets");
  if (!wrap) return;
  wrap.innerHTML = SHOWS.map((s, i) => {
    const duration = s.durationMinutes
      ? `<dd>${esc(s.durationMinutes)} phút</dd>`
      : `<dd class="is-pending">Đang cập nhật</dd>`;
    return `
      <article class="ticket reveal delay-${i + 1}" aria-label="Suất chiếu ${esc(s.region)}">
        <div class="ticket__main">
          <p class="ticket__band"><span>VÉ MỜI</span><span>SUẤT ${esc(s.regionShort)}</span></p>
          <h3 class="ticket__region">${esc(s.region.toUpperCase())}</h3>
          <dl class="ticket__info">
            <div><dt>Thời gian</dt><dd><strong>${esc(s.time)}</strong> · ngày ${esc(s.dateLabel)}</dd></div>
            <div><dt>Rạp</dt><dd>${esc(s.venue)}</dd></div>
            <div><dt>Thời lượng công chiếu</dt>${duration}</div>
          </dl>
        </div>
        <div class="ticket__stub">
          <p class="ticket__seat"><span>GHẾ</span><b>${esc(s.ticketNo)}</b></p>
          <div class="ticket__barcode" aria-hidden="true"></div>
          <a class="btn-map" href="${esc(s.mapUrl)}" target="_blank" rel="noopener noreferrer">
            ${PIN_ICON}<span>Chỉ đường đến rạp</span>
          </a>
        </div>
      </article>`;
  }).join("");
}

// ---------- Lịch tháng (tuần bắt đầu Thứ 2) ----------
export function renderCalendar() {
  const grid = byId("calendarGrid");
  if (!grid) return;
  const { year, month } = CALENDAR;
  const title = byId("calendarTitle");
  if (title) title.textContent = `Tháng ${month} · ${year}`;

  // Dùng UTC để thứ trong tuần không lệch theo múi giờ máy khách
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 = CN
  const offset = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const marks = new Map();
  SHOWS.forEach((s) => {
    const [y, m, d] = s.isoDate.split("-").map(Number);
    if (y === year && m === month) marks.set(d, s);
  });

  let html = `<span class="calendar__day" aria-hidden="true"></span>`.repeat(offset);
  for (let d = 1; d <= daysInMonth; d++) {
    const show = marks.get(d);
    html += show
      ? `<span class="calendar__day calendar__day--target" aria-label="Ngày ${d}/${month}: suất chiếu ${esc(show.region)}">
          ${STAR_ICON}<span class="calendar__num">${d}</span><span class="calendar__tag">${esc(show.calendarLabel)}</span>
        </span>`
      : `<span class="calendar__day">${d}</span>`;
  }
  grid.innerHTML = html;
}

// ---------- Hai đồng hồ đếm ngược ----------
const UNITS = [
  ["days", "NGÀY"],
  ["hours", "GIỜ"],
  ["mins", "PHÚT"],
  ["secs", "GIÂY"],
];

export function initCountdowns() {
  const wrap = byId("countdowns");
  if (!wrap) return;

  wrap.innerHTML = SHOWS.map((s, i) => `
    <div class="countdown film-frame reveal delay-${i + 1}" data-show="${esc(s.id)}">
      <p class="countdown__label">Suất chiếu ${esc(s.region)} – ${esc(s.dateDots)}</p>
      <div class="countdown__clock">
        ${UNITS.map(([key, cap], k) => `
          ${k ? `<span class="countdown__sep" aria-hidden="true">:</span>` : ""}
          <span class="countdown__unit"><span class="countdown__num" data-unit="${key}">00</span><span class="countdown__cap">${cap}</span></span>
        `).join("")}
      </div>
      <p class="countdown__status" hidden></p>
    </div>`).join("");

  const items = SHOWS.map((s) => {
    const el = wrap.querySelector(`[data-show="${s.id}"]`);
    return {
      start: showStart(s).getTime(),
      end: showDayEnd(s).getTime(),
      clock: el.querySelector(".countdown__clock"),
      status: el.querySelector(".countdown__status"),
      nums: Object.fromEntries(UNITS.map(([key]) => [key, el.querySelector(`[data-unit="${key}"]`)])),
    };
  });

  const tick = () => {
    const now = Date.now();
    items.forEach((it) => updateCountdown(it, now));
  };
  tick();
  setInterval(tick, 1000);
}

function updateCountdown(it, now) {
  const diff = it.start - now;
  if (diff <= 0) {
    // Hết giờ: không hiện số âm
    it.clock.hidden = true;
    it.status.hidden = false;
    it.status.textContent = now <= it.end ? "Đang công chiếu" : "Đã công chiếu";
    return;
  }
  const pad = (n) => String(n).padStart(2, "0");
  const values = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    mins: Math.floor(diff / 60000) % 60,
    secs: Math.floor(diff / 1000) % 60,
  };
  for (const key in values) {
    const text = pad(values[key]);
    if (it.nums[key].textContent !== text) it.nums[key].textContent = text;
  }
}

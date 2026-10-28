// ============================================================
// TÊN KHÁCH QUA URL (?name=... hoặc ?to=... hoặc ?guest=...)
// Luôn gán bằng textContent nên tên chứa <script> chỉ hiện như chữ thường.
// ============================================================
import { EVENT } from "./event-data.js";
import { byId } from "./utils.js";

export function readGuestName() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("name") || params.get("to") || params.get("guest") || "";
  let name = raw;
  // Link bị mã hóa 2 lần (vd %25C3...) thì giải thêm một lần; lỗi thì giữ nguyên
  if (/%[0-9a-f]{2}/i.test(raw)) {
    try { name = decodeURIComponent(raw); } catch { name = raw; }
  }
  return name.replace(/\s+/g, " ").trim().slice(0, 120);
}

export function applyGuestName(name) {
  const display = name || EVENT.defaultGuest;
  const sizeClass = display.length > 34 ? "is-very-long" : display.length > 18 ? "is-long" : "";

  ["introGuest", "coverGuest"].forEach((id) => {
    const el = byId(id);
    if (!el) return;
    el.textContent = display;
    if (sizeClass) el.classList.add(sizeClass);
  });

  const input = byId("rsvpName");
  if (input && name) input.value = name;
}

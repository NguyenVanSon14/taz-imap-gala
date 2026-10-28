// ============================================================
// TIỆN ÍCH DÙNG CHUNG
// ============================================================

export const byId = (id) => document.getElementById(id);

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function lockScroll(lock) {
  document.documentElement.classList.toggle("no-scroll", lock);
  document.body.classList.toggle("no-scroll", lock);
}

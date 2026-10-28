// ============================================================
// LIGHTBOX — xem ảnh phóng to (tái sử dụng khung lightbox của source)
// openLightbox([{ src, caption }], index)
// ============================================================
import { byId, lockScroll } from "./utils.js";

const lightbox = byId("lightbox");
const img = byId("lightboxImg");
const caption = byId("lightboxCaption");
const counter = byId("lightboxCounter");
const closeBtn = byId("lightboxClose");

let items = [];
let current = 0;
let lastFocus = null;

function show(index, animate) {
  if (!items.length) return;
  current = (index + items.length) % items.length;
  const item = items[current];
  const apply = () => {
    img.src = item.src;
    img.alt = item.caption || "Ảnh thầy cô IMAP";
    caption.textContent = item.caption || "";
    counter.textContent = `${current + 1} / ${items.length}`;
    img.classList.remove("is-animating");
  };
  if (animate) {
    img.classList.add("is-animating");
    setTimeout(apply, 150);
  } else {
    apply();
  }
}

export function openLightbox(list, index = 0) {
  if (!lightbox || !list || !list.length) return;
  items = list;
  lastFocus = document.activeElement;
  show(index, false);
  lightbox.classList.toggle("lightbox--single", items.length < 2);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  lockScroll(true);
  closeBtn.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lockScroll(false);
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

export function initLightbox() {
  if (!lightbox || !img) return;
  closeBtn.addEventListener("click", closeLightbox);
  byId("lightboxOverlay").addEventListener("click", closeLightbox);
  byId("lightboxPrev").addEventListener("click", (e) => { e.stopPropagation(); show(current - 1, true); });
  byId("lightboxNext").addEventListener("click", (e) => { e.stopPropagation(); show(current + 1, true); });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") show(current + 1, true);
    else if (e.key === "ArrowLeft") show(current - 1, true);
  });

  let touchX = 0;
  lightbox.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].screenX - touchX;
    if (Math.abs(diff) > 45 && items.length > 1) show(current + (diff < 0 ? 1 : -1), true);
  }, { passive: true });
}

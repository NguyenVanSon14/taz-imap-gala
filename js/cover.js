// ============================================================
// TRANG BÌA — điền địa điểm từ event-data.js, nạp cúp ngôi sao nếu có
// ============================================================
import { SHOWS, ASSETS } from "./event-data.js";
import { byId } from "./utils.js";

// Mọi phần tử có data-show="hcm|hn" data-field="venue|dateLabel|..." lấy chữ từ SHOWS
export function fillShowFields(root = document) {
  root.querySelectorAll("[data-show][data-field]").forEach((el) => {
    const show = SHOWS.find((s) => s.id === el.dataset.show);
    const value = show && show[el.dataset.field];
    if (value != null) el.textContent = value;
  });
}

// Có assets/images/trophy.png thì thay khung chờ SVG bằng ảnh thật
export function loadTrophy() {
  const box = byId("coverTrophy");
  if (!box || !ASSETS.trophy) return;
  const img = new Image();
  img.decoding = "async";
  img.alt = "Cúp ngôi sao và dải phim vàng";
  img.onload = () => box.replaceChildren(img);
  img.onerror = () => console.info("Chưa có", ASSETS.trophy, "- đang dùng khung chờ.");
  img.src = ASSETS.trophy;
}

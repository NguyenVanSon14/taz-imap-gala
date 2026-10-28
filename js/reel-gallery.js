// ============================================================
// DẢI CUỘN PHIM ẢNH THẦY CÔ (trang Giới thiệu)
// Đọc TEACHER_PHOTOS trong event-data.js. Chưa có ảnh -> ô phim trống màu ngà.
// Bấm ảnh mở lightbox.
// ============================================================
import { TEACHER_PHOTOS } from "./event-data.js";
import { openLightbox } from "./lightbox.js";

const FRAME_STEP = 124;   // rộng 1 ô phim + khoảng cách (khớp .reel__frame trong film.css)
const MIN_SPAN = 1800;    // nửa dải phải dài hơn màn hình rộng nhất để chạy vòng liền mạch
const EMPTY_SLOTS = 8;

function emptyFrame() {
  const el = document.createElement("span");
  el.className = "reel__frame reel__frame--empty";
  return el;
}

export function renderReels() {
  const photos = TEACHER_PHOTOS.filter((p) => p && p.src);
  const base = photos.length
    ? photos.map((p, index) => ({ ...p, index }))
    : Array.from({ length: EMPTY_SLOTS }, () => null);

  const tracks = [
    document.querySelector("#reelTop .reel__track"),
    document.querySelector("#reelBottom .reel__track"),
  ];

  tracks.forEach((track, row) => {
    if (!track) return;
    // Hàng dưới đảo thứ tự cho khác hàng trên
    const seq = row === 1 ? [...base].reverse() : base;
    let run = [...seq];
    while (run.length * FRAME_STEP < MIN_SPAN) run = run.concat(seq);
    const all = run.concat(run); // nhân đôi để translateX(-50%) lặp không bị giật

    const frag = document.createDocumentFragment();
    all.forEach((p, k) => {
      if (!p) {
        frag.append(emptyFrame());
        return;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reel__frame";
      btn.setAttribute("aria-label", `Xem ảnh: ${p.caption || "Thầy cô IMAP"}`);
      // Chỉ lượt đầu của hàng trên nhận focus bàn phím, tránh tab qua hàng chục bản sao
      if (row === 1 || k >= seq.length) btn.tabIndex = -1;

      const img = document.createElement("img");
      img.src = p.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => btn.replaceWith(emptyFrame());

      btn.append(img);
      btn.addEventListener("click", () => openLightbox(photos, p.index));
      frag.append(btn);
    });
    track.replaceChildren(frag);
  });
}

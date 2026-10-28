// ============================================================
// HIỆU ỨNG PHIM KHI CUỘN
// - reveal: nội dung hiện dần (giữ cơ chế của source)
// - nhấp nháy "đầu cuộn phim" khi mỗi trang vào khung hình lần đầu
// - ẩn dải phim hai rìa ở Thư ngỏ / Xác nhận (section có data-edges="off")
// ============================================================
import { prefersReducedMotion } from "./utils.js";

const REVEAL_SELECTOR = ".reveal, .reveal-fade, .reveal-fade-down, .reveal-left, .reveal-right";

export function initReveal() {
  const targets = document.querySelectorAll(REVEAL_SELECTOR);
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
  targets.forEach((el) => observer.observe(el));
}

export function initSceneLeader() {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const scene = entry.target;
      observer.unobserve(scene); // mỗi trang chỉ chạy một lần
      scene.classList.add("is-leader");
      setTimeout(() => scene.classList.remove("is-leader"), 600);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".scene").forEach((el) => observer.observe(el));
}

export function initEdgeToggle() {
  if (!("IntersectionObserver" in window)) return;
  // Vạch ngang giữa màn hình: trang nào đang nằm trên vạch đó quyết định có dải phim hay không
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.body.classList.toggle("edges-off", entry.target.dataset.edges === "off");
    });
  }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
  document.querySelectorAll(".scene").forEach((el) => observer.observe(el));
}

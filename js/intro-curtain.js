// ============================================================
// MÀN MỞ ĐẦU — màn nhung, máy quay, chuyển cảnh vào rạp rồi vào trang Bìa
// Trình tự hình ảnh nằm ở css/intro.css; file này chỉ gắn class đúng mốc giờ,
// phát âm thanh, vẽ bụi sáng và xử lý "Bỏ qua".
// ============================================================
import { byId, prefersReducedMotion, lockScroll } from "./utils.js";
import { unlockAudio, playCurtainSwish, playProjector, stopProjector } from "./sfx.js";
import { playMusic } from "./music.js";

// [mốc ms, class gắn lên .intro]
const STEPS = [
  [0, "is-opening"],
  [1500, "is-rolling"],
  [3000, "is-zooming"],
  [4200, "is-theater"],
  [4500, "is-titled"],
  [5200, "is-entering"],
];
const REVEAL_AT = 5200; // trang Bìa bắt đầu hiện dưới lớp intro đang mờ dần
const DONE_AT = 6050;

export function initIntro({ onReveal }) {
  const intro = byId("intro");
  const stage = byId("introStage");
  const skipBtn = byId("introSkip");
  let revealed = false;

  const reveal = () => {
    if (revealed) return;
    revealed = true;
    document.body.classList.remove("is-intro");
    onReveal();
  };

  if (!intro || !stage) {
    reveal();
    return;
  }

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  lockScroll(true);

  const reduced = prefersReducedMotion();
  const stopDust = reduced ? () => {} : startDust(byId("introDust"));
  const timers = [];
  let started = false;
  let finished = false;

  function start() {
    if (started) return;
    started = true;
    // Âm thanh chỉ phát sau khi khách bấm
    unlockAudio();
    playMusic();

    if (reduced) {
      // Không zoom, không khói/bụi: màn chỉ mờ dần rồi vào thẳng trang bìa
      reveal();
      intro.classList.add("is-gone");
      timers.push(setTimeout(finish, 650));
      return;
    }

    skipBtn.hidden = false;
    playCurtainSwish();
    playProjector(1.5);

    STEPS.forEach(([at, cls]) => {
      timers.push(setTimeout(() => {
        if (cls === "is-zooming") aimZoomAtLens();
        intro.classList.add(cls);
      }, at));
    });
    timers.push(setTimeout(reveal, REVEAL_AT));
    timers.push(setTimeout(finish, DONE_AT));
  }

  function skip() {
    if (finished) return;
    timers.forEach(clearTimeout);
    stopProjector();
    reveal();
    intro.classList.add("is-gone");
    timers.push(setTimeout(finish, 450));
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    stopDust();
    stopProjector();
    reveal();
    intro.hidden = true;
    lockScroll(false);
  }

  // Đặt tâm zoom đúng ống kính và kéo ống kính về giữa khung hình
  function aimZoomAtLens() {
    const cam = byId("introCamera");
    const lens = byId("introLensPoint");
    if (!cam || !lens) return;
    const s = stage.getBoundingClientRect();
    const c = cam.getBoundingClientRect();
    const l = lens.getBoundingClientRect();
    const lx = l.left + l.width / 2 - c.left;
    const ly = l.top + l.height / 2 - c.top;
    cam.style.setProperty("--lens-x", `${lx}px`);
    cam.style.setProperty("--lens-y", `${ly}px`);
    cam.style.setProperty("--zoom-x", `${s.left + s.width / 2 - (c.left + lx)}px`);
    cam.style.setProperty("--zoom-y", `${s.top + s.height / 2 - (c.top + ly)}px`);
  }

  stage.addEventListener("click", start);
  skipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    skip();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && started && !finished) skip();
  });
}

// ---------- Bụi sáng li ti bay lơ lửng (canvas, tối đa ~50 hạt) ----------
function startDust(canvas) {
  if (!canvas || !canvas.getContext) return () => {};
  const ctx = canvas.getContext("2d");
  const COUNT = 50;
  const parts = [];
  let w = 0;
  let h = 0;
  let raf = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  for (let i = 0; i < COUNT; i++) {
    parts.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(0.05 + Math.random() * 0.18),
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.01 + Math.random() * 0.03,
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffe9b8";
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.twinkle;
      if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
      if (p.x < -4) p.x = w + 4;
      else if (p.x > w + 4) p.x = -4;
      // Hạt nằm trong luồng đèn giữa sân khấu thì sáng hơn
      const inBeam = 1 - Math.min(1, Math.abs(p.x - w / 2) / (w * 0.45));
      ctx.globalAlpha = (0.2 + 0.6 * inBeam) * (0.55 + 0.45 * Math.sin(p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  window.addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

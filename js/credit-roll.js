// ============================================================
// THƯ NGỎ — chạy chữ từ dưới lên như credit cuối phim + video throwback
// - Chỉ chạy khi màn chiếu vào khung hình; bấm màn chiếu: tạm dừng/chạy tiếp
// - Hết chữ thì dừng ở dòng ký tên; nút ↻ Xem lại
// - prefers-reduced-motion: không chạy chữ, hiện toàn văn trong khung cuộn được
// ============================================================
import { THROWBACK_VIDEO } from "./event-data.js";
import { byId, prefersReducedMotion } from "./utils.js";
import { duckForVideo } from "./music.js";

const DURATION = 52000; // ~52 giây cho hết thư
const HINT_RUNNING = "Chạm vào màn chiếu để tạm dừng";

export function initCreditRoll() {
  initThrowback();

  const box = byId("credits");
  const roll = byId("creditsRoll");
  const sign = byId("creditsSign");
  const replay = byId("creditsReplay");
  const hint = byId("creditsHint");
  if (!box || !roll || !sign) return;

  const setHint = (text) => { if (hint) hint.textContent = text; };

  if (prefersReducedMotion() || typeof roll.animate !== "function") {
    box.classList.add("is-static");
    setHint("Kéo trong màn chiếu để đọc toàn văn");
    if (replay) replay.hidden = true;
    return;
  }

  let anim = null;

  function build(progress) {
    const viewH = box.clientHeight;
    // Điểm dừng: dòng ký tên nằm giữa màn chiếu
    const endY = -(sign.offsetTop + sign.offsetHeight / 2 - viewH / 2);
    if (anim) anim.cancel();
    anim = roll.animate(
      [
        { transform: `translate3d(0, ${viewH}px, 0)` },
        { transform: `translate3d(0, ${endY}px, 0)` },
      ],
      { duration: DURATION, easing: "linear", fill: "forwards" }
    );
    anim.currentTime = Math.min(progress, 1) * DURATION;
    anim.onfinish = () => setHint("Hết thư · bấm ↻ để xem lại");
    box.classList.remove("is-paused");
  }

  function start() {
    if (anim) return;
    build(0);
    setHint(HINT_RUNNING);
  }

  function togglePause() {
    if (!anim) { start(); return; }
    if (anim.playState === "finished") return;
    if (anim.playState === "paused") {
      anim.play();
      box.classList.remove("is-paused");
      setHint(HINT_RUNNING);
    } else {
      anim.pause();
      box.classList.add("is-paused");
      setHint("Đã tạm dừng · chạm để chạy tiếp");
    }
  }

  // Trước khi chạy: giấu chữ ngay dưới mép màn chiếu
  roll.style.transform = `translate3d(0, ${box.clientHeight}px, 0)`;

  box.addEventListener("click", togglePause);
  box.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      togglePause();
    }
  });

  if (replay) {
    replay.addEventListener("click", () => {
      build(0);
      setHint(HINT_RUNNING);
    });
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        start();
      }
    }, { threshold: 0.35 });
    io.observe(box);
  } else {
    start();
  }

  // Đổi kích thước màn hình -> chữ xuống dòng khác -> tính lại, giữ nguyên tiến độ
  let resizeTimer = 0;
  let lastWidth = box.clientWidth;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!anim || box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;
      const wasPaused = anim.playState === "paused";
      build((anim.currentTime || 0) / DURATION);
      if (wasPaused) {
        anim.pause();
        box.classList.add("is-paused");
      }
    }, 200);
  });
}

// ---------- Video throwback cạnh màn chiếu ----------
function initThrowback() {
  const wrap = byId("throwback");
  const media = byId("throwbackMedia");
  const soundBtn = byId("throwbackSound");
  const screen = byId("letterScreen");
  const { file, youtubeId } = THROWBACK_VIDEO;
  if (!wrap || !media || (!file && !youtubeId)) return; // chưa có video -> khung giữ ẩn

  let setMuted;
  let muted = true;

  const hideVideo = () => {
    wrap.hidden = true;
    screen.classList.remove("has-video");
    duckForVideo(false);
  };

  if (file) {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "metadata";
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.addEventListener("error", hideVideo);
    video.src = file;
    media.append(video);
    setMuted = (m) => {
      video.muted = m;
      if (!m) video.play().catch(() => {});
    };
    // Ra khỏi khung hình thì tạm dừng cho nhẹ máy
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.1 }).observe(video);
    }
  } else {
    const id = encodeURIComponent(youtubeId);
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&controls=0&rel=0&modestbranding=1&enablejsapi=1`;
    frame.title = "Video throwback";
    frame.allow = "autoplay; encrypted-media; picture-in-picture";
    frame.loading = "lazy";
    media.append(frame);
    const command = (func) => {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
      }
    };
    setMuted = (m) => {
      command(m ? "mute" : "unMute");
      if (!m) command("playVideo");
    };
  }

  wrap.hidden = false;
  screen.classList.add("has-video");

  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    muted = !muted;
    setMuted(muted);
    duckForVideo(!muted);
    soundBtn.setAttribute("aria-pressed", String(!muted));
    soundBtn.firstElementChild.textContent = muted ? "🔇" : "🔊";
    soundBtn.querySelector(".throwback__sound-text").textContent = muted ? "Bật tiếng" : "Tắt tiếng";
  });
}

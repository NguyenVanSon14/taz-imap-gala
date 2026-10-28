// ============================================================
// NHẠC NỀN + NÚT BẬT/TẮT
// Thiếu file nhạc thì ẩn nút, không báo lỗi ra màn hình.
// ============================================================
import { ASSETS } from "./event-data.js";
import { byId } from "./utils.js";

const audio = byId("bgMusic");
const toggle = byId("musicToggle");
let available = true;
let pausedForVideo = false;

function setUI(isPlaying) {
  if (!toggle) return;
  toggle.classList.toggle("is-playing", isPlaying);
  toggle.setAttribute("aria-label", isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền");
}

function markUnavailable(reason) {
  if (!available) return;
  available = false;
  console.warn("Không có nhạc nền:", reason);
  setUI(false);
  if (toggle) toggle.hidden = true;
}

export function initMusic() {
  if (!audio || !toggle) return;
  audio.src = ASSETS.music;
  audio.volume = 0.6;

  audio.addEventListener("play", () => setUI(true));
  audio.addEventListener("pause", () => setUI(false));
  audio.addEventListener("error", () => markUnavailable(ASSETS.music));

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    if (audio.paused) {
      pausedForVideo = false;
      playMusic();
    } else {
      pauseMusic();
    }
  });
}

export function playMusic() {
  if (!audio || !available) return;
  const p = audio.play();
  if (p && p.catch) {
    p.catch((err) => {
      // NotAllowedError = trình duyệt chặn autoplay -> giữ nút để khách tự bật
      if (err && err.name === "NotAllowedError") setUI(false);
      else markUnavailable(err && err.message ? err.message : err);
    });
  }
}

export function pauseMusic() {
  if (audio) audio.pause();
}

export function showMusicToggle() {
  if (toggle && available) toggle.hidden = false;
}

// Bật tiếng video throwback thì tạm dừng nhạc nền, tắt tiếng thì phát lại
export function duckForVideo(videoHasSound) {
  if (!audio) return;
  if (videoHasSound) {
    pausedForVideo = !audio.paused;
    audio.pause();
  } else if (pausedForVideo) {
    pausedForVideo = false;
    playMusic();
  }
}

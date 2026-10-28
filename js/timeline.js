// ============================================================
// TIMELINE CHƯƠNG TRÌNH — cột trụ dải phim đứng, mỗi mốc một khung phim
// Dữ liệu: TIMELINE trong event-data.js
// ============================================================
import { TIMELINE } from "./event-data.js";
import { byId, escapeHtml as esc } from "./utils.js";

export function renderTimeline() {
  const list = byId("timelineList");
  if (!list) return;

  list.innerHTML = TIMELINE.map((item) => {
    const [from, to] = item.time.split("–").map((s) => s.trim());
    const clap = item.scene
      ? `<span class="clap" aria-hidden="true"><span class="clap__top"></span><span class="clap__body">${esc(item.scene)}</span></span>`
      : "";
    const sceneForReader = item.scene ? `<span class="sr-only">${esc(item.scene)} – </span>` : "";
    const desc = item.desc ? `<p class="reel-timeline__desc">${esc(item.desc)}</p>` : "";
    return `
      <li class="reel-timeline__item reveal${item.isFinal ? " reel-timeline__item--final" : ""}">
        <p class="reel-timeline__time">${esc(from)}${to ? `<small>– ${esc(to)}</small>` : ""}</p>
        <span class="reel-timeline__node" aria-hidden="true"></span>
        <div class="reel-timeline__frame">
          ${clap}
          <h3 class="reel-timeline__title">${sceneForReader}${esc(item.title)}</h3>
          ${desc}
        </div>
      </li>`;
  }).join("");
}

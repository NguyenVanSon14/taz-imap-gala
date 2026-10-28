// ============================================================
// KHỞI ĐỘNG THIỆP — chỉ gọi các module, không chứa logic riêng
// ============================================================
import { ASSETS } from "./event-data.js";
import { readGuestName, applyGuestName } from "./guest.js";
import { initMusic, showMusicToggle } from "./music.js";
import { preloadSfx } from "./sfx.js";
import { initIntro } from "./intro-curtain.js";
import { initReveal, initSceneLeader, initEdgeToggle } from "./film-effects.js";
import { fillShowFields, loadTrophy } from "./cover.js";
import { renderTickets, renderCalendar, initCountdowns } from "./schedule.js";
import { renderTimeline } from "./timeline.js";
import { renderReels } from "./reel-gallery.js";
import { initLightbox } from "./lightbox.js";
import { initCreditRoll } from "./credit-roll.js";
import { initRsvp } from "./rsvp.js";

const guestName = readGuestName();
applyGuestName(guestName);

initMusic();
preloadSfx(ASSETS.projector);

// Dựng nội dung từ event-data.js
fillShowFields();
loadTrophy();
renderTickets();
renderCalendar();
initCountdowns();
renderTimeline();
renderReels();
initLightbox();
initRsvp(guestName);

// Màn mở đầu xong thì mới bật hiệu ứng cuộn
initIntro({
  onReveal() {
    showMusicToggle();
    initReveal();
    initSceneLeader();
    initEdgeToggle();
    initCreditRoll();
  },
});

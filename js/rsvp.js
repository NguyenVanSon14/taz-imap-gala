// ============================================================
// XÁC NHẬN THAM DỰ -> FIREBASE REALTIME DATABASE
// Node: invitations/imap-gala-2026/rsvp (xem js/firebase-config.js)
// ============================================================
import { EVENT, SHOWS } from "./event-data.js";
import { byId, escapeHtml as esc } from "./utils.js";
import { sendRsvp, newRsvpId } from "./rsvp-service.js";

const MSG_OK = "Cảm ơn Thầy/Cô đã xác nhận! Hẹn gặp tại buổi công chiếu 🎬";
const MSG_FAIL = "Chưa gửi được, Thầy/Cô thử lại giúp nhé.";

export function initRsvp(guestName) {
  const form = byId("rsvpForm");
  if (!form) return;
  const nameInput = byId("rsvpName");
  const submitBtn = byId("rsvpSubmit");
  const statusEl = byId("rsvpStatus");
  const regionWrap = byId("regionChoices");

  regionWrap.innerHTML = SHOWS.map((s) => `
    <label class="choice">
      <input type="radio" name="region" value="${esc(s.id)}" required />
      <span class="choice__pill">${esc(s.region)}<span class="choice__sub">${esc(s.dateLabel)}</span></span>
    </label>`).join("");

  const setStatus = (text, isError = false) => {
    statusEl.textContent = text;
    statusEl.classList.toggle("is-error", isError);
  };

  // Chọn lại thì bỏ viền đỏ
  form.addEventListener("input", (e) => {
    const field = e.target.closest(".field");
    if (field) field.classList.remove("has-error");
  });

  // Giữ id + giờ tạo cho lần gửi đang dở: bấm gửi lại thì ghi đè đúng bản đó, không tạo bản trùng
  let pending = null;
  let sending = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").replace(/\s+/g, " ").trim().slice(0, 120);
    const region = String(fd.get("region") || "");
    const attend = fd.get("attend") === "no" ? "no" : "yes";

    if (!name) {
      nameInput.closest(".field").classList.add("has-error");
      setStatus("Thầy/Cô vui lòng nhập họ tên giúp nhé.", true);
      nameInput.focus();
      return;
    }
    if (!SHOWS.some((s) => s.id === region)) {
      regionWrap.closest(".field").classList.add("has-error");
      setStatus("Thầy/Cô vui lòng chọn suất chiếu tham dự.", true);
      regionWrap.querySelector("input").focus();
      return;
    }

    sending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi…";
    setStatus("");

    if (!pending) pending = { id: newRsvpId(), createdAt: Date.now() };
    try {
      await sendRsvp({
        id: pending.id,
        createdAt: pending.createdAt,
        name,
        attend,
        region,
        eventId: EVENT.id,
        urlName: (guestName || "").slice(0, 120),
      });
      pending = null;
      setStatus(MSG_OK);
      form.reset();
      if (guestName) nameInput.value = guestName;
    } catch (err) {
      console.error("Gửi xác nhận lỗi:", err && (err.code || err.message), err);
      setStatus(MSG_FAIL, true);
    } finally {
      sending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi xác nhận";
    }
  });
}

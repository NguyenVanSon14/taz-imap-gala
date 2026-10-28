// ============================================================
// XÁC NHẬN THAM DỰ -> FIRESTORE (events/TAZ0000/guestbook + rsvp)
// Firebase được nạp riêng: mạng chặn gstatic thì phần còn lại của thiệp vẫn chạy.
// ============================================================
import { EVENT, SHOWS } from "./event-data.js";
import { byId, escapeHtml as esc } from "./utils.js";

const MSG_OK = "Cảm ơn Thầy/Cô đã xác nhận! Hẹn gặp tại buổi công chiếu 🎬";
const MSG_FAIL = "Chưa gửi được, Thầy/Cô thử lại giúp nhé.";

export function initRsvp(guestName) {
  const form = byId("rsvpForm");
  if (!form) return;
  const nameInput = byId("rsvpName");
  const submitBtn = byId("rsvpSubmit");
  const statusEl = byId("rsvpStatus");
  const regionWrap = byId("regionChoices");

  // Bắt đầu tải Firebase ngay, lỗi thì để lúc gửi báo thân thiện
  const firebaseReady = import("./firebase-config.js");
  firebaseReady.catch((err) => console.error("Không tải được Firebase:", err));

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

  let sending = false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").replace(/\s+/g, " ").trim();
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

    try {
      const { guestbookCollection, rsvpCollection, addDoc, serverTimestamp } = await firebaseReady;
      const data = {
        name,
        message: "",
        status: attend === "no" ? "not-attending" : "attending",
        attend,
        region,
        eventId: EVENT.id,
        urlName: guestName || "",
        createdAt: serverTimestamp(),
      };
      const results = await Promise.allSettled([
        addDoc(guestbookCollection, data),
        addDoc(rsvpCollection, data),
      ]);
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length === results.length) throw failed[0].reason;
      failed.forEach((r) => console.error("Firestore: 1 collection ghi lỗi:", r.reason));

      setStatus(MSG_OK);
      form.reset();
      if (guestName) nameInput.value = guestName;
    } catch (err) {
      console.error("Firebase Submit Error:", err);
      setStatus(MSG_FAIL, true);
    } finally {
      sending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi xác nhận";
    }
  });
}

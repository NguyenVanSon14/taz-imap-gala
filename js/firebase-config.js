// ============================================================
// FIREBASE CONFIG — Gala 20/11 IMAP "ĐIỆN ẢNH – Scenes of Inspiration" (TAZ0000)
// Project Firebase RIÊNG cho thiệp sự kiện (tách khỏi project thiệp tốt nghiệp).
// Lấy 4 giá trị trong Firebase Console → Project settings → Your apps (xem FIREBASE.md).
// Node riêng của đơn này: invitations/imap-gala-2026/rsvp
// Rules gộp của project sự kiện: D:\Taz_thiep\firebase-taz-events.rules.json
// apiKey của ứng dụng web là mã công khai. KHÔNG ghi mật khẩu admin vào file này.
// Để trống thì thiệp vẫn chạy, chỉ form xác nhận báo "chưa gửi được".
// ============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyCkWTdYBQ7JwdfUHx0_-P8NyV0ln_UazA8",
  authDomain: "taz-event-90874.firebaseapp.com",
  projectId: "taz-event-90874",
  databaseURL: "https://taz-event-90874-default-rtdb.asia-southeast1.firebasedatabase.app",
};

export const rsvpConfig = {
  path: "invitations/imap-gala-2026/rsvp",
  adminsPath: "admins",
};

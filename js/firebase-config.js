// ============================================================
// FIREBASE CONFIG — Gala 20/11 IMAP "ĐIỆN ẢNH – Scenes of Inspiration" (TAZ0000)
// Project: graduation-65518 (Realtime Database), dùng chung với các thiệp khác.
// Node riêng của đơn này: invitations/imap-gala-2026/rsvp
// Rules phải là bản gộp: D:\Taz_thiep\firebase-graduation-65518.rules.json
// apiKey của ứng dụng web là mã công khai. KHÔNG ghi mật khẩu admin vào file này.
// ============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyA11Mxyc9psGg6gayNt7RHQJ6EiDmOQ2eI",
  authDomain: "graduation-65518.firebaseapp.com",
  projectId: "graduation-65518",
  databaseURL: "https://graduation-65518-default-rtdb.asia-southeast1.firebasedatabase.app",
};

export const rsvpConfig = {
  path: "invitations/imap-gala-2026/rsvp",
  adminsPath: "admins",
};

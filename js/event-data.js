// ============================================================
// THÔNG TIN SỰ KIỆN — Gala 20/11 IMAP "ĐIỆN ẢNH – Scenes of Inspiration"
// Khách gửi thêm thông tin thì CHỈ sửa file này.
// Dòng nào có "TODO: chờ khách xác nhận" là giá trị tạm.
// ============================================================

export const EVENT = {
  id: "TAZ0000",
  producer: "IMAP",
  defaultGuest: "Quý Thầy Cô",
  timezone: "+07:00",
  // Domain đang chạy (Cloudflare Pages). Đổi domain thì sửa thêm og:url / og:image trong index.html.
  siteUrl: "https://taz-imap-gala.pages.dev",
};

// Hai suất chiếu. Giờ bắt đầu = isoDate + time (múi giờ +07:00).
export const SHOWS = [
  {
    id: "hcm",
    region: "Hồ Chí Minh",
    regionShort: "HCM",
    calendarLabel: "HCM",
    isoDate: "2026-11-15",
    dateLabel: "15/11/2026",
    dateDots: "15.11.2026",
    time: "16:00", // TODO: chờ khách xác nhận giờ bắt đầu (tạm lấy giờ check-in)
    durationMinutes: null, // TODO: chờ khách xác nhận thời lượng (null = "Đang cập nhật")
    // TODO: chờ khách xác nhận — poster ghi "Trung tâm hội nghị Hương Phố", file ý tưởng ghi "Nhà hàng Hương Phố"
    venue: "Nhà hàng Hương Phố",
    // TODO: chờ khách xác nhận — đang dùng link tìm kiếm, thay bằng link Google Maps chính xác
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Nh%C3%A0%20h%C3%A0ng%20H%C6%B0%C6%A1ng%20Ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh",
    ticketNo: "A·15", // chỉ để trang trí trên vé
  },
  {
    id: "hn",
    region: "Hà Nội",
    regionShort: "HN",
    calendarLabel: "Hà Nội",
    isoDate: "2026-11-22",
    dateLabel: "22/11/2026",
    dateDots: "22.11.2026",
    time: "16:00", // TODO: chờ khách xác nhận giờ bắt đầu (tạm lấy giờ check-in)
    durationMinutes: null, // TODO: chờ khách xác nhận thời lượng (null = "Đang cập nhật")
    venue: "Trung tâm Sự kiện Forevermark Lạc Long Quân",
    // TODO: chờ khách xác nhận — đang dùng link tìm kiếm, thay bằng link Google Maps chính xác
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Forevermark%20L%E1%BA%A1c%20Long%20Qu%C3%A2n%20H%C3%A0%20N%E1%BB%99i",
    ticketNo: "B·22",
  },
];

// Lịch tháng hiển thị (tháng 11/2026). month: 1–12
export const CALENDAR = { year: 2026, month: 11 };

// Timeline chung cho cả hai suất chiếu
export const TIMELINE = [
  { time: "16:00 – 17:30", title: "Check-in", desc: "Chụp ảnh, trải nghiệm photobooth, video 360 độ" },
  { time: "17:30 – 17:45", title: "Khai mạc chương trình" },
  { time: "17:45 – 18:45", scene: "SCENE 01", title: "HEROES", desc: "Những người tạo nên dấu ấn" },
  { time: "18:45 – 19:30", scene: "SCENE 02", title: "OFF CAMERA", desc: "Phía sau ánh đèn" },
  { time: "19:30 – 20:30", scene: "SCENE 03", title: "SPOTLIGHT", desc: "Khoảnh khắc tỏa sáng" },
  { time: "20:30", scene: "FINAL SCENE", title: "TOGETHER", isFinal: true },
];

// Ảnh thầy cô cho dải cuộn phim (trang Giới thiệu).
// TODO: chờ khách gửi ảnh — đặt vào assets/images/teachers/ rồi liệt kê ở đây, vd:
//   { src: "assets/images/teachers/01.jpg", caption: "Thầy cô IMAP" },
// Mảng rỗng = hiện ô phim trống màu ngà.
export const TEACHER_PHOTOS = [];

// Video throwback trong rạp (trang Thư ngỏ). Chỉ điền MỘT trong hai.
// TODO: chờ khách gửi video. Để trống cả hai = ẩn khung video.
export const THROWBACK_VIDEO = {
  file: "",      // vd "assets/video/throwback.mp4"
  youtubeId: "", // vd "dQw4w9WgXcQ" (chỉ phần ID sau "v=")
};

// Tài nguyên — thiếu file thì thiệp vẫn chạy (bỏ qua âm thanh / hiện khung chờ)
export const ASSETS = {
  music: "assets/audio/background-music.mp3",      // TODO: chờ khách gửi nhạc nền
  projector: "assets/audio/projector-start.mp3",   // TODO: chờ tiếng máy chiếu (thiếu thì tự tạo tiếng bằng Web Audio)
  trophy: "assets/images/trophy.png",              // TODO: chờ cúp ngôi sao nền trong suốt
};

// Giờ bắt đầu dạng Date (đúng múi giờ +07:00 dù máy khách ở đâu)
export function showStart(show) {
  return new Date(`${show.isoDate}T${show.time}:00${EVENT.timezone}`);
}

// Hết ngày công chiếu (23:59:59 giờ VN) — sau mốc này hiện "Đã công chiếu"
export function showDayEnd(show) {
  return new Date(`${show.isoDate}T23:59:59${EVENT.timezone}`);
}

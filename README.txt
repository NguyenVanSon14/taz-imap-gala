THƯ MỜI ONLINE — GALA 20/11 IMAP "ĐIỆN ẢNH – SCENES OF INSPIRATION"
Mã đơn: TAZ0000
======================================================================
Chủ đề: Buổi công chiếu điện ảnh — đỏ nhung, vàng ánh kim, rạp phim tối.
Hai suất chiếu: TP. Hồ Chí Minh 15/11/2026 · Hà Nội 22/11/2026.

--------------------------------------------------------------
1. CẤU TRÚC THƯ MỤC
--------------------------------------------------------------
TAZ0000_IMAP/
├── index.html              (thiệp mời)
├── admin.html              (quản trị xác nhận tham dự — đăng nhập admin Firebase)
├── css/
│   ├── style.css           (biến màu/font, layout chung, reveal, nút nhạc, lightbox)
│   ├── intro.css           (màn mở đầu: màn nhung, máy quay, chuyển cảnh)
│   ├── film.css            (hạt nhiễu, dải phim hai rìa, rạp/ghế, cuộn phim ảnh, credit roll)
│   └── sections.css        (Bìa, Lịch chiếu, Timeline, Giới thiệu, Thư ngỏ, Xác nhận, The End)
├── js/
│   ├── event-data.js       (TOÀN BỘ thông tin sự kiện — khách gửi gì thì sửa file này)
│   ├── firebase-config.js  (project graduation-65518, node invitations/imap-gala-2026/rsvp)
│   ├── rsvp-service.js     (gửi xác nhận / đăng nhập admin qua REST)
│   ├── main.js             (chỉ khởi động các module)
│   ├── intro-curtain.js    (màn mở đầu + bụi sáng)
│   ├── sfx.js              (tiếng màn, tiếng máy chiếu — tự tạo nếu thiếu file)
│   ├── music.js            (nhạc nền + nút bật/tắt)
│   ├── film-effects.js     (reveal, nhấp nháy đầu phim, bật/tắt dải phim hai rìa)
│   ├── cover.js            (bìa: địa điểm, cúp ngôi sao)
│   ├── schedule.js         (vé suất chiếu, lịch tháng 11, 2 đồng hồ đếm ngược)
│   ├── timeline.js         (timeline chương trình)
│   ├── reel-gallery.js     (dải cuộn phim ảnh thầy cô)
│   ├── credit-roll.js      (thư ngỏ chạy chữ + video throwback)
│   ├── rsvp.js             (form xác nhận tham dự)
│   ├── lightbox.js, guest.js, utils.js
├── assets/
│   ├── images/             (og-share.jpg; trophy.png; teachers/01.jpg, 02.jpg, ...)
│   ├── audio/              (background-music.mp3, projector-start.mp3)
│   └── video/              (throwback.mp4)
└── README.txt

--------------------------------------------------------------
2. CHẠY THỬ LOCAL
--------------------------------------------------------------
Mở terminal trong thư mục TAZ0000_IMAP rồi chạy:  npx serve .
(Mở trực tiếp file:// sẽ không chạy được JS module.)
Link thử tên khách: http://localhost:3000/?name=Th%E1%BA%A7y%20Minh

--------------------------------------------------------------
3. THÔNG TIN SỰ KIỆN
--------------------------------------------------------------
- Nhà sản xuất: IMAP
- HCM: 15/11/2026 — Nhà hàng Hương Phố
- Hà Nội: 22/11/2026 — Trung tâm Sự kiện Forevermark Lạc Long Quân
- Timeline (chung cho cả hai suất):
    • 16:00 – 17:30  Check-in chụp ảnh, photobooth, video 360 độ
    • 17:30 – 17:45  Khai mạc chương trình
    • 17:45 – 18:45  SCENE 01 – HEROES · Những người tạo nên dấu ấn
    • 18:45 – 19:30  SCENE 02 – OFF CAMERA · Phía sau ánh đèn
    • 19:30 – 20:30  SCENE 03 – SPOTLIGHT · Khoảnh khắc tỏa sáng
    • 20:30          FINAL SCENE – TOGETHER
- Còn chờ khách: giờ bắt đầu + thời lượng từng suất, link Google Maps chính xác,
  tên chính thức địa điểm HCM (poster ghi "Trung tâm hội nghị Hương Phố"), domain.
  Xem các dòng "TODO: chờ khách xác nhận" trong js/event-data.js.

--------------------------------------------------------------
4. TÀI NGUYÊN CẦN ĐẶT ĐÚNG TÊN
--------------------------------------------------------------
- assets/audio/background-music.mp3   nhạc nền
- assets/audio/projector-start.mp3    tiếng máy chiếu 3–4 giây (thiếu thì thiệp tự tạo tiếng)
- assets/images/trophy.png            cúp ngôi sao + dải phim vàng, nền trong suốt
- assets/images/teachers/01.jpg ...   ảnh thầy cô -> khai báo thêm trong TEACHER_PHOTOS (event-data.js)
- assets/video/throwback.mp4          hoặc điền youtubeId trong THROWBACK_VIDEO (event-data.js)
Thiếu file nào thì thiệp vẫn chạy (ẩn/khung chờ), không báo lỗi ra màn hình.

--------------------------------------------------------------
5. QUẢN TRỊ (admin.html) + FIREBASE
--------------------------------------------------------------
- Đăng nhập bằng tài khoản admin Firebase của project Graduation (graduation-65518),
  cùng tài khoản đang dùng cho thiệp Khánh Linh. Không còn PIN.
- Danh sách xác nhận, lọc theo phản hồi và theo suất chiếu (HCM / Hà Nội),
  số đếm riêng từng suất, nút Xóa từng phản hồi, tự làm mới mỗi 30 giây,
  tạo link mời cá nhân hóa hàng loạt.
- Dữ liệu: Realtime Database, node invitations/imap-gala-2026/rsvp
  Mỗi bản ghi: name, attend ("yes"|"no"), region ("hcm"|"hn"), eventId ("TAZ0000"),
  urlName, authorId, createdAt.
- Rules: dán file gộp D:\Taz_thiep\firebase-graduation-65518.rules.json vào
  Realtime Database → Rules → Publish (KHÔNG dán riêng khối của thiệp này).
- Khách gửi xác nhận bằng đăng nhập ẩn danh (Anonymous phải đang bật trong Authentication).

--------------------------------------------------------------
6. DEPLOY (Cloudflare Pages — Direct Upload)
--------------------------------------------------------------
- Link: https://taz-imap-gala.pages.dev   (admin: /admin.html, Pages tự chuyển về /admin)
- Deploy lại: copy index.html, admin.html, 404.html, _headers, css/, js/, assets/ ra 1 thư mục tạm rồi chạy
    npx wrangler pages deploy <thư-mục-tạm> --project-name taz-imap-gala --branch main
  (KHÔNG thêm --force; --force chỉ dùng 1 lần lúc tạo project.)
- Đổi domain: sửa og:url / og:image trong index.html + EVENT.siteUrl trong js/event-data.js.

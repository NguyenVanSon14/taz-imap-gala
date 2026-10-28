# Cài Firebase cho thiệp sự kiện (xác nhận tham dự + trang quản trị)

Thiệp sự kiện dùng **một project Firebase riêng**, tách khỏi project thiệp tốt nghiệp (`graduation-65518`).
Mỗi thiệp sự kiện có node riêng trong `invitations/…`. Đơn này dùng `invitations/imap-gala-2026/rsvp`.

- **Khách** đăng nhập ẩn danh (Anonymous) để gửi xác nhận, không đọc được danh sách.
- **Admin** đăng nhập Email/Password trên `admin.html`. Ai là admin do node `admins` trong database quyết định.

## Bước 1 – Tạo project
1. <https://console.firebase.google.com> → **Create a project**. Đặt tên dễ nhận, ví dụ `Taz Event`. Google Analytics: không cần.
2. Ở trang chủ project bấm biểu tượng **Web `</>`**, đặt tên app (ví dụ `taz-imap-gala`), **không** bật Hosting.
3. Firebase hiện đoạn `firebaseConfig`: giữ lại `apiKey`, `authDomain`, `projectId`.

## Bước 2 – Tạo Realtime Database
**Build → Realtime Database → Create Database** → vùng **Singapore (asia-southeast1)** → **Start in locked mode**.
Sao chép địa chỉ ở đầu trang: `https://<project-id>-default-rtdb.asia-southeast1.firebasedatabase.app`.

## Bước 3 – Bật đăng nhập
**Build → Authentication → Get started → Sign-in method**: bật **Anonymous** và **Email/Password**.

## Bước 4 – Tạo tài khoản admin
1. **Authentication → Users → Add user**: email và mật khẩu mạnh (tự giữ, không gửi qua chat).
2. Sao chép cột **User UID**.
3. **Realtime Database → Data** → bấm **+** ở dòng gốc → Key `admins` → thêm con: Key = UID, Value = `true`
   (boolean, không có dấu ngoặc kép).

## Bước 5 – Dán rules
**Realtime Database → Rules** → xóa nội dung cũ → dán **toàn bộ** file
`D:\Taz_thiep\firebase-taz-events.rules.json` → **Publish**.
Sau này thêm thiệp sự kiện mới vào project này thì gộp tiếp khối của thiệp đó vào file trên, không dán đè.

## Bước 6 – Điền cấu hình
Điền 4 giá trị vào `js/firebase-config.js` (`apiKey`, `authDomain`, `projectId`, `databaseURL`).
`apiKey` của web app là mã công khai, đặt trong code được. **Không** ghi mật khẩu admin vào bất kỳ file nào.

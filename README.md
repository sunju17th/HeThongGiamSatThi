# Hệ thống Thi Trực Tuyến & Giám Sát Chống Gian Lận (Online Exam Proctoring System)

Một nền tảng thi trắc nghiệm trực tuyến toàn diện với tính năng giám sát tự động. Hệ thống được xây dựng với kiến trúc Fullstack hiện đại (MERN stack), cho phép giáo viên quản lý kỳ thi chặt chẽ và sinh viên làm bài với trải nghiệm mượt mà, đồng thời ngăn chặn các hành vi gian lận thông qua cơ chế theo dõi hành vi tự động.

## 🌟 Tính năng nổi bật

### Dành cho Giáo viên / Quản trị (Teacher)
- **Quản lý đề thi:** Soạn thảo đề thi trực tiếp trên giao diện web (thêm/xóa câu hỏi, cấu hình đáp án, điểm số).
- **Cấu hình bảo mật:** Cài đặt thời gian làm bài, thời gian mở/đóng ca thi, giới hạn số lần vi phạm gian lận cho phép.
- **Gán quyền dự thi:** Chỉ định trực tiếp những sinh viên nào được phép tham gia kỳ thi.
- **Theo dõi thời gian thực & Báo cáo:** 
  - Thống kê tự động: Số người đang làm bài, đã nộp, hoặc bị khóa bài.
  - Xem điểm số và **Chi tiết Logs Giám sát** (Ghi nhận chính xác mốc thời gian sinh viên vi phạm quy chế).
- **Xem trước đề thi:** Kiểm tra lại cấu trúc và đáp án chuẩn đã thiết lập.

### Dành cho Sinh viên (Student)
- **Cổng thông tin cá nhân:** Xem danh sách các bài thi được giao và thời gian đếm ngược.
- **Phòng thi an toàn:** Giao diện làm bài tập trung, loại bỏ các yếu tố gây xao nhãng.
- **Chống gian lận tự động (Anti-Cheat):** 
  - Phát hiện chuyển Tab (Visibility Change).
  - Phát hiện click chuột ra ngoài cửa sổ thi (Window Blur).
  - Tự động cộng dồn số lần vi phạm. Nếu vượt quá giới hạn (VD: 3 lần), hệ thống tự động **Khóa bài và Hủy kết quả**.
- **Lịch sử thi:** Xem lại kết quả các bài thi đã làm.

##  Công nghệ sử dụng

- **Frontend:** ReactJS (Vite), React Router DOM v6, Axios, Context API (Quản lý State Xác thực), CSS-in-JS (Inline styles). Giao diện thiết kế theo phong cách Glassmorphism hiện đại.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose Schema).
- **Bảo mật:** JWT (JSON Web Tokens), Bcrypt (Mã hóa mật khẩu).

##  Cấu trúc thư mục

```text
HeThongGiamSatKiThi/
├── Backend/                 # Mã nguồn Server (Node.js/Express)
│   ├── config/              # Kết nối Database
│   ├── controllers/         # Logic xử lý API (Users, Exams, Questions, Sessions)
│   ├── middleware/          # JWT Protect & Role-based Authorization
│   ├── models/              # Mongoose Schema
│   └── routes/              # Định tuyến API
│
└── Frontend/                # Mã nguồn Client (React/Vite)
    ├── src/
    │   ├── components/      # Các thành phần tái sử dụng (Routing, v.v.)
    │   ├── context/         # AuthContext xử lý phiên đăng nhập toàn cục
    │   ├── pages/           # Giao diện chính (Login, Register, Dashboard, ExamRoom...)
    │   └── services/        # Axios instance gọi API
    ├── index.html
    └── package.json
```

##  Hướng dẫn cài đặt & Chạy dự án

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MongoDB (Cài đặt local hoặc sử dụng MongoDB Atlas)

### Bước 1: Khởi động Backend
1. Mở Terminal, di chuyển vào thư mục Backend:
   ```bash
   cd Backend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường: Tạo file `.env` ngang hàng với `server.js` và thêm:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/online_exam_db  # Hoặc đường dẫn MongoDB Atlas của bạn
   JWT_SECRET=chuoi_ky_tu_bi_mat_bat_ky_cua_ban
   ```
4. Chạy server:
   ```bash
   npm run dev
   ```

### Bước 2: Khởi động Frontend
1. Mở một Terminal mới, di chuyển vào thư mục Frontend:
   ```bash
   cd Frontend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Khởi động Vite:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập: `http://localhost:5173`

## Hướng dẫn sử dụng cơ bản

1. Truy cập Frontend, chọn **"Đăng ký ngay"** để tạo một tài khoản mới. Mặc định tài khoản tạo ra sẽ có role là `student`.
2. Để có tài khoản **Giáo viên**, bạn có thể tạo thủ công trực tiếp trong MongoDB (Sửa trường `role` thành `teacher`) hoặc dùng tính năng Update User trên Backend thông qua Postman.
3. Đăng nhập bằng tài khoản Giáo viên -> **Tạo kỳ thi** -> **Thêm sinh viên vào kỳ thi**.
4. Mở trình duyệt ẩn danh, đăng nhập bằng tài khoản sinh viên vừa được gán -> **Vào phòng thi**.
5. Thử chuyển Tab hoặc click sang màn hình khác để test tính năng hệ thống tự động cảnh báo gian lận.


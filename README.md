# 🎓 Hệ thống Thi Trực Tuyến & Giám Sát Chống Gian Lận (Online Exam Proctoring System)

Một nền tảng thi trắc nghiệm trực tuyến toàn diện được tích hợp công nghệ **Giám sát gian lận tự động (Anti-Cheat Engine)**. Hệ thống được xây dựng trên nền tảng **Fullstack MERN Stack (MongoDB, Express.js, ReactJS Vite, Node.js)** hiện đại, giao diện thiết kế theo phong cách Glassmorphism & Dark Mode sang trọng, mang lại trải nghiệm thi mượt mà cho sinh viên và công cụ quản lý chặt chẽ cho giáo viên & quản trị viên.

---

## 🌟 Tính năng nổi bật

### 🛡️ Dành cho Quản trị viên (Admin)
- **Bảng điều khiển Quản trị (`AdminDashboard`):** Thống kê tổng quan realtime toàn hệ thống:
  - Tổng số lượng Sinh viên, Giáo viên và Admin.
  - Tổng số lượng Bài thi đã tạo.
  - Tổng số Phiên thi (`ExamSession`) và số phiên thi bị hệ thống **Khóa bài (`locked`)** do gian lận.
- **Quản lý & Bảo mật người dùng:** Phân quyền vai trò người dùng chuẩn xác, chặn tuyệt đối lỗ hổng tự nâng quyền khi đăng ký.

### 👨‍🏫 Dành cho Giáo viên (Teacher)
- **Soạn thảo & Tạo bài thi mới:** Tạo kỳ thi trắc nghiệm kèm danh sách câu hỏi, tùy chỉnh các lựa chọn A, B, C, D, chỉ định đáp án đúng và điểm số từng câu.
- **Chỉnh sửa kỳ thi trực quan (Edit Exam):** 
  - Cập nhật tiêu đề, thời lượng làm bài (phút), số lần vi phạm gian lận tối đa (`max_violations`).
  - Thiết lập thời gian mở ca thi (`start_time`) và thời gian đóng ca thi (`end_time`).
  - **Logic bảo vệ:** Tự động chặn cập nhật nếu thời gian bắt đầu lớn hơn hoặc bằng thời gian kết thúc (`start_time >= end_time`).
- **Gán sinh viên dự thi (`Allowed Students`):** Chỉ định cụ thể danh sách sinh viên được phép tham gia kỳ thi.
- **Theo dõi & Báo cáo kết quả:**
  - Thống kê sinh viên đang làm bài, đã nộp hoặc bị khóa bài.
  - Xem chi tiết **Logs Giám sát (Proctoring Logs)** ghi nhận chính xác mốc thời gian và hành vi vi phạm của từng sinh viên.

### 🎓 Dành cho Sinh viên (Student)
- **Cổng thông tin bài thi (`StudentPortal`):**
  - Hiển thị danh sách kỳ thi được giao kèm thông tin **Thời gian bắt đầu, Kết thúc** và **Số lần vi phạm tối đa**.
  - **Badge trạng thái ca thi trực quan:**
    - 🟢 **Đang mở:** Kích hoạt nút *"Vào Thi Ngay"*.
    - ⏳ **Chưa mở:** Nút bị khóa *"Chưa Đến Giờ Thi"*.
    - 🔴 **Đã kết thúc:** Nút bị khóa *"Đã Hết Giờ Thi"*.
- **Phòng thi an toàn chuyên nghiệp (`ExamRoom`):**
  - **Đồng hồ đếm ngược chuẩn xác:** Tính toán theo thời gian thực Server (`Date.now()`), tự động hiển thị cảnh báo đỏ ⚠️ khi còn dưới 3 phút và tự động nộp bài khi hết giờ.
  - **Bảng điều hướng nhanh câu hỏi (Fast-Nav Sidebar):** Hiển thị danh sách ô số câu hỏi, đánh dấu trạng thái *Đã làm* (Xanh) / *Chưa làm* (Xám), cuộn mượt (`smooth scroll`) tới câu tương ứng khi click.
  - **Thanh tiến độ bài làm:** Theo dõi tỷ lệ % câu hỏi đã hoàn thành.
  - **Hộp thoại xác nhận Nộp bài (Confirm Modal):** Nhắc nhở số câu đã làm và cảnh báo nếu còn câu hỏi chưa chọn đáp án trước khi gửi bài.
- **Xem kết quả & Chi tiết bài làm (`StudentExamResult`):**
  - Xem tổng điểm đạt được và số lần vi phạm.
  - Xem lại chi tiết từng câu hỏi: Hiển thị rõ lựa chọn của bản thân `(Bạn chọn)` và **đáp án đúng chuẩn màu xanh (`✓`)** hoặc câu sai (`✗`).

### 🚨 Cơ chế Chống Gian Lận Tự Động (Anti-Cheat Engine)
- **Phát hiện chuyển Tab (`tab_switch`):** Theo dõi sự kiện `visibilitychange` khi sinh viên chuyển sang tab/trình duyệt khác.
- **Phát hiện rời màn hình thi (`window_blur`):** Theo dõi sự kiện `window.onblur` khi click ra ngoài cửa sổ thi.
- **Ghi nhận sự cố kết nối (`reconnected`):** Theo dõi hành vi tải lại trang (`F5`) hoặc rớt mạng kết nối lại.
- **Cơ chế Phòng thủ 2 lớp (Cooldown Guard):** Giới hạn thời gian giữa các log vi phạm (2.5 giây) ở cả Frontend & Backend, loại bỏ hoàn toàn lỗi bị đếm trùng lặp vi phạm khi chuyển tab.
- **Tự động Khóa bài thi (`Auto-Lock`):** Khi số lần vi phạm $\ge$ `max_violations`, hệ thống tự động khóa bài thi, nộp bài tại thời điểm đó và **Hủy kết quả thi**.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** ReactJS (Vite), React Router DOM v7, Axios, Context API (`AuthContext`), CSS Vanilla (Glassmorphism UI, Responsive & Dark Mode).
- **Backend:** Node.js, Express.js (ES Modules architecture).
- **Database:** MongoDB (Mongoose Schema Object Data Modeling).
- **Bảo mật & Phân quyền:**
  - JWT (JSON Web Tokens) xác thực phiên đăng nhập.
  - Bcryptjs mã hóa mật khẩu an toàn.
  - Middleware phân quyền truy cập theo vai trò (`admin`, `teacher`, `student`).
  - Chặn nâng quyền công khai (`Privilege Escalation Prevention`).

---

## 📁 Cấu trúc thư mục dự án

```text
HeThongGiamSatKiThi/
├── Backend/                 # Mã nguồn Server Node.js / Express
│   ├── config/              # Cấu hình kết nối MongoDB (db.js)
│   ├── controllers/         # Logic xử lý API (admin, user, exam, question, session)
│   ├── middleware/          # Middleware JWT Protect & Role Authorization
│   ├── models/              # Mongoose Schema Models (User, Exam, Question, ExamSession)
│   ├── routes/              # Định tuyến Router API (/api/users, /api/exams...)
│   ├── seeder.js            # Tệp khởi tạo dữ liệu mẫu (1 Admin, 3 Giáo viên, 30 Sinh viên)
│   └── server.js            # Entry point ứng dụng Backend
│
└── Frontend/                # Mã nguồn Client ReactJS / Vite
    ├── src/
    │   ├── context/         # AuthContext quản lý state đăng nhập toàn cục
    │   ├── pages/           # Giao diện ứng dụng (LoginPage, AdminDashboard, TeacherDashboard, StudentPortal, ExamRoom, StudentExamResult...)
    │   ├── services/        # Cấu hình Axios instance gọi API (api.js)
    │   ├── App.jsx          # Định tuyến Routes & Bảo vệ ProtectedRoute
    │   └── main.jsx         # Entry point Frontend
    ├── index.html
    └── package.json
```

---

## ⚙️ Hướng dẫn cài đặt & Chạy dự án

### Yêu cầu hệ thống
- **Node.js**: v16 trở lên
- **MongoDB**: Cài đặt MongoDB Local hoặc sử dụng đường dẫn MongoDB Atlas

---

### Bước 1: Khởi chạy Backend Server

1. Mở Terminal và di chuyển vào thư mục `Backend`:
   ```bash
   cd Backend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env` ngang hàng với `server.js`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/online_exam_db
   JWT_SECRET=chuoi_ky_tu_bi_mat_giam_sat_thi_123456
   ```
4. *(Tùy chọn)* Nạp dữ liệu mẫu vào MongoDB (Tạo sẵn Admin, Giáo viên, Sinh viên & Bài thi mẫu):
   ```bash
   node seeder.js
   ```
5. Khởi động Backend Server:
   ```bash
   npm run dev
   ```
   > Backend sẽ chạy tại: `http://localhost:5000`

---

### Bước 2: Khởi chạy Frontend Client

1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục `Frontend`:
   ```bash
   cd Frontend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Khởi động máy chủ Vite Dev:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 🔑 Tài khoản thử nghiệm mặc định (Tạo từ `seeder.js`)

Mật khẩu mặc định cho tất cả các tài khoản thử nghiệm bên dưới là: `password123`

| Vai trò (Role) | Tên đăng nhập (`username`) | Mật khẩu (`password`) | Mô tả |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password123` | Quản trị viên hệ thống, xem thống kê toàn sàn |
| **Giáo viên 1** | `teacher1` | `password123` | Giáo viên (Nguyễn Văn Thầy 1) |
| **Giáo viên 2** | `teacher2` | `password123` | Giáo viên (Trần Thị Cô 2) |
| **Sinh viên 1** | `student1` | `password123` | Sinh viên (Sinh Viên 1) |
| **Sinh viên 2** | `student2` | `password123` | Sinh viên (Sinh Viên 2) |
| **Sinh viên 3->30**| `student3` ... `student30` | `password123` | Các sinh viên thử nghiệm khác |

---

## 📡 Danh sách API Endpoints chính

### 1. Xác thực & Người dùng (`/api/users`)
- `POST /api/users/register`: Đăng ký tài khoản sinh viên công khai.
- `POST /api/users/login`: Đăng nhập & nhận JWT token.
- `GET /api/users`: Lấy danh sách người dùng (Chỉ Giáo viên / Admin).
- `PUT /api/users/:id`: Cập nhật thông tin cá nhân.
- `DELETE /api/users/:id`: Xóa người dùng (Chỉ Admin).

### 2. Quản lý Kỳ thi (`/api/exams`)
- `GET /api/exams`: Lấy danh sách kỳ thi theo phân quyền role.
- `GET /api/exams/:id`: Lấy chi tiết đề thi.
- `POST /api/exams`: Tạo kỳ thi mới (Giáo viên / Admin).
- `PUT /api/exams/:id`: Cập nhật thông tin kỳ thi (Kiểm tra `start_time < end_time`).
- `DELETE /api/exams/:id`: Xóa kỳ thi (Giáo viên / Admin).
- `POST /api/exams/:id/join`: Sinh viên tham gia phòng thi & khởi tạo phiên thi.
- `POST /api/exams/:id/assign`: Gán sinh viên vào danh sách được phép thi.

### 3. Phiên thi & Giám sát (`/api/sessions`)
- `GET /api/sessions/:id`: Lấy thông tin phiên thi & kết quả chi tiết kèm câu hỏi.
- `POST /api/sessions/:sessionId/logs`: Ghi nhận log vi phạm gian lận (Có Cooldown 2.5s).
- `POST /api/sessions/:sessionId/submit`: Nộp bài thi và tính điểm tự động.

### 4. Quản trị hệ thống (`/api/admin`)
- `GET /api/admin/stats`: Lấy dữ liệu thống kê tổng quan (User, Exams, Locked Sessions).

---

## 📌 Hướng dẫn kịch bản thử nghiệm Chống gian lận

1. Đăng nhập bằng tài khoản **Giáo viên** (`teacher1` / `password123`).
2. Nhấp vào **"+ Tạo kỳ thi mới"** hoặc **"📝 Sửa Đề"** để cấu hình bài thi với *Số lần vi phạm tối đa là 3*.
3. Bấm **"+ Thêm SV"** để gán tài khoản `student1` vào bài thi.
4. Mở cửa sổ ẩn danh mới (`Incognito`), đăng nhập bằng `student1` / `password123`.
5. Vào **Student Portal**, nhấp **"Vào Thi Ngay"**.
6. Thử **chuyển Tab** hoặc **click ra ngoài cửa sổ thi**:
   - Hệ thống sẽ phát cảnh báo vi phạm màu vàng ⚠️.
   - Khi cố tình vi phạm quá 3 lần, bài thi ngay lập tức bị **Tự động Khóa (`locked`)** và chuyển thẳng đến màn hình kết quả thông báo **HỦY KẾT QUẢ BÀI THI**.
7. Quay lại giao diện Giáo viên, mở phần **"Xem Báo Cáo"** $\rightarrow$ **"Xem Logs Giám Sát"** để xem toàn bộ lịch sử vi phạm chi tiết theo mốc thời gian thực!

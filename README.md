# 🏸 Badminton Expense Manager

Web quản lý thu chi cầu lông cho đội 8 người.

## Tech Stack
- **Backend**: Java 17 + Spring Boot 3.2 + Spring Data JPA
- **Frontend**: ReactJS 18 + Vite + Axios
- **Database**: MySQL 8

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Bước 1: Cài đặt phần mềm cần thiết

| Phần mềm | Link tải |
|----------|----------|
| Java JDK 17+ | https://adoptium.net |
| Maven 3.9+ | https://maven.apache.org/download.cgi |
| Node.js 20+ | https://nodejs.org |
| MySQL 8 | https://dev.mysql.com/downloads/mysql/ |

> **Tip**: Sau khi cài xong, kiểm tra bằng lệnh:
> ```
> java -version
> mvn -version
> node -version
> ```

### Bước 2: Cấu hình MySQL

1. Đăng nhập MySQL: `mysql -u root -p`
2. Chạy script khởi tạo:
   ```sql
   source E:/Project/init_db.sql
   ```

3. Nếu password MySQL của bạn khác `root`, sửa trong file:
   `E:\Project\backend\src\main\resources\application.properties`
   ```properties
   spring.datasource.password=YOUR_PASSWORD
   ```

### Bước 3: Chạy Backend

Mở terminal, chạy:
```bash
cd E:\Project\backend
mvn spring-boot:run
```

Backend sẽ khởi động tại: **http://localhost:8080**
Spring Boot sẽ tự động tạo các bảng trong MySQL.

### Bước 4: Chạy Frontend

Mở terminal mới (giữ terminal backend chạy), chạy:
```bash
cd E:\Project\frontend
npm install
npm run dev
```

Frontend sẽ khởi động tại: **http://localhost:5173**

Mở trình duyệt và truy cập: **http://localhost:5173**

---

## 📁 Cấu Trúc Dự Án

```
E:\Project\
├── backend\                          ← Spring Boot
│   └── src\main\java\com\badminton\
│       ├── model\                    ← Entity classes
│       ├── repository\               ← JPA Repositories
│       ├── dto\                      ← Request/Response DTOs
│       ├── service\                  ← Business Logic
│       ├── controller\               ← REST API Endpoints
│       └── config\                   ← CORS + Exception Handler
│
├── frontend\                         ← ReactJS + Vite
│   └── src\
│       ├── api\                      ← Axios API calls
│       ├── components\               ← UI Components + Modals
│       ├── utils\                    ← Helpers (format money, etc.)
│       ├── App.jsx                   ← Main component
│       └── index.css                 ← Global styles
│
├── init_db.sql                       ← Script tạo database MySQL
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/members | Danh sách thành viên + số nợ |
| POST | /api/members | Thêm thành viên |
| PUT | /api/members/{id} | Cập nhật thành viên |
| DELETE | /api/members/{id} | Xóa thành viên |
| PATCH | /api/members/{id}/mark-paid | Đánh dấu đã thanh toán tất cả |
| GET | /api/sessions?month=yyyy-MM | Danh sách buổi chơi |
| POST | /api/sessions | Tạo buổi mới |
| PUT | /api/sessions/{id} | Cập nhật buổi |
| DELETE | /api/sessions/{id} | Xóa buổi |
| PATCH | /api/sessions/{id}/payments/{memberId} | Toggle trạng thái thanh toán |
| GET | /api/sessions/stats | Thống kê tổng quan |
| GET | /api/fund | Số dư quỹ |
| POST | /api/fund/add | Nạp quỹ |
| POST | /api/fund/withdraw | Rút quỹ |
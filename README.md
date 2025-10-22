# Dự án Roadmap thông minh cho Sinh viên năm nhất 

Dự án này là một hệ thống web được thiết kế để hỗ trợ sinh viên năm nhất (end user). Mục tiêu kỹ thuật là giải quyết các "pain point" liên quan đến việc sử dụng thư viện  bằng cách cung cấp một công cụ roadmap thông minh  và một hub tài liệu tập trung.

## Chức năng Hệ thống (Business Logic) 

Hệ thống tập trung vào các logic nghiệp vụ chính sau:

* **Hướng dẫn tổng quan:** Cung cấp FAQ, reminder về các thủ tục thư viện (mượn, trả sách) và hiển thị các sách đang nổi của tuần.
* **Hub tài liệu:** Cung cấp một hub tổng quát (trùng với gợi ý 1 của đề) về tài liệu chuyên đề, bài báo khoa học từ các thư viện thuộc Đại học Quốc gia.
* **Roadmap thông minh:** Tính năng cốt lõi, cho phép người dùng tạo roadmap tài liệu chuyên đề theo lộ trình có độ khó tăng dần. Yêu cầu kỹ thuật của tính năng này là phải mang tính tương tác và có khả năng phản hồi thời gian thực.
* **(Optional) Hub giao lưu:** Một confession hub.

## Triển khai Kỹ thuật (Technical Implementation) 

### Sơ đồ Hệ thống (System Diagram) 

Đây là sơ đồ tổng quan nhất về kiến trúc hệ thống: 

*(Hình ảnh diagram từ source 15)*

### Phân tích Kiến trúc

Kiến trúc hệ thống bao gồm 4 thành phần chính: Frontend, Backend, Cache, và Crawler.

1.  **Frontend:**
    * Không phải là phần trọng tâm của dự án, chỉ cần "làm vừa đủ".
    * Gửi `Request` đến Backend và nhận `Response` để hiển thị.

2.  **Backend:**
    * Được xác định là "Trái tim của hệ thống, cần đầu tư kỹ lưỡng".
    * Tiếp nhận `Request` từ Frontend.
    * Xử lý logic đọc dữ liệu:
        * Bước 1: `Read from cache`.
        * Bước 2 (Cache miss): `Read from db`.
        * Bước 3: `Update from db` (cập nhật lại cache).
    * Xử lý logic ghi: `Write to db`.

3.  **Cache:**
    * Nhiệm vụ: Cache lại session (dạng rotate) roadmap của người dùng.
    * Chiến lược: Áp dụng `read-through strategy`. Lý do là application được dự đoán sẽ phải "đọc lại state đã đổi khá nhiều".

4.  **Crawler:**
    * Nhiệm vụ: Fetch sách từ API và thực hiện index.
    * Phương án triển khai: Tạm thời, crawler có thể được triển khai chung với backend hoặc dưới dạng một `daemon` (cron task).
    * Tương tác DB: Crawler có cả quyền `Write to db` (để lưu dữ liệu mới) và `Read from db` (để kiểm tra).

5.  **Thành phần đã loại bỏ (Dropped):**
    * Ban đầu có ý định tích hợp Message Queue (MQ) để tăng tính an toàn.
    * Lý do loại bỏ: Khó và không đủ thời gian.

## Tech Stack 

Ngăn xếp công nghệ dự kiến được sử dụng:

* **Frontend:**
    * Framework: NextJs 
    * Component Library: Shacdn 
    * Fetching: axios 
* **Backend:**
    * Runtime/Framework: Node.js (hoặc NestJS) 
    * Authentication/Authorization: PassportJs 
    * Crawler: Crawlee 
* **Cache:** Redis 
* **Database:**
    * Phương án SQL: Postgres DB 
    * Phương án NoSQL: MongoDB 
    * ORM: Prisma ORM 
* **Tool CI/CD:**
    * VCS: Git / Github 
    * Workflow: Github Workflow 
    * Hosting (Web): Netifly 
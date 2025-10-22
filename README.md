# [cite_start]Dự án Roadmap thông minh cho Sinh viên năm nhất [cite: 1]

[cite_start]Dự án này là một hệ thống web được thiết kế để hỗ trợ sinh viên năm nhất (end user)[cite: 5]. [cite_start]Mục tiêu kỹ thuật là giải quyết các "pain point" liên quan đến việc sử dụng thư viện [cite: 6] [cite_start]bằng cách cung cấp một công cụ roadmap thông minh [cite: 11] [cite_start]và một hub tài liệu tập trung[cite: 10].

## [cite_start]Chức năng Hệ thống (Business Logic) [cite: 3]

Hệ thống tập trung vào các logic nghiệp vụ chính sau:

* [cite_start]**Hướng dẫn tổng quan:** Cung cấp FAQ, reminder về các thủ tục thư viện (mượn, trả sách) và hiển thị các sách đang nổi của tuần[cite: 9].
* [cite_start]**Hub tài liệu:** Cung cấp một hub tổng quát (trùng với gợi ý 1 của đề) về tài liệu chuyên đề, bài báo khoa học từ các thư viện thuộc Đại học Quốc gia[cite: 10].
* [cite_start]**Roadmap thông minh:** Tính năng cốt lõi, cho phép người dùng tạo roadmap tài liệu chuyên đề theo lộ trình có độ khó tăng dần[cite: 11]. [cite_start]Yêu cầu kỹ thuật của tính năng này là phải mang tính tương tác và có khả năng phản hồi thời gian thực[cite: 11].
* [cite_start]**(Optional) Hub giao lưu:** Một confession hub[cite: 12].

## [cite_start]Triển khai Kỹ thuật (Technical Implementation) [cite: 13]

### [cite_start]Sơ đồ Hệ thống (System Diagram) [cite: 14]

[cite_start]Đây là sơ đồ tổng quan nhất về kiến trúc hệ thống: [cite: 15]

*(Hình ảnh diagram từ source 15)*

### Phân tích Kiến trúc

Kiến trúc hệ thống bao gồm 4 thành phần chính: Frontend, Backend, Cache, và Crawler.

1.  **Frontend:**
    * [cite_start]Không phải là phần trọng tâm của dự án, chỉ cần "làm vừa đủ"[cite: 15].
    * [cite_start]Gửi `Request` đến Backend và nhận `Response` để hiển thị[cite: 15].

2.  **Backend:**
    * [cite_start]Được xác định là "Trái tim của hệ thống, cần đầu tư kỹ lưỡng"[cite: 15].
    * [cite_start]Tiếp nhận `Request` từ Frontend[cite: 15].
    * Xử lý logic đọc dữ liệu:
        * [cite_start]Bước 1: `Read from cache`[cite: 15].
        * [cite_start]Bước 2 (Cache miss): `Read from db`[cite: 15].
        * [cite_start]Bước 3: `Update from db` (cập nhật lại cache)[cite: 15].
    * [cite_start]Xử lý logic ghi: `Write to db`[cite: 15].

3.  **Cache:**
    * [cite_start]Nhiệm vụ: Cache lại session (dạng rotate) roadmap của người dùng[cite: 15].
    * [cite_start]Chiến lược: Áp dụng `read-through strategy`[cite: 15]. [cite_start]Lý do là application được dự đoán sẽ phải "đọc lại state đã đổi khá nhiều"[cite: 15].

4.  **Crawler:**
    * [cite_start]Nhiệm vụ: Fetch sách từ API và thực hiện index[cite: 15].
    * [cite_start]Phương án triển khai: Tạm thời, crawler có thể được triển khai chung với backend hoặc dưới dạng một `daemon` (cron task)[cite: 15].
    * [cite_start]Tương tác DB: Crawler có cả quyền `Write to db` (để lưu dữ liệu mới) và `Read from db` (để kiểm tra)[cite: 15].

5.  **Thành phần đã loại bỏ (Dropped):**
    * [cite_start]Ban đầu có ý định tích hợp Message Queue (MQ) để tăng tính an toàn[cite: 15].
    * [cite_start]Lý do loại bỏ: Khó và không đủ thời gian[cite: 15].

## [cite_start]Tech Stack [cite: 16]

Ngăn xếp công nghệ dự kiến được sử dụng:

* **Frontend:**
    * [cite_start]Framework: NextJs [cite: 17]
    * [cite_start]Component Library: Shacdn [cite: 17]
    * [cite_start]Fetching: axios [cite: 17]
* **Backend:**
    * [cite_start]Runtime/Framework: Node.js (hoặc NestJS) [cite: 18]
    * [cite_start]Authentication/Authorization: PassportJs [cite: 18]
    * [cite_start]Crawler: Crawlee [cite: 18]
* [cite_start]**Cache:** Redis [cite: 19]
* **Database:**
    * [cite_start]Phương án SQL: Postgres DB [cite: 20]
    * [cite_start]Phương án NoSQL: MongoDB [cite: 20]
    * [cite_start]ORM: Prisma ORM [cite: 20]
* **Tool CI/CD:**
    * [cite_start]VCS: Git / Github [cite: 21]
    * [cite_start]Workflow: Github Workflow [cite: 21]
    * [cite_start]Hosting (Web): Netifly [cite: 21]
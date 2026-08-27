# USE CASE MATRIX

## 1. Vai trò thực tế

| Mã | Vai trò | Xác nhận |
| --- | --- | --- |
| PUB | Khách chưa đăng nhập | Có giao diện công khai |
| CIT | Người dân | Có đăng nhập và luồng riêng |
| OFF | Cán bộ CSKV | Có đăng nhập và cổng nghiệp vụ |

Không tạo nhóm CMD/ADM vì chưa có luồng đăng nhập và giao diện vận hành hoàn chỉnh.

## 2. Use case công khai/người dân

| UC | Người dùng | Chức năng | Điều kiện | Luồng chính | Kết quả |
| --- | --- | --- | --- | --- | --- |
| UC-PUB-001 | Khách/Người dân | Xem bản đồ, ranh và điểm | Mở website, có mạng | Mở bản đồ → kéo/zoom → bật lớp → chọn điểm | Thấy thông tin địa bàn/điểm công khai |
| UC-PUB-002 | Khách/Người dân | Tìm địa bàn/đơn vị | Có dữ liệu công khai | Nhập tên/đơn vị/mã → chọn kết quả | Bản đồ và thẻ chi tiết cập nhật |
| UC-PUB-003 | Khách/Người dân | Lấy vị trí và tra địa bàn | Cho phép location | Nhấn định vị → trình duyệt lấy GPS → hệ thống tra cứu | Hiển thị vị trí và địa bàn phù hợp hoặc lỗi rõ ràng |
| UC-PUB-004 | Khách/Người dân | Xem cảnh báo | Có cảnh báo còn hiệu lực | Mở **Cảnh báo khu vực** | Danh sách cảnh báo công khai |
| UC-CIT-001 | Người dân | Đăng nhập | Có tài khoản pilot hoạt động | Nhập số điện thoại/mật khẩu → đăng nhập | Phiên người dân được tạo |
| UC-CIT-002 | Người dân | Gửi SOS | Đã đăng nhập; GPS ≤1.000 m; vị trí trong vùng | Mở SOS → chọn nhóm → ghi chú/liên hệ → giữ 3 giây | Tạo mã `SOS-`, trạng thái ban đầu và hàng đợi local |
| UC-CIT-003 | Người dân | Theo dõi SOS | Đã đăng nhập; sở hữu hồ sơ | Mở biên nhận → tải lại | Thấy trạng thái, vị trí và lịch sử công khai |
| UC-CIT-004 | Người dân | Hủy SOS | Trạng thái triggered/dispatched | Mở biên nhận → hủy → xác nhận | Trạng thái **Người dân đã hủy** |
| UC-CIT-005 | Người dân | Gửi phản ánh | Đã đăng nhập; dữ liệu/tệp/vị trí hợp lệ; cam kết | Nhập biểu mẫu → chọn một tệp → đặt vị trí → gửi | Tạo mã `PA-` và hồ sơ **Đã gửi** |
| UC-CIT-006 | Người dân | Xem phản ánh của mình | Đã đăng nhập | Phản ánh → Theo dõi → chọn hồ sơ | Chi tiết, bằng chứng, trạng thái, lịch sử |
| UC-CIT-007 | Người dân | Gửi tin nhắn/bổ sung tệp | Đã đăng nhập; sở hữu phản ánh | Mở chi tiết → nhập tin/chọn tệp → gửi | Thông tin bổ sung gắn vào hồ sơ |
| UC-CIT-008 | Người dân | Nhận thông báo trong web | Đã đăng nhập | Mở **Thông báo** → lọc chưa đọc → chọn mục | Mở hồ sơ liên quan, đánh dấu đã đọc |
| UC-CIT-009 | Người dân | Đánh giá hài lòng | Phản ánh của mình ở resolved/closed; chưa đánh giá | Chọn hồ sơ → 1–5 sao → nhận xét → gửi | Lưu một đánh giá cho phản ánh |
| UC-CIT-010 | Người dân | Quản lý phiên | Có/không có phiên | Mở **Tài khoản** → xem thông tin/tour/hồ sơ → đăng xuất | Phiên bị xóa khi đăng xuất |

## 3. Use case cán bộ

| UC | Người dùng | Chức năng | Điều kiện | Luồng chính | Kết quả |
| --- | --- | --- | --- | --- | --- |
| UC-OFF-001 | Cán bộ CSKV | Đăng nhập | Tài khoản officer hoạt động | Nhập tên/mật khẩu → đăng nhập | Phiên officer và địa bàn được tải |
| UC-OFF-002 | Cán bộ CSKV | Xem/lọc hàng đợi | Đã đăng nhập | Chọn scope/kind → tìm/sắp xếp → tải lại | Danh sách hồ sơ thuộc địa bàn |
| UC-OFF-003 | Cán bộ CSKV | Xem chi tiết SOS | Đã đăng nhập; đúng địa bàn | Chọn thẻ SOS | Thấy liên hệ, tọa độ, lịch sử, hành động |
| UC-OFF-004 | Cán bộ CSKV | Xác nhận SOS | SOS ở dispatched; đúng địa bàn | **Xác nhận SOS** → ghi chú ≥8 → xác nhận | SOS sang acknowledged |
| UC-OFF-005 | Cán bộ CSKV | Tự nhận hồ sơ | Hồ sơ chưa giao; đúng địa bàn | **Xử lý hồ sơ** → tự nhận | `assigned_officer_id` là cán bộ đăng nhập |
| UC-OFF-006 | Cán bộ CSKV | Triển khai và kết thúc SOS | Đúng trạng thái | **Đang triển khai lực lượng** → **Ghi nhận kết quả** → **Đóng hồ sơ** | Lịch sử và trạng thái được cập nhật |
| UC-OFF-007 | Cán bộ CSKV | Chuyển tuyến SOS | SOS ở dispatched/acknowledged/responding | **Chuyển tuyến / phối hợp đơn vị** → ghi chú | SOS sang escalated; chưa phải phân công user khác |
| UC-OFF-008 | Cán bộ CSKV | Ghi nhận người dân hủy | SOS ở trạng thái cho phép | Chọn hành động → ghi chú → xác nhận | SOS sang cancelled_by_citizen |
| UC-OFF-009 | Cán bộ CSKV | Xử lý phản ánh | Đúng địa bàn/trạng thái | Tiếp nhận → phân công → xác minh → xử lý → kết quả → đóng | Trạng thái/lịch sử đầy đủ |
| UC-OFF-010 | Cán bộ CSKV | Chuyển phản ánh ngoài phạm vi | received/verifying | Chọn ngoài phạm vi → ghi chú ≥20 → xác nhận | Trạng thái rejected; có thể đóng |
| UC-OFF-011 | Cán bộ CSKV | Trao đổi/yêu cầu bổ sung | Có phản ánh thuộc địa bàn | Mở tin nhắn → gửi nội dung/yêu cầu media | Người dân nhận thông báo trong web |
| UC-OFF-012 | Cán bộ CSKV | Thêm/xem bằng chứng | Có phản ánh thuộc địa bàn | Chọn tệp hợp lệ → tải lên/xem | Tệp gắn vào hồ sơ và phân vai tác giả |
| UC-OFF-013 | Cán bộ CSKV | Xem bản đồ trực ban | Đã đăng nhập | Mở bản đồ → chọn điểm/lớp → mở hồ sơ | Vị trí hồ sơ và điểm nghiệp vụ hiển thị |
| UC-OFF-014 | Cán bộ CSKV | Xem báo cáo | Đã đăng nhập | Nghiệp vụ → Báo cáo → kỳ/mốc thời gian | Chỉ số và biểu đồ địa bàn |
| UC-OFF-015 | Cán bộ CSKV | Quản lý điểm bản đồ | Đã đăng nhập; tọa độ trong địa bàn | Thêm/sửa/xóa điểm; chọn loại/trạng thái/hiển thị | Điểm nghiệp vụ được cập nhật |
| UC-OFF-016 | Cán bộ CSKV | Phát hành cảnh báo | Đã đăng nhập | Nhập tiêu đề/nhóm/rủi ro/nội dung/thời hạn → phát hành | Cảnh báo công khai còn hiệu lực |
| UC-OFF-017 | Cán bộ CSKV | Quản lý phiên tuần tra của mình | Đã đăng nhập; là chủ phiên | Tạo → bắt đầu → check-in/tạm dừng/tiếp tục → kết thúc | Lịch sử trạng thái phiên tuần tra |
| UC-OFF-018 | Cán bộ CSKV | Gửi báo cáo cuối ca | Đã đăng nhập | Xem tổng hợp → nhập ghi chú → xác nhận | Báo cáo ca được lưu |
| UC-OFF-019 | Cán bộ CSKV | Xem thông báo | Đã đăng nhập | Mở nút thông báo → chọn việc | Thông báo được đọc, hồ sơ được mở |

## 4. Mapping Role → Screen → Function → API → Business flow

> Phần này phục vụ đối chiếu BA/nghiệm thu, không phải hướng dẫn thao tác cho người dùng cuối.

| STT | Role | Chức năng | Màn hình | Quyền | API liên quan |
| ---: | --- | --- | --- | --- | --- |
| 1 | Public/CIT | Dữ liệu bản đồ/tra cứu | Bản đồ & danh bạ | Công khai | `GET /v1/areas`, `/v1/lookup/by-code/:code`, `/v1/lookup/by-location`, `/v1/hotlines` |
| 2 | Public/CIT | Xem cảnh báo | Cảnh báo khu vực | Công khai | `GET /v1/public/alerts` |
| 3 | CIT | Đăng nhập/phiên | Modal/Tài khoản | Chủ tài khoản | `POST /v1/auth/citizen/login`, `GET /v1/auth/citizen/session`, `POST /v1/auth/citizen/logout` |
| 4 | CIT | Gửi/theo dõi phản ánh | Phản ánh | Chủ hồ sơ | `POST/GET /v1/citizen/incidents`, `GET /v1/citizen/incidents/:receipt` |
| 5 | CIT | Tệp/tin nhắn phản ánh | Chi tiết phản ánh | Chủ hồ sơ | `POST .../attachments`, `GET .../attachments/:id/content`, `GET/POST .../messages` |
| 6 | CIT | Đánh giá | Đánh giá hài lòng | Chủ hồ sơ resolved/closed | `POST /v1/citizen/incidents/:receipt/rating` |
| 7 | CIT | SOS | SOS/biên nhận | Chủ hồ sơ | `POST/GET /v1/citizen/sos`, `GET /v1/citizen/sos/:receipt`, `POST .../cancel` |
| 8 | CIT | Thông báo | Bảng thông báo | Chủ tài khoản | `GET /v1/citizen/notifications`, `POST .../read` |
| 9 | OFF | Đăng nhập/phiên | Cổng CSKV | Officer hoạt động | `POST /v1/auth/officer/login`, `GET /v1/auth/officer/session`, `POST .../logout` |
| 10 | OFF | Hàng đợi | Hàng đợi | Địa bàn officer | `GET /v1/officer/queue` |
| 11 | OFF | Chi tiết/chuyển trạng thái | Hồ sơ | Địa bàn; pilot tự nhận | `GET /v1/officer/incidents/:id`, `POST .../transitions`, `GET /v1/officer/sos/:id`, `POST .../transitions` |
| 12 | OFF | Tin nhắn/tệp | Chi tiết phản ánh | Địa bàn officer | Các endpoint officer incident messages/attachments/content |
| 13 | OFF | Thông báo | Bảng thông báo | Địa bàn officer | `GET /v1/officer/notifications` |
| 14 | OFF | Cảnh báo | Nghiệp vụ/Cảnh báo | Officer địa bàn | `POST /v1/officer/alerts` |
| 15 | OFF | Tuần tra | Nghiệp vụ/Tuần tra | Chỉ chủ phiên cập nhật | `GET/POST /v1/officer/patrols`, `POST .../actions` |
| 16 | OFF | Báo cáo cuối ca | Nghiệp vụ/Cuối ca | Officer địa bàn | `GET /v1/officer/shift-summary`, `POST /v1/officer/shift-reports` |
| 17 | OFF | Thống kê | Nghiệp vụ/Báo cáo | Officer địa bàn | `GET /v1/officer/statistics` |
| 18 | OFF | Điểm nghiệp vụ | Nghiệp vụ/Bản đồ | Officer địa bàn | `GET/POST/PATCH/DELETE /v1/officer/map-points` |

## 5. Trạng thái và chuyển đổi

### Phản ánh

| Từ | Đến hợp lệ |
| --- | --- |
| submitted | received |
| received | assigned, rejected |
| assigned | verifying, processing |
| verifying | processing, rejected |
| processing | resolved |
| resolved | closed, processing |
| rejected | closed |
| closed | Không có |

### SOS

| Từ | Đến hợp lệ |
| --- | --- |
| triggered | dispatched, cancelled_by_citizen |
| dispatched | acknowledged, escalated, cancelled_by_citizen |
| acknowledged | responding, escalated |
| responding | resolved, escalated |
| escalated | acknowledged, responding |
| resolved | closed, responding |
| closed | Không có |
| cancelled_by_citizen | Không có |

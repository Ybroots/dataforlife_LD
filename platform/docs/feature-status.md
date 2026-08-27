# Trạng thái chức năng Xuân Hương

Quy ước:

- **Hoạt động**: đã có API, dữ liệu lưu Postgres/PostGIS và giao diện sử dụng được.
- **Hoạt động local**: luồng nội bộ chạy đầy đủ nhưng chưa kết nối hệ thống bên ngoài.
- **Đang phát triển**: không giả lập như dịch vụ thật; chờ tích hợp hoặc phê duyệt nghiệp vụ.

Phạm vi pilot Xuân Hương hiện dùng mô hình một cấp: người dân được xem bản đồ, danh bạ và chuẩn bị biểu mẫu công khai mà không cần đăng nhập; đăng nhập chỉ bắt buộc tại thời điểm gửi/theo dõi phản ánh, kích hoạt/theo dõi SOS hoặc đánh giá. CSKV Công an phường trực tiếp tiếp nhận và xử lý trọn quy trình. Đăng nhập người dân hiện là ngăn trượt mô phỏng VNeID bằng số điện thoại và mật khẩu local, chưa phải kết nối định danh thật. Vai trò chỉ huy được tạm ẩn để phát triển sau.

## Ứng dụng người dân

| Mã | Trạng thái | Phạm vi hiện tại |
|---|---|---|
| FR-CD-01 | Hoạt động | Bản đồ Xuân Hương, GPS, tìm địa chỉ/địa điểm/CSKV |
| FR-CD-02 | Hoạt động | Tra cứu địa bàn, đầu mối công khai, trụ sở, gọi điện/chỉ đường |
| FR-CD-03 | Hoạt động | Cảnh báo đang hiệu lực do cổng CSKV phát hành |
| FR-CD-04 | Hoạt động local | Có phiên đăng nhập số điện thoại/mật khẩu mang nhãn mô phỏng; tích hợp và xác thực VNeID thật đang phát triển |
| FR-CD-05 | Hoạt động | Phản ánh có bản đồ chọn vị trí, ảnh hoặc video, kiểm tra đầu vào và yêu cầu đăng nhập ngay trước khi gửi |
| FR-CD-06 | Đang phát triển | Chờ AI đa phương thức và cơ chế người dân duyệt trước khi gửi |
| FR-CD-07 | Hoạt động | Timeline, cán bộ phụ trách, trao đổi và bổ sung media |
| FR-CD-08 | Hoạt động local | SOS chỉ nổi cạnh Trợ lý AI trên bản đồ; trang khẩn cấp yêu cầu phiên VNeID mô phỏng, giữ nút tròn đủ 3 giây để gửi đúng một lần, có bản đồ vị trí, mã tiếp nhận và luồng trực ban; VNeID/112/113 thật chưa kết nối |
| FR-CD-09 | Đang phát triển | Chờ AI và kho tri thức đã phê duyệt |
| FR-CD-10 | Hoạt động local | Thông báo trong cổng cán bộ; SMS/Web Push đang phát triển |
| FR-CD-11 | Hoạt động | Chỉ chọn được phản ánh đã xử lý/đóng để đánh giá 1–5 sao; điểm và góp ý hiển thị trong chi tiết hồ sơ của cán bộ |
| FR-CD-12 | Đang phát triển | Chờ hàng đợi offline, mã hóa thiết bị và cơ chế đồng bộ xung đột |

## Ứng dụng cán bộ/CSKV

| Mã | Trạng thái | Phạm vi hiện tại |
|---|---|---|
| FR-CB-01 | Hoạt động | Dashboard SOS mở, tổng hồ sơ, chưa phân công và quá SLA |
| FR-CB-02 | Hoạt động | Tìm kiếm, lọc phạm vi/loại, sắp xếp và lưu trạng thái URL |
| FR-CB-03 | Hoạt động | Chi tiết người gửi, vị trí, media, phân công, lịch sử xử lý và đánh giá của người dân; AI gợi ý đang phát triển |
| FR-CB-04 | Hoạt động pilot | CSKV Xuân Hương trực tiếp tiếp nhận, tự nhận, xác minh, xử lý, kết quả và đóng/từ chối |
| FR-CB-05 | Hoạt động | Trao đổi hai chiều và yêu cầu/bổ sung ảnh hoặc video |
| FR-CB-06 | Đang phát triển | Chờ AI phân loại, chống trùng và phân tích ảnh |
| FR-CB-07 | Hoạt động một phần | GIS địa bàn/hồ sơ hoạt động; camera đang phát triển |
| FR-CB-08 | Hoạt động | Tạo và phát hành cảnh báo theo địa bàn/thời gian hiệu lực |
| FR-CB-09 | Hoạt động | Lập lịch, bắt đầu, tạm dừng, tiếp tục, check-in GPS và kết thúc tuần tra |
| FR-CB-10 | Hoạt động local | Thông báo công vụ trong hệ thống; push/lịch họp ngoài hệ thống đang phát triển |
| FR-CB-11 | Hoạt động | Tổng hợp số liệu trong ngày, ghi chú bàn giao và xác nhận báo cáo cuối ca |

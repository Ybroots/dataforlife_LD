# DANH SÁCH MÀN HÌNH

## Quy ước route

Website là ứng dụng một trang. Các chức năng được chọn bằng tham số truy vấn, không phải đường dẫn con. Ví dụ `/?feature=sos`. Các tham số mã hồ sơ là dữ liệu động.

## Màn hình người dân

| ID | Màn hình | Role | Route thực tế | Chức năng/trạng thái xác nhận |
| --- | --- | --- | --- | --- |
| SCR-CIT-01 | Chọn vai trò/trang vào | Public | `/` | Chọn Người dân hoặc Cán bộ Công an |
| SCR-CIT-02 | Bản đồ & danh bạ | Public/Citizen | `/` hoặc `/?feature=directory` | Bản đồ, tìm kiếm, ranh, điểm đơn vị, liên hệ, vị trí hiện tại |
| SCR-CIT-03 | Cảnh báo khu vực | Public/Citizen | `/?feature=alerts` | Xem cảnh báo công khai còn hiệu lực |
| SCR-CIT-04 | Đăng nhập người dân | Citizen | Modal từ đầu trang/Tài khoản/chức năng khóa | Đăng nhập mô phỏng VNeID bằng điện thoại và mật khẩu |
| SCR-CIT-05 | Tạo phản ánh | Citizen | `/?feature=reports` | Nhóm, tiêu đề, mô tả, một tệp, vị trí, liên hệ, cam kết |
| SCR-CIT-06 | Theo dõi phản ánh | Citizen | `/?feature=reports&reportTab=tracking` | Danh sách và chi tiết phản ánh của tài khoản |
| SCR-CIT-07 | Biên nhận phản ánh | Citizen | `/?feature=reports&reportTab=tracking&reportReceipt={receipt}` | Mở trực tiếp hồ sơ theo mã `PA-` của tài khoản |
| SCR-CIT-08 | Tạo SOS | Citizen | `/?feature=sos` | Lấy GPS, chọn tình huống, ghi chú, liên hệ, giữ 3 giây |
| SCR-CIT-09 | Biên nhận SOS | Citizen | `/?feature=sos&sosStep=receipt&sosReceipt={receipt}` | Mã, trạng thái, vị trí, lịch sử, tải lại, hủy nếu được phép |
| SCR-CIT-10 | Đánh giá hài lòng | Citizen | `/?feature=feedback` | Đánh giá 1–5 sao cho phản ánh resolved/closed |
| SCR-CIT-11 | Trợ lý AI | Public/Citizen | `/?feature=assistant` | Có giao diện gợi ý; trả lời AI đang phát triển |
| SCR-CIT-12 | Tài khoản | Citizen/Guest | `/?feature=account` | Trạng thái phiên, phản ánh, đánh giá, tour, đăng nhập/đăng xuất |
| SCR-CIT-13 | Thông báo người dân | Citizen | Bảng mở từ nút **Thông báo** | Chưa đọc, tải thêm, mở hồ sơ; chỉ trong website |
| SCR-CIT-14 | Tour hướng dẫn | Public/Citizen | Lớp phủ mở từ **Hướng dẫn** | Làm nổi bật các vùng giao diện chính |

## Màn hình cán bộ

| ID | Màn hình | Role | Route thực tế | Chức năng/trạng thái xác nhận |
| --- | --- | --- | --- | --- |
| SCR-OFF-01 | Đăng nhập CSKV | Officer | `/?portal=police` khi chưa có phiên | Tên đăng nhập, mật khẩu; không OTP/SSO |
| SCR-OFF-02 | Hàng đợi địa bàn | Officer | `/?portal=police&pane=queue` | Chỉ số, tìm kiếm, lọc scope/kind, sắp xếp, danh sách hồ sơ |
| SCR-OFF-03 | Chi tiết phản ánh | Officer | `/?portal=police&pane=detail&case=incident:{id}` | Nội dung, tệp, tin nhắn, vị trí, lịch sử, tự nhận, chuyển trạng thái |
| SCR-OFF-04 | Chi tiết SOS | Officer | `/?portal=police&pane=detail&case=sos:{id}` | Liên hệ, vị trí, lịch sử, tự nhận, chuyển trạng thái |
| SCR-OFF-05 | Bản đồ trực ban | Officer | `/?portal=police&pane=map` | Điểm SOS/phản ánh/điểm nghiệp vụ; tùy chọn hồ sơ kết thúc |
| SCR-OFF-06 | Báo cáo địa bàn | Officer | `/?portal=police&pane=operations` → **Báo cáo** | Thống kê ngày/tháng/năm, biểu đồ, nhóm vụ việc, hài lòng |
| SCR-OFF-07 | Điểm bản đồ nghiệp vụ | Officer | Cùng route operations → **Bản đồ** | Thêm/sửa/xóa điểm trong địa bàn, trạng thái và mức hiển thị |
| SCR-OFF-08 | Cảnh báo | Officer | Cùng route operations → **Cảnh báo** | Phát hành cảnh báo theo thời hạn 2/4/8/24 giờ |
| SCR-OFF-09 | Tuần tra | Officer | Cùng route operations → **Tuần tra** | Tạo lịch, bắt đầu, check-in, tạm dừng, tiếp tục, kết thúc |
| SCR-OFF-10 | Báo cáo cuối ca | Officer | Cùng route operations → **Cuối ca** | Xem tổng hợp, nhập ghi chú, xác nhận báo cáo ca |
| SCR-OFF-11 | Tích hợp | Officer | Cùng route operations → **Tích hợp** | Các thẻ VNeID/AI/Camera/SMS/Web Push/112/113 đang phát triển |
| SCR-OFF-12 | Thông báo cán bộ | Officer | Bảng mở từ nút thông báo | Việc mới của địa bàn, trạng thái đã đọc |

## Màn hình/role chưa tồn tại

| Hạng mục | Kết quả audit |
| --- | --- |
| Cổng Chỉ huy riêng | Chưa phát hiện giao diện hoặc luồng đăng nhập hoàn chỉnh |
| Cổng Admin | Chưa phát hiện |
| Quản lý tài khoản | Chưa phát hiện |
| Quản lý đơn vị/phân quyền | Chưa phát hiện |
| Điều phối chọn cán bộ khác | Bị chính sách pilot chặn; chỉ tự nhận |

## Điều hướng trên điện thoại

| Nhóm | Mục điều hướng |
| --- | --- |
| Người dân | **Bản đồ**, **Danh bạ**, **Phản ánh**, **Tài khoản** |
| Cán bộ | **Hàng đợi**, **Bản đồ**, **Hồ sơ**, **Nghiệp vụ** |

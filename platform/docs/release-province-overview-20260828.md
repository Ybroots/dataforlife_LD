# Bản vá tổng quan toàn tỉnh — 28/08/2026

## Phạm vi

Dữ liệu của release trước đã đủ 124 địa bàn. Nguyên nhân chỉ thấy Xuân Hương là
luồng mở trang mặc định và lớp ranh giới chỉ thể hiện địa bàn được chọn, không
phải thiếu 123 địa bàn trong database.

- Mở trang không có `area` sẽ hiển thị toàn tỉnh; không tự chọn Xuân Hương hoặc
  tự gán điểm tâm địa bàn thành GPS của người dùng.
- Bộ chọn có 124 địa bàn và mục toàn tỉnh. Chạm polygon mở thông tin/danh bạ,
  chọn tên hoặc tìm kiếm mã đều dùng dữ liệu nguồn. Nút “Toàn tỉnh” bỏ chọn.
- Deep-link/reload giữ địa bàn; GPS thật chọn theo tra cứu tọa độ. Yêu cầu cũ
  hoàn thành chậm không được ghi đè lựa chọn mới.
- Endpoint overview chỉ có metadata công khai và geometry đơn giản hóa để vẽ.
  Không thay geometry gốc dùng tra cứu/phân công và không nhập lại dữ liệu.
- Tải lỗi overview có thông báo/thử lại. Cảnh báo chưa chọn địa bàn và cảnh báo
  tải lỗi không bị diễn đạt thành “không có cảnh báo”.
- Giữ header đỏ, SOS không gọi nhanh và các luồng hiện có; tour hướng dẫn toàn
  tỉnh. Bộ chọn native, focus rõ, kiểm tra mobile dọc/ngang và reduced motion.
- Chỉ tải overview khi vào bản đồ; nginx nén JSON/JS/CSS. Không thay dịch vụ
  bản đồ hoặc mở quyền cán bộ ra ngoài phạm vi pilot.

## Kiểm thử

- Typecheck cả ba workspace; 26 unit test; production build và kiểm tra worker.
- Database QA riêng đã có đủ nguồn: 124 ranh giới/địa bàn, 296 liên hệ, 34 hotline.
  `data-parity.py` đối chiếu từng địa bàn với snapshot riêng, gồm metadata,
  danh bạ, trụ sở, tìm kiếm và lookup tọa độ; overview đủ 124 mã duy nhất.
- `province-overview.py`: 375×812, 812×375, 1440×900; bốn địa bàn mỗi kích thước,
  quay về toàn tỉnh; chạm polygon thật, deep-link/reload, GPS và phục hồi HTTP503.
  Tải worker/vector tile thật, không lỗi JS hoặc tràn ngang.
- `full-data-browser.py`: ba địa bàn/danh bạ đơn vị, cảnh báo công khai trên map,
  tuần tra/GPS, báo cáo cuối ca và thống kê ngày/tháng/năm trên DB riêng.
- E2E hai vai trò: tour, đăng nhập, ảnh phản ánh, toàn bộ chuyển trạng thái,
  SOS giữ 3 giây, dữ liệu bản đồ nghiệp vụ và đánh giá sau kết quả.
- `release-regression.py`: ma trận guest/citizen/officer, HTTP không secure-context
  và loopback secure-context; 7 trang, SPA/back-forward, các tab cán bộ, biểu mẫu
  và xử lý chunk lỗi. Kết quả bản build chốt được ghi bên dưới sau phát hành.

Ảnh/bằng chứng tại `tmp/province-overview`, `tmp/release-province-validated`,
`tmp/release-full-data-extra`, `platform/e2e/artifacts/final-workflow` (không commit).
Không chạy bài test tạo phản ánh/SOS vào production.

## Giới hạn giữ nguyên

Xem [release trước](release-20260828.md): AI, VNeID quốc gia, 112/113,
SMS/Web Push, camera và offline chưa tích hợp; điểm minh họa Xuân Hương không
phải GIS chính thức; các trụ sở chưa có tọa độ xác minh không được tạo pin giả.
GPS QA là tọa độ trình duyệt kiểm soát; thiết bị thật còn phụ thuộc quyền/tín hiệu.

## Triển khai

Trước cập nhật phải sao lưu web/API/config và PostgreSQL; so SHA-256 toàn bộ
16 file build với bản local đã QA. Không migration, không thay tài khoản hay dữ
liệu nghiệp vụ. Giữ chunk cũ cho các phiên đang mở; cập nhật HTML cuối cùng.
Thông tin release/backup và kết quả kiểm tra website thật được ghi sau triển khai.

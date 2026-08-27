# Tra cứu điểm theo khu trên bản đồ người dân

## Phạm vi

- Chạm ranh khu P.1/P.2/P.3/P.4/P.10 hoặc chọn khu trong nút lớp bản đồ để xem danh sách điểm bên trong.
- Tính danh sách bằng phép kiểm tra tọa độ thuộc Polygon/MultiPolygon, có loại trừ lỗ trong polygon. Chỉ liệt kê các lớp đang bật.
- Chọn dòng danh sách hoặc pin để mở một popup duy nhất. Có tên, thông tin địa điểm và liên kết `tel:` nếu có số công khai.
- Trên điện thoại popup thay bảng danh sách; đóng popup trở lại danh sách. SOS/AI/vị trí vẫn có vùng thao tác riêng. Màn hình ngang đặt bảng bên trái.
- Đây là chọn các khu có sẵn, chưa phải công cụ vẽ polygon tùy ý.

## Dữ liệu và giới hạn

`web/src/citizen-map-points.ts` chỉ tạo điểm minh họa cho mã phường `24781`.

- Giữ nguyên 5 tọa độ pin CSKV từ `serviceAreas[].center`.
- Thêm 5 vị trí trụ sở/điểm tiếp dân **demo**, mỗi vị trí nằm trong khu tương ứng.
- Trụ sở chính dùng tên/địa chỉ từ API, nhưng tọa độ vẫn là minh họa. Bốn điểm tiếp dân còn lại là giả định, không có địa chỉ chính thức.
- Số điện thoại lấy từ danh bạ công khai của phường; không khẳng định đó là số riêng của cán bộ hoặc điểm tiếp dân.
- Hai cảnh báo minh họa có thể bật trong tùy chọn lớp.
- Không lưu tọa độ demo vào canonical/PostGIS; không tạo liên kết chỉ đường tới tọa độ giả định.
- Ranh 5 phường cũ vẫn là dữ liệu tham chiếu, không dùng để phân công hoặc điều phối nghiệp vụ.

## Kiểm thử

Ngày 27/08/2026, kiểm thử local trên nhánh `dataforlife`:

- `e2e/citizen_map_zone_points.cjs`: 320×568, 375×667, 390×844, 844×390, 768×1024, 1440×900.
- Cả 5 khu: số điểm đúng theo hình học, giữ nguyên pin CSKV, chọn bằng thao tác canvas thực và chọn tên khu, bấm pin/dòng danh sách, đóng popup, Enter/Escape, bật/tắt lớp.
- Không tràn ngang hoặc che nút SOS/AI/vị trí; không lỗi console ngoài phản hồi 401 dự kiến của phiên khách.
- Kiểm tra hình học với polygon có lỗ, điểm ngoài ranh, điểm trên cạnh, MultiPolygon và tọa độ không hợp lệ.
- `e2e/citizen_auth_gate.cjs`: khách phải đăng nhập trước khi mở form phản ánh/SOS, đăng nhập xong mở đúng chức năng. Không gửi hồ sơ test mới.
- `npm run typecheck`, `npm test` (13 test), `npm run build` thành công. Build còn cảnh báo kích thước bundle thư viện bản đồ lớn hơn 500 kB.

Ảnh kiểm thử nằm trong `e2e/artifacts/citizen-map-zone-points/`. Dịch vụ cần chạy ở cổng web 5173 và API 3001; bài E2E dùng Playwright, Chrome và `tsx`.

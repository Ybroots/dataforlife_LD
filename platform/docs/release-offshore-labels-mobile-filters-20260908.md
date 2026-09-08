# Phát hành nhãn ngoài khơi và bộ lọc mobile — 08/09/2026

## Phạm vi

- Hiển thị nhãn `Quần đảo Trường Sa` tại `10.722304537073676, 115.84047241412652`.
- Hiển thị nhãn `Quần đảo Hoàng Sa` tại `16.642258074877642, 112.75350799728493`.
- Nhãn dùng marker chữ độc lập với glyph/style của nhà cung cấp tile và được gắn vào
  bản đồ người dân, bản đồ trực ban cán bộ, bản đồ chọn vị trí phản ánh và SOS.
- Ô tìm xã/phường và bảng `Tùy chọn hiển thị` dùng trạng thái loại trừ: mở một bảng
  sẽ đóng bảng còn lại và bỏ focus ô tìm kiếm khi cần, tránh chồng lớp trên điện thoại.
- Không thay đổi ranh giới, tọa độ GIS nguồn, danh bạ, tài khoản hay workflow.

## Bản phát hành và sao lưu

- Commit ứng dụng: `47a83099d7626992f9d790327c88cdab0a6c2caa`.
- SHA-256 artifact web:
  `3792e7779255194ce5a5d93c7cc9fbc9ee8badb9093e166ae0f4532d9179b804`.
- Backup trước phát hành, chỉ root đọc được:
  `/opt/dataforlife/backups/offshore-labels-mobile-filters-20260908T152600Z`.
- Không chạy migration, không import dữ liệu, không tạo phản ánh/SOS thử và không
  thay đổi danh tính production.

## Kiểm thử

- Typecheck đủ ba workspace: đạt.
- Unit test: 30/30 đạt; kiểm thử chứa đúng hai nhãn và tọa độ yêu cầu.
- Production build và kiểm tra MapLibre worker: đạt.
- Kiểm thử mobile local 393 px: hai nhãn được gắn vào bản đồ; danh sách tìm kiếm và
  bảng tùy chọn tự đóng lẫn nhau; không tràn ngang.
- Kiểm thử live người dân/guest: 124 vùng, 12 lượt chọn ở 375×812, 812×375 và
  1440×900, deep-link giữ đúng địa bàn, không tràn ngang, không có page error.
- Kiểm thử live tương tác bộ lọc: tìm kiếm mở thì tùy chọn đóng; tùy chọn mở thì
  tìm kiếm đóng và ô tìm kiếm mất focus; mở lại tìm kiếm thì tùy chọn đóng.
- Worker và vector tile OpenFreeMap trả HTTP 200.
- Kiểm thử live cán bộ đã đăng nhập: portal và bản đồ trực ban tải thành công,
  không tràn ngang, có đủ hai nhãn.
- API, nginx và timer gia hạn chứng chỉ đều active; health dùng PostgreSQL.
- Bộ phát hiện UI chỉ báo các mẫu cũ ngoài phạm vi trong stylesheet; thay đổi này
  không thêm card, gradient, shadow hay animation trang trí.

## Đối chiếu dữ liệu sau phát hành

- 124 địa bàn / 124 ranh giới canonical.
- 296 liên hệ / 34 hotline canonical.
- 1 tài khoản người dân / 5 tài khoản cán bộ.
- 1 phản ánh / 2 SOS; không thay đổi bởi phát hành này.

## Giới hạn giữ nguyên

- Không đổi mức zoom mặc định để ép hai nhãn ngoài phạm vi Lâm Đồng vào cùng một
  khung nhìn; nhãn xuất hiện đúng vị trí khi bản đồ được kéo/thu nhỏ tới khu vực đó.
- Luồng bản đồ chọn vị trí phản ánh/SOS yêu cầu tài khoản người dân; không thay đổi
  tài khoản production để phục vụ kiểm thử phát hành. Component dùng chung đã qua
  typecheck, unit test và production build.
- VNeID chính thức, AI, điều phối 112/113, SMS/push và camera vẫn chưa kết nối.

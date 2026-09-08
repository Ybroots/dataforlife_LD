# Phát hành bộ lọc nhãn bản đồ — 08/09/2026

## Phạm vi

- Ẩn nhãn Quần đảo Trường Sa quanh tọa độ người dùng cung cấp
  `10.722304537073676, 115.84047241412652`.
- Ẩn nhãn Hoàng Sa quanh tọa độ người dùng cung cấp
  `16.642258074877642, 112.75350799728493`.
- Bộ lọc nhận diện các biến thể tiếng Việt không dấu và tên tiếng Anh tương ứng
  trên các trường tên phổ biến của vector tile.
- Chỉ áp dụng cho `symbol layer` có chữ. Không xóa hoặc che ranh giới, mặt nước,
  đường, dữ liệu 124 địa bàn, marker người dân hay marker nghiệp vụ.
- Áp dụng thống nhất cho bản đồ người dân, bản đồ trực ban cán bộ và bản đồ chọn
  tọa độ phản ánh/SOS.

## Bản phát hành và sao lưu

- Commit ứng dụng: `dc09941bf74351010f0f3a4851c61f0312a3ba6e`.
- SHA-256 artifact web:
  `1a7bc0f6c289b5f8acff3a1d02b543feeb68997272f27d92ae938a5ca74db0ec`.
- Backup trước phát hành, chỉ root đọc được:
  `/opt/dataforlife/backups/map-labels-20260908T043232Z`.
- Không chạy migration, không tạo phản ánh/SOS thử và không chỉnh dữ liệu GIS.

## Kiểm thử

- Typecheck đủ ba workspace: đạt.
- Unit test: 30/30 đạt; có kiểm thử riêng cho bộ lọc nhãn, giữ nguyên filter cũ
  và không tác động lớp icon/fill.
- Production build và kiểm tra MapLibre worker: đạt.
- Impeccable detector trên các tệp thay đổi: không phát hiện lỗi.
- Hồi quy live: 124 vùng, 3 viewport, 12 lượt chọn, click polygon, deep-link,
  GPS và retry đều đạt; không có page error.
- Bản đồ người dân live tải đủ 124 vùng, MapLibre canvas và tile thật; không tràn
  ngang trên mobile; không có chuỗi nhãn yêu cầu ẩn trong DOM.
- Cổng cán bộ live đăng nhập thành công và bản đồ trực ban tải thành công.
- nginx, API và timer gia hạn chứng chỉ đều active; API health dùng PostgreSQL.

## Đối chiếu dữ liệu sau phát hành

- 124 địa bàn / 124 ranh giới canonical.
- 296 liên hệ / 34 hotline canonical.
- 1 tài khoản người dân / 5 tài khoản cán bộ.
- 1 phản ánh / 2 SOS; không thay đổi bởi phát hành này.

## Giới hạn giữ nguyên

VNeID chính thức, AI, điều phối 112/113, SMS/push và camera vẫn chưa kết nối.
Phạm vi pilot cán bộ và các giới hạn tài khoản người dân không thay đổi.


# Phát hành logo trong suốt — 08/09/2026

## Phạm vi

- Loại bỏ nền/viền trắng quanh logo ở màn hình chọn vai trò, thanh đầu trang
  người dân, đăng nhập cán bộ, cổng nghiệp vụ, favicon và Apple touch icon.
- Không dùng hai ảnh sinh thử vì chúng làm thay đổi nét huy hiệu. Tài nguyên phát
  hành được tách nền theo phép toán điểm ảnh từ ảnh gốc, giữ nguyên canvas
  612 × 500 và màu/nét của phần huy hiệu.
- CSS của logo dùng nền trong suốt, không border và không padding. Không thay đổi
  API, xác thực, dữ liệu hay quy trình nghiệp vụ.

## Bản phát hành và sao lưu

- Commit ứng dụng: `be74bc4b9b640a9dc1731c2016e2fad7e194ef13`.
- SHA-256 artifact web:
  `4ca4bb741b1a18844c1c4bbc8b0388c51f10186bda87672cdbaebf54d7002f9b`.
- Backup trước phát hành, chỉ root đọc được:
  `/opt/dataforlife/backups/logo-border-20260907T170912Z`.
- Backup gồm PostgreSQL custom dump, web cũ, commit cũ, số lượng dữ liệu và
  SHA-256. Không chạy migration hoặc ghi dữ liệu thử vào production.

## Kiểm thử

- Typecheck đủ ba workspace: đạt.
- Unit test: 28/28 đạt.
- Production build và kiểm tra MapLibre worker: đạt.
- Desktop/mobile: logo không border, không nền CSS, không padding; hai pixel góc
  ảnh có alpha bằng 0; favicon trỏ tới cùng tài nguyên trong suốt có hash.
- Hồi quy live: 124 vùng, 3 viewport, 12 lượt chọn vùng, click polygon, deep-link,
  GPS và retry đều đạt, không có page error.
- Live citizen: map loaded, overview 124, MapLibre canvas có mặt và không tràn
  ngang trên mobile.
- Live officer: đăng nhập bằng tài khoản cán bộ thật đạt; logo trong cổng nghiệp
  vụ không border/nền và không tràn ngang.
- nginx, API và timer gia hạn chứng chỉ đều active; API health dùng PostgreSQL.

## Đối chiếu dữ liệu sau phát hành

- 124 địa bàn / 124 ranh giới canonical.
- 296 liên hệ / 34 hotline canonical.
- 1 tài khoản người dân / 5 tài khoản cán bộ.
- 1 phản ánh / 2 SOS; không thay đổi bởi phát hành này.

## Giới hạn giữ nguyên

VNeID chính thức, AI, điều phối 112/113, SMS/push và camera vẫn chưa kết nối.
Phạm vi pilot cán bộ và các giới hạn tài khoản người dân không thay đổi.


# Phát hành logo Công an Lâm Đồng — 07/09/2026

## Phạm vi

- Thay logo ứng dụng bằng ảnh nguồn `assets/images/images.png` tại màn hình chọn
  vai trò, thanh đầu trang người dân, đăng nhập cán bộ và cổng nghiệp vụ.
- Giữ đúng tỷ lệ ảnh gốc 612 × 500, dùng `object-fit: contain`, nền trắng, viền nhẹ
  và bo góc vừa phải để không cắt hoặc làm méo biểu trưng.
- Dùng cùng ảnh cho favicon và Apple touch icon. Vite phát hành thành tài nguyên
  có hash `/assets/images-DXhknGKN.png` để tránh trình duyệt giữ favicon cũ.
- Sửa hai assertion đã lỗi thời trong kiểm thử `province-overview.py`; không đổi
  dữ liệu, API, cấu hình xác thực hoặc quy trình nghiệp vụ.

## Bản phát hành và sao lưu

- Commit ứng dụng đã triển khai: `59e8723210643afa57f3847f43487429e62ca3d1`.
- SHA-256 artifact web: `849fc7239e9c187faa7f8d30075a7adb46c7cb4678941f2e88ee3fadce7a03b1`.
- Backup trước phát hành, chỉ root đọc được:
  `/opt/dataforlife/backups/logo-20260907T164912Z`.
- Backup gồm PostgreSQL custom dump, web cũ, commit cũ và SHA-256. Không chạy
  migration và không ghi dữ liệu thử vào production.

## Kết quả kiểm thử

- Typecheck đủ ba workspace: đạt.
- Unit test: 28/28 đạt (API 19, web 7, data migration 2).
- Production build và kiểm tra MapLibre worker: đạt.
- Kiểm thử giao diện logo desktop/mobile: ảnh tải đúng kích thước nguồn, căn giữa,
  không méo; favicon và Apple touch icon cùng trỏ tới tài nguyên PNG mới.
- Hồi quy live toàn tỉnh: 124 vùng, 3 viewport, 12 lượt chọn vùng, click polygon,
  deep-link reload, GPS và retry đều đạt; không có page error.
- Live citizen: bản đồ `map-loaded=true`, `overview-count=124`, 125 lựa chọn gồm
  “Toàn tỉnh”, MapLibre canvas có mặt, vector tile OpenFreeMap trả 200 và không
  tràn ngang ở mobile.
- Live officer: đăng nhập bằng tài khoản cán bộ thật đạt; cổng nghiệp vụ hiển thị
  logo mới và không tràn ngang ở mobile.
- HTTPS root và API health trả 200, HTTP chuyển 308 sang HTTPS; nginx và
  `dataforlife-api` đều active.

## Đối chiếu dữ liệu sau phát hành

- 124 địa bàn canonical / 124 ranh giới canonical.
- 296 liên hệ canonical / 34 hotline canonical.
- 1 tài khoản người dân / 5 tài khoản cán bộ.
- 1 phản ánh / 2 SOS; không thay đổi bởi phát hành này.
- Tổng vật lý trong các bảng lớn hơn canonical một dòng fixture cũ; fixture không
  được tính là dữ liệu nguồn công khai.

## Giới hạn giữ nguyên

VNeID chính thức, AI, điều phối 112/113, SMS/push và camera vẫn chưa kết nối và
không được mô tả như dịch vụ đang hoạt động. Các giới hạn tài khoản người dân và
phạm vi pilot cán bộ Xuân Hương của release trước không thay đổi.


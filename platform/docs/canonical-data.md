# Canonical data contract

## Nguyên tắc

- Firestore chỉ là nguồn migration; web không được dùng Firebase SDK hay truy
  cập collection trực tiếp.
- PostGIS là nguồn dữ liệu phục vụ API. Hình học gốc được giữ trong
  `boundaries`; phép xác định địa bàn luôn chạy trên hình học đầy đủ.
- Importer mặc định là dry-run. Apply cần đồng thời `--apply --confirm
  canonical-v1`, chạy trong một transaction và không sửa/xóa Firestore.
- Mọi bản ghi giữ `source_system`, `source_id` và `raw_source` để truy vết.

## Ánh xạ canonical

| Nguồn | Canonical | Quy tắc |
| --- | --- | --- |
| `communes`, `cap = 2` | `localities`, `police_units`, `stations` | Một địa bàn, một đơn vị Công an cấp xã/phường và một trụ sở |
| `map34.json` | `boundaries` | Ghép bằng `ma_xa`, chuẩn hóa MultiPolygon/SRID 4326 |
| `contacts`, có địa bàn cấp 2 | `directory_entries` | `entry_type = officer`, liên kết cả đơn vị và địa bàn |
| `communes`, mã `EMERGENCYI…IV` | `hotline_categories` | Gộp metadata trùng thành bốn nhóm có thứ tự I → IV |
| `contacts`, mã `EMERGENCYI…IV` | `hotlines` | Giữ từng đầu mối và số gọi, liên kết nhóm hotline |
| `contacts`, mã `24647`, `24648` | `police_units`, `stations`, `directory_entries` | Tạo đơn vị `industrial_post` có provenance `synthesized_from_contact` |

## Năm phường cũ của Xuân Hương - Đà Lạt

- `service_areas` lưu riêng 5 polygon Phường 1, 2, 3, 4 và 10 cũ; không sửa ranh
  hành chính canonical trong `boundaries`.
- Nguồn hình học lịch sử là lớp GADM 2015 cấp xã/phường qua ArcGIS Feature
  Service. Polygon được cắt theo ranh Xuân Hương hiện tại; phần khe biên còn lại
  được gán tất định theo độ dài biên chung lớn nhất.
- Migration kiểm tra bắt buộc: 5 geometry hợp lệ, không chồng lấn và hợp của 5
  geometry khớp hoàn toàn polygon cha.
- Tất cả bản ghi hiện mang `is_demo = true`,
  `provenance_status = reference_reconstructed`. Chúng chỉ dùng làm lớp tham
  chiếu UI; muốn gắn cán bộ/điều phối nghiệp vụ phải thay bằng ranh được duyệt.
- Snapshot nguồn và quy trình tái tạo nằm trong `database/sources` và
  `database/tools/generate-xuan-huong-service-areas.mjs`.

## Hai đồn KCN

- `24647`: Đồn Công an KCN Tân Rai.
- `24648`: Đồn Công an KCN Nhân Cơ.

Firestore hiện không có bản ghi đơn vị/trụ sở tương ứng. Importer giữ các đầu
mối liên hệ nhưng không suy đoán địa chỉ, tọa độ hoặc polygon. Trụ sở được tạo
với `address = null`, `location_source = address_only` và cảnh báo bắt buộc xác
minh thủ công trước khi công bố vị trí trên bản đồ.

## Kết quả dry-run ngày 2026-08-25

| Đối tượng | Số lượng |
| --- | ---: |
| Địa bàn / ranh giới | 124 / 124 |
| Đơn vị / trụ sở | 136 / 126 |
| Đầu mối danh bạ | 296 |
| Nhóm / số hotline | 4 / 34 |
| Cảnh báo / lỗi chặn | 2 / 0 |

Hai cảnh báo là hai đồn KCN nêu trên. Dry-run không ghi Firestore hoặc PostGIS.

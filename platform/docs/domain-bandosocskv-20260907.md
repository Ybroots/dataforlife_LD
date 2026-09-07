# Gắn tên miền bandosocskv.com — 07/09/2026

## Phạm vi

- DNS nguồn: `@ A 42.96.15.215`, `www CNAME bandosocskv.com`.
- Giữ nguyên địa chỉ HTTPS bằng IP trong giai đoạn chuyển đổi; thêm virtual host
  riêng cho `bandosocskv.com` và `www.bandosocskv.com`.
- HTTP tên miền chuyển 308 về tên miền gốc HTTPS. `www` được phục vụ trên cùng
  chứng chỉ để không có lỗi TLS trước khi ứng dụng tải.
- Chứng chỉ tên miền dùng ACME webroot riêng, không thay hoặc xóa chứng chỉ IP.
- Service gia hạn được đổi từ chỉ kiểm tra chứng chỉ IP sang kiểm tra toàn bộ
  chứng chỉ trong config-dir DataForLife; hook chỉ reload sau khi `nginx -t` qua.
- Giữ nguyên website/API, giới hạn upload 32 MiB, gzip, route phụ MobiRace và dữ
  liệu PostgreSQL. Không chạy migration hoặc bài kiểm thử tạo phản ánh/SOS thật.

## Điều kiện phát hành

- Sao lưu root-only: web, API dist, env, nginx, service, PostgreSQL custom dump
  và số lượng dữ liệu/nghiệp vụ trước/sau.
- Typecheck, 26 unit test và production build/MapLibre worker phải qua.
- Sau phát hành kiểm tra DNS công cộng, chuỗi chứng chỉ/tên SAN, HTTP redirect,
  HTTPS root + www, 124 ranh giới, 296 liên hệ, 34 hotline, bản đồ/worker/tile,
  màn hình guest/citizen/officer, cookie và API guards chỉ đọc.
- Xác minh service/timer gia hạn và chạy dry-run ACME trước khi bàn giao.

Kết quả release, backup và kiểm thử live được bổ sung sau khi phát hành.

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

## Kết quả phát hành

- Commit cấu hình: `2a35a55e845322724304df7fb20ce47dac62a46c`, đã push
  GitHub/main và áp dụng trên VPS hiện có. Bản ứng dụng không thay đổi.
- Backup root-only: `/opt/dataforlife/backups/domain-20260907T132331Z`.
- Chứng chỉ Let's Encrypt ECDSA `dataforlife-domain` có SAN
  `bandosocskv.com`, `www.bandosocskv.com`; Verify return code 0, hạn đến
  06/12/2026. Chứng chỉ HTTPS bằng IP được giữ riêng.
- HTTP tên miền trả 308 về `https://bandosocskv.com/`. HTTPS tên miền gốc,
  `www` và IP cũ đều trả website/API PostgreSQL bình thường.
- Typecheck ba workspace, 26 unit test và production build/worker qua.
- Kiểm thử trình duyệt live đọc-only: guest và citizen, 7 màn hình ở mobile +
  desktop; officer, 4 pane ở mobile + desktop. Không lỗi JS, không tràn ngang;
  MapLibre worker và vector tile tải thật. Cookie hai vai trò là Secure,
  HttpOnly, SameSite=Lax; không tạo phản ánh/SOS kiểm thử.
- Đối chiếu live qua tên miền: 124/124 địa bàn và ranh giới, 296 liên hệ,
  34 hotline đạt. Trước/sau giữ nguyên 1 phản ánh, 2 SOS, 2 actor.
- `dataforlife-api`, nginx và timer đều active. Service gần nhất Result=success,
  ExecMainStatus=0. Dry-run gia hạn riêng tên miền và deploy-hook thành công.
- Cấu hình upload 32 MiB, gzip, route MobiRace và giới hạn tích hợp của release
  trước được giữ nguyên.

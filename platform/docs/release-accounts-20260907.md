# Phát hành tài khoản người dân và cán bộ — 07/09/2026

## Phạm vi và phiên bản

- Ứng dụng: `cf6a162e698ab2ad04cc7c56a75f4d1ef6afb0ba`.
- Đích: `https://bandosocskv.com/` trên VPS hiện hữu `42.96.15.215`.
- Người dân có thể đăng ký bằng họ tên, số điện thoại và mật khẩu; tài khoản
  được lưu trong PostgreSQL. Đăng ký thành công tạo ngay phiên cookie HttpOnly.
- Mật khẩu chỉ lưu dạng `scrypt-v1` có salt riêng và tham số cố định
  `N=16384, r=8, p=1`; không lưu mật khẩu thô trong database/Git.
- Tạo 5 tài khoản cán bộ `canbo01`–`canbo05`, mỗi tài khoản có actor riêng và
  cùng giới hạn trong địa bàn thí điểm Xuân Hương - Đà Lạt (mã `24781`).
- Giữ tương thích với tài khoản citizen/officer cũ trong biến môi trường.

## Sao lưu và triển khai

- Backup trước phát hành: `/opt/dataforlife/backups/accounts-20260907T161254Z`.
- Backup gồm PostgreSQL custom dump, web, API dist, env, systemd và nginx;
  `pg_restore --list` đọc được, có `SHA256SUMS`, thư mục quyền `700`.
- Artifact cuối nằm tại `/opt/dataforlife/releases/cf6a162`.
- Artifact API SHA-256:
  `f2b1ed7d04b3d3b8bf6c18ee8edef6ed917a3dce1f87bb5c19ef92c46c120b52`.
- Artifact web SHA-256:
  `1ec0c7a382ea07be3dceccb0063604017a5b560fdc4cb9336788c857c52ec65d`.
- `index.html` local/live cùng SHA-256
  `df8213ed809b719f672536c9e690572e47f1f5d6177a0a7e78e087d83b3c4b42`;
  `api/dist/server.js` local/live cùng SHA-256
  `d4d518998691055ea7c48dc0dc848f3b40be20fd1db7dd8bbe411e8a11b868dd`.
- Tệp bàn giao mật khẩu cán bộ:
  `/opt/dataforlife/credentials/officers-20260907T161700Z.txt`, owner `root`,
  mode `600`. Tệp không nằm trong repository.

Lần cấp đầu tiên bị dừng do user triển khai không có quyền ghi thư mục bí mật.
Năm account vừa tạo chưa có tham chiếu nghiệp vụ đã được xóa chính xác và tạo
lại. Công cụ sau đó được vá để tạo tệp trước, ghi tệp trong transaction và
rollback/xóa tệp nếu một trong hai phía thất bại.

## Kết quả kiểm thử

- Local: typecheck toàn workspace đạt; 28 unit test đạt; production build đạt;
  MapLibre production worker được xác minh.
- UI detector cho ba bề mặt tài khoản thay đổi: 0 cảnh báo.
- Chromium mobile: đăng ký, kiểm tra mật khẩu không khớp, duy trì phiên, đăng
  xuất/đăng nhập lại và chống tràn ngang đạt.
- Chromium guest/citizen/officer và màn cảnh báo/nghiệp vụ ở 390×844 đạt.
- Database QA riêng `dataforlife_accounts_qa_20260907`: migration đạt, đăng ký
  trả 201, session 200, trùng số 409, sai mật khẩu 401, cán bộ đăng nhập 200;
  hash đúng `scrypt-v1/16384`; đủ 124 địa bàn và 34 hotline.
- Live HTTPS: guest/citizen/officer đạt; hai account QA người dân đã được xóa
  sau kiểm thử và không tạo phản ánh/SOS. Cả 5 tài khoản cán bộ đăng nhập 200.
- Live map: overview 200, MapLibre canvas hiển thị, vector tile OpenFreeMap thực
  trả 200, không tràn ngang. Lỗi console duy nhất là 401 session dành cho khách,
  đúng hành vi xác thực.
- Cookie officer live có đủ `Secure`, `HttpOnly`, `SameSite=Lax`.
- HTTP root chuyển 308 sang HTTPS; root và `www` trả 200; upload limit `32m`.
- `dataforlife-api` và nginx active. Chứng chỉ `bandosocskv.com` hết hạn
  06/12/2026; dry-run riêng của timer DataForLife đạt cho domain, `www` và IP.

Vitest mới không chạy trực tiếp trên Node.js 18 của VPS vì thiếu
`node:util.styleText`; artifact đã được build/test trên local và runtime Node 18
được kiểm tra bằng API/browser live. Không tự ý nâng Node của máy chủ. Lệnh
Certbot toàn cục còn báo lỗi cho chứng chỉ cũ `checkin.catan.vn`; cấu hình ACME
riêng của DataForLife không bị ảnh hưởng và dry-run đạt.

## Đối chiếu dữ liệu live sau phát hành

- 124 địa bàn public / 124 ranh giới public.
- 296 liên hệ public / 34 hotline public.
- 1 phản ánh / 2 SOS, không đổi so với trước phát hành.
- 7 workflow actor: 2 actor cũ + 5 cán bộ mới.
- 5 officer account; 0 citizen account sau khi dọn account QA.

## Giới hạn đã công khai

- VNeID chính thức, AI, 112/113 dispatch, SMS/push và camera chưa kết nối.
- Tài khoản người dân hiện chưa có OTP, quên/đổi mật khẩu hoặc xác minh danh
  tính chính thức; giao diện ghi rõ đây là tài khoản của hệ thống DataForLife.
- Năm tài khoản cán bộ mới chỉ thuộc phạm vi pilot Xuân Hương; không suy diễn
  rằng toàn bộ 124 địa bàn đã có cán bộ trực tuyến.

## Khôi phục

Khôi phục web/API/config từ backup nêu trên. Không restore đè PostgreSQL nếu đã
có tài khoản hoặc hồ sơ mới; khi cần rollback schema phải đối chiếu dữ liệu phát
sinh sau mốc backup trước. Không đụng chứng chỉ hay dịch vụ ngoài DataForLife.

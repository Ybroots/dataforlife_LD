# Ma trận xử lý góp ý và 6 tính năng

Ngày cập nhật: 2026-08-26
Phạm vi: bản web/PWA vòng 1, API/PostGIS canonical và kế hoạch admin mobile.

## Nguyên tắc chốt

- Nội dung demo phải có nhãn **dữ liệu mẫu**, **giao diện demo** hoặc **sandbox**.
- Không tự đổi GPS thật thành Xuân Hương. Người dùng phải chủ động chọn chế độ demo.
- Không vẽ ngẫu nhiên polygon rồi trình bày như dữ liệu nghiệp vụ. Polygon minh họa
  phải nằm trong bảng/service riêng, có `is_demo`, nguồn và phiên bản.
- Web chỉ hướng dẫn bật quyền vị trí trong trình duyệt; chỉ Android native mới có thể
  deep-link sang trang cài đặt hệ thống phù hợp.
- OTP là cơ chế xác thực demo vòng 1, không phải phương án thay thế VNeID khi pilot thật.

## Truy vết góp ý

| Góp ý | Tính năng | Quyết định | Trạng thái hiện tại | Phần còn thiếu để hoàn thành thật |
| --- | --- | --- | --- | --- |
| Thu gọn công cụ bản đồ | 1, 2 | Dùng menu lớp bản đồ; điều hướng phụ nằm trong drawer 6 tính năng | Đã làm UI | Test người dùng và lưu tùy chọn lớp theo URL/tài khoản |
| Nút SOS khó nhận diện | 4 | Nút dạng pill có icon `Siren`, nhãn SOS + Mô phỏng, đặt lệch phải | Đã làm UI | Brand review, SOP và thử nghiệm chạm nhầm |
| Bộ icon không đồng bộ | 1–6 | Chỉ dùng Lucide cùng stroke/style | Đã làm | Kiểm kê icon khi thêm admin/mobile |
| Bán kính quét quá rộng | 1, 2 | Cố định vòng tra cứu tối đa 3 km trong demo | Đã làm | Chốt bán kính theo taxonomy địa bàn trước pilot |
| Không lộ danh sách/quân số CSKV | 1 | API public chỉ trả 1 đầu mối ưu tiên, ẩn tên/cấp bậc; UI không hiện số | Đã làm lớp public | Muốn chống thu thập số triệt để cần call relay/token + rate limit; service area chi tiết mới xác định đúng cán bộ |
| Tới đâu biết tới đó | 1 | GPS/điểm bản đồ xác định địa bàn; không có trang danh sách cán bộ toàn tỉnh | Đã làm ở cấp xã/phường | Cần polygon `service_areas` được duyệt để phân giải đến ô CSKV |
| Chia Xuân Hương thành 5 vùng | 1 | Tái dựng từ ranh 5 phường cũ, cắt theo polygon cha; luôn gắn nhãn tham chiếu | Đã làm PostGIS/API/UI | Cần người có thẩm quyền kiểm tra/thay thế bằng 5 polygon phân công CSKV được duyệt trước khi dùng nghiệp vụ |
| Điểm hội trường thôn/tổ | 1 | Thêm lớp POI sau khi có danh sách/tọa độ | Chưa làm | Tên, tọa độ, nguồn, người duyệt và visibility |
| SOS tự kiểm tra GPS | 4 | Mở trang SOS sẽ tự kiểm tra quyền/vị trí; web hướng dẫn cấp quyền khi bị chặn | Đã làm workflow local, GPS + điểm demo chủ động + idempotency | Android native deep-link settings; offline queue và diễn tập thiết bị |
| SOS chuyển đúng lực lượng | 4 | Bắt buộc chọn loại hỗ trợ; không gửi thật khi chưa có SOP | Đã có router PostGIS → hàng đợi địa bàn, ack/escalation/resolve local | On-call roster chính thức, ma trận category→unit, SLA, kênh 112/113 và diễn tập |
| Admin/chỉ huy chạy trên mobile | 3, 4, 5 | Làm responsive PWA trước, không thu nhỏ nguyên dashboard desktop | Đã có workspace CSKV responsive, inbox và case workspace | SSO/RBAC production, offline và notification |
| Chỉ huy nhận trước và phân công | 3 | State machine `submitted→received→assigned`; chỉ huy là actor phân công | Đã làm migration 005, API transition, audit/outbox và UI | RBAC/roster production và phân quyền tổ chức đầy đủ |
| OTP vòng 1, hoãn VNeID | 3, 4, 5 | Mock OTP qua identity adapter, banner sandbox | Có UI demo | OTP service sandbox, session, rate limit; VNeID vẫn là gate pilot |
| Push mời đánh giá | 5 | Outbox phát thông báo khi chuyển sang trạng thái đủ điều kiện | Thiết kế | Web Push/FCM, device token, retry/delivery log |
| Giữ vụ việc sau đăng xuất | 3, 5 | Dùng receipt/case ID gắn external identity, không phụ thuộc state client | Đã có receipt/API, mock identity và test chống xem chéo | VNeID/session production và quy trình khôi phục tài khoản |
| Cảnh báo theo điểm/vị trí | 2 | Hai cảnh báo mẫu có nhãn rõ; có thể bật/tắt lớp trên bản đồ | Đã làm demo | Migration 004, duyệt/ẩn danh, bbox API, expiry worker |
| Chỉ đường qua Google Maps | 1, 2 | Dùng URL `maps/dir?api=1`; không tự viết routing engine | Đã làm UI | Tọa độ trụ sở/POI được xác minh và fallback địa chỉ |
| Chatbot chỉ cần layout | 6 | Khung chat + câu hỏi gợi ý; không phát sinh câu trả lời giả | Đã làm demo | Knowledge base được duyệt, RAG guardrail, citation/evaluation |
| Android APK, iOS web | 1–6 | Web/PWA là nguồn giao diện; Android wrapper/APK cho vòng 1 | Kế hoạch đóng gói | Signing, manifest/privacy, QA thiết bị và link phân phối có kiểm soát |
| Mặc định mọi GPS về Xuân Hương | 1–6 | Không chấp nhận vì làm sai nghĩa GPS | Đã thay bằng nút demo chủ động | Có thể bật `VITE_DEMO_MODE` khi đóng gói và luôn giữ banner demo |

## Definition of Done cho bản demo vòng 1

1. Mọi tính năng chưa nối backend đều hiện nhãn demo/sandbox ở đầu trang và không
   tạo request nghiệp vụ.
2. Tra cứu thật vẫn đi qua API/PostGIS; không có đường đọc/ghi Firestore từ web.
3. API public không trả danh sách toàn bộ cán bộ, tên/cấp bậc hoặc số lượng đầu mối.
4. Bản đồ hiển thị vòng 3 km, lớp ranh giới và cảnh báo mẫu có thể bật/tắt bằng bàn
   phím lẫn cảm ứng.
5. SOS sandbox tự kiểm tra GPS nhưng không có nội dung nào ngụ ý đã báo lực lượng.
6. Responsive kiểm thử tối thiểu ở 320, 375, 430, 768, 1024, 1440 và landscape;
   không cuộn ngang, mục chạm tối thiểu 44 px, hỗ trợ reduced motion.
7. Typecheck, API test, data-migration test và production build đều pass.

## Backlog có điều kiện, không được “demo giả”

- 5 polygon Xuân Hương đã có lớp tham chiếu; vẫn chờ người có thẩm quyền kiểm
  tra/thay thế bằng ranh phân công CSKV chính thức rồi mới gắn cán bộ.
- Hội trường thôn/tổ: chờ dữ liệu tọa độ có provenance.
- Điều phối SOS và phản ánh: chờ SOP, on-call roster, RBAC và audit.
- Push notification: chờ identity/device registration và outbox worker.
- VNeID production: chờ tài liệu, credentials, sandbox và phê duyệt ATTT.
- AI thật: chờ kho tài liệu có phiên bản, nguồn trích dẫn và bộ evaluation.

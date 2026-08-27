# ĐÁNH GIÁ TÀI LIỆU VÀ HỆ THỐNG

**Ngày đối chiếu:** 27/08/2026

**Phạm vi:** Repository hiện tại và bản triển khai pilot `http://42.96.15.215`

**Phương pháp:** Đối chiếu README, package manifest, frontend, API, xác thực/phân quyền, workflow, migrations/schema; kiểm tra giao diện thực tế bằng trình duyệt ở hai vai trò; không kích hoạt chuyển trạng thái nghiệp vụ thật.

## 1. Tóm tắt điều hành

Hệ thống đã có một luồng pilot khá liền mạch cho hai vai trò **Người dân** và **Cán bộ CSKV**: tra cứu bản đồ/danh bạ, gửi và theo dõi phản ánh, tạo/hủy/theo dõi SOS local, hàng đợi địa bàn, tự nhận hồ sơ, chuyển trạng thái, trao đổi, bằng chứng, cảnh báo, tuần tra, báo cáo và điểm bản đồ.

Các giới hạn trọng yếu trước khi nghiệm thu vận hành chính thức:

1. SOS chưa kết nối 112/113, SMS hoặc Web Push; không được giới thiệu là kênh khẩn cấp chính thức.
2. Website đang chạy qua HTTP; các trang Phản ánh/SOS dùng `crypto.randomUUID()` trực tiếp và có thể trắng/lỗi trên trình duyệt không cung cấp API này cho nguồn không an toàn.
3. “Đăng nhập VNeID” là mô phỏng, chưa phải VNeID chính thức.
4. Chưa có vai trò/giao diện Chỉ huy hoặc Admin vận hành được.
5. Chính sách pilot chỉ cho cán bộ tự nhận; chưa có điều phối sang cán bộ khác.
6. Một phần ranh/điểm đơn vị/CSKV/cảnh báo là demo hoặc tham chiếu; cần chuẩn hóa dữ liệu trước triển khai diện rộng.

## 2. Mức độ xác nhận

| Mức | Ý nghĩa |
| --- | --- |
| A – Xác nhận UI + backend | Có giao diện, endpoint và logic lưu/đọc dữ liệu; đã kiểm tra màn hình thực tế |
| B – Xác nhận từ source | Có mã nguồn UI/backend nhưng chưa thực hiện mọi biến thể dữ liệu |
| C – Giao diện/placeholder | Có phần hiển thị nhưng luồng xử lý chưa hoàn chỉnh hoặc ghi “Đang phát triển” |
| D – Chưa phát hiện | Không có đủ UI/luồng để coi là chức năng hiện hữu |

## 3. Chức năng đã xác nhận hoạt động

| Nhóm | Chức năng | Mức | Ghi chú |
| --- | --- | :---: | --- |
| Public | Bản đồ, tìm địa bàn/đơn vị, ranh/lớp dữ liệu | A | Phụ thuộc bản đồ nền ngoài; có dữ liệu demo/tham chiếu |
| Public | Danh bạ/hotline/liên kết gọi/chỉ đường | A | Chỉ hiển thị khi dữ liệu có giá trị |
| Public | Cảnh báo công khai | A | Chỉ cảnh báo còn hiệu lực |
| Citizen | Đăng nhập mô phỏng, phiên, đăng xuất | A | Session cookie; không phải VNeID thật |
| Citizen | Tạo và theo dõi phản ánh | A | Bắt buộc đúng một ảnh/video ban đầu |
| Citizen | Tin nhắn, tệp bổ sung, thông báo | A | Thông báo trong web |
| Citizen | Đánh giá phản ánh | A | 1–5 sao, một lần, resolved/closed |
| Citizen | Tạo/theo dõi/hủy SOS local | A | Giữ 3 giây; GPS ≤1.000 m; không 112/113 |
| Officer | Đăng nhập và giới hạn địa bàn | A | Chỉ actor_type officer hoạt động |
| Officer | Hàng đợi, tìm/lọc/sắp xếp | A | Tự cập nhật khoảng 8 giây |
| Officer | Tự nhận và workflow SOS/phản ánh | A | Transition hợp lệ được kiểm tra backend |
| Officer | Chi tiết, lịch sử, liên hệ, mở vị trí | A | Lịch sử không sửa ngược ở UI |
| Officer | Trao đổi/yêu cầu media/bằng chứng | B | Dành cho phản ánh |
| Officer | Báo cáo thống kê | A | Ngày/tháng/năm, nhóm, SLA, hài lòng |
| Officer | Điểm bản đồ nghiệp vụ | B | CRUD, kiểm tra tọa độ trong locality |
| Officer | Cảnh báo | B | Thời hạn 2/4/8/24 giờ |
| Officer | Tuần tra | B | Chủ phiên mới cập nhật |
| Officer | Báo cáo cuối ca | B | Tổng hợp + ghi chú |

## 4. Chức năng có UI nhưng chưa xác nhận backend hoàn chỉnh

| Chức năng | Hiện trạng | Khuyến nghị |
| --- | --- | --- |
| Trợ lý AI | Có giao diện/câu hỏi gợi ý, khi gửi cho biết đang phát triển | Giữ nhãn beta/khóa gửi hoặc kết nối dịch vụ trước khi quảng bá |
| Tích hợp VNeID | Đăng nhập người dân mang nhãn VNeID nhưng là mô phỏng | Đổi tên tạm thời thành “Đăng nhập pilot” hoặc tích hợp thật |
| Camera | Có thẻ tích hợp đang phát triển | Không coi là nguồn camera đang hoạt động |
| SMS/Web Push | Có thẻ tích hợp đang phát triển | Bổ sung provider, consent, retry, delivery log trước vận hành |
| 112/113 | Có thẻ tích hợp/ghi chú chưa kết nối | Cần thỏa thuận nghiệp vụ, API, giám sát, diễn tập và fallback |

## 5. Chức năng có backend/dữ liệu nhưng chưa có UI vận hành tương ứng

| Hạng mục | Phát hiện | Đánh giá |
| --- | --- | --- |
| Actor `supervisor` | Schema/workflow có giá trị role và dữ liệu seed | Luồng xác thực officer hiện chỉ nhận `actor_type='officer'`; không có cổng Chỉ huy |
| Audit/outbox | Có bảng audit, outbox và notification delivery | Không có màn hình quản trị/giám sát audit, retry hoặc dead letter |
| Danh sách actor cán bộ | Có API officer actors | UI pilot không dùng để giao sang cán bộ khác do chính sách tự nhận |
| Dữ liệu migration | Có workspace nhập dữ liệu Firestore/map | Là công cụ vận hành kỹ thuật, không có màn hình người dùng cuối |

## 6. Chức năng chưa hoàn thiện/chưa phát hiện

- Chỉ huy xem toàn bộ địa bàn, điều phối lực lượng hoặc chuyển hồ sơ cho cán bộ khác.
- Admin tạo/sửa/khóa tài khoản, đặt lại mật khẩu, phân quyền.
- Quản lý đơn vị/danh mục/khu vực qua giao diện.
- OTP, SSO hoặc VNeID thật.
- Gửi SOS tới 112/113 hoặc hệ thống điều hành bên ngoài.
- SMS, Web Push và thông báo hệ điều hành.
- AI trả lời/triage.
- Camera trực tiếp.
- Chế độ offline và hàng đợi gửi lại khi mất mạng.
- Trạng thái “đã đến hiện trường” hoặc xác nhận di chuyển thực địa.
- Ảnh/video trực tiếp trong SOS.
- Sửa/xóa phản ánh sau gửi.
- Đánh giá SOS.
- Quản lý tài khoản cá nhân/đổi mật khẩu trong UI.

> [!NOTE]
> Với các mục trên, cách mô tả đúng là: **“Chức năng này chưa được phát hiện trong phiên bản source code hiện tại”** hoặc **“Giao diện đã tồn tại nhưng chưa xác nhận được luồng xử lý backend hoàn chỉnh”** theo từng trường hợp.

## 7. Đánh giá UX dành cho người dân

### 7.1 Điểm tốt

- Nút SOS nổi bật và yêu cầu giữ 3 giây, giảm chạm nhầm.
- Sau gửi có mã biên nhận, trạng thái và timeline.
- Luồng phản ánh hướng dẫn trường bắt buộc, giới hạn ký tự/tệp.
- Có chế độ xem công khai không cần đăng nhập cho bản đồ, danh bạ và cảnh báo.
- Trạng thái người dân được diễn đạt khác nhãn kỹ thuật.
- Có tour hướng dẫn và màn hình tài khoản tập trung.

### 7.2 Điểm gây khó hiểu/rủi ro

| Vấn đề | Mức | Tác động | Đề xuất |
| --- | :---: | --- | --- |
| Nhãn “VNeID” khi chỉ là mô phỏng | Cao | Người dân có thể hiểu nhầm là tích hợp chính thức | Đổi thành “Đăng nhập pilot” và đặt chú thích ngay trên form |
| SOS nhìn giống kênh khẩn cấp thật nhưng chỉ local | Rất cao | Kỳ vọng sai, chậm liên hệ cứu trợ | Banner cố định trước khi vào SOS; hiển thị kênh dự phòng rõ ràng |
| HTTP có thể làm trang SOS/Phản ánh trắng | Rất cao | Chức năng cốt lõi không dùng được | Bắt buộc HTTPS; bổ sung fallback UUID; kiểm thử Chrome/Safari/Android/iOS |
| SOS chưa có quick call | Trung bình/Cao | Khi hệ thống lỗi, người dân phải tự tìm kênh khác | Có thể bổ sung nút gọi dự phòng ngoài nút gửi; ghi rõ không phải dispatch tự động |
| Feature drawer không có mục SOS | Trung bình | Người dùng tìm trong menu không thấy | Thêm dòng SOS hoặc giải thích nút nổi trong tour |
| Dữ liệu demo/tham chiếu nằm chung dữ liệu thật | Cao | Liên hệ/định vị nhầm | Gắn watermark “Dữ liệu minh họa”; tách environment hoặc cờ dataset |
| Ranh service area/điểm demo có khả năng không khớp canonical locality | Cao | Vị trí nhìn như trong vùng nhưng backend từ chối | Chạy kiểm tra topology và test point-in-polygon trước phát hành dữ liệu |
| Thông báo chỉ trong web | Trung bình | Bỏ lỡ cập nhật khi đóng tab | Ghi rõ trong UI; bổ sung Web Push/SMS khi đủ điều kiện |
| Phản ánh buộc một tệp | Trung bình | Người dùng không có bằng chứng không thể gửi | Xác nhận lại yêu cầu nghiệp vụ; nếu không bắt buộc, cho phép không tệp |
| Không sửa/xóa sau gửi | Trung bình | Sai thông tin khó khắc phục | Cho phép bổ sung lời đính chính; hiển thị cảnh báo kiểm tra trước gửi rõ hơn |

### 7.3 SOS có dễ bị nhấn nhầm không?

Nút dễ nhận biết nhưng ít nguy cơ gửi nhầm nhờ thao tác giữ 3 giây. Tuy nhiên người dùng vẫn có thể vào màn hình SOS do nút nổi. Cần giữ màn xác nhận/giữ và phản hồi rung/đếm ngược; không rút ngắn thời gian mà chưa đánh giá usability.

### 7.4 Người dân có biết đã gửi thành công không?

Có, nếu trang biên nhận tải được: mã `SOS-`/`PA-`, trạng thái và lịch sử là tín hiệu rõ. Nên bổ sung hướng dẫn cố định: “Chỉ gửi thành công khi có mã”; tài liệu này đã nêu điều đó.

### 7.5 GPS sai có được cảnh báo không?

Có kiểm tra độ chính xác và vùng phục vụ. Tuy vậy cần dùng thông báo dễ hành động hơn: nêu sai số hiện tại, ngưỡng yêu cầu và nút **Thử lấy vị trí lại**.

### 7.6 Lỗi mạng có làm gửi SOS nhiều lần không?

Client tạo khóa idempotency cho lần gửi, giúp hạn chế tạo trùng. Tuy nhiên khi người dùng tải lại/khởi tạo lại có thể có khóa mới. Cần lưu idempotency key bền hơn trong thời gian ngắn, hiển thị trạng thái “đang gửi”, khóa nút và đối chiếu biên nhận trước khi cho gửi lại.

## 8. Đánh giá UX dành cho cán bộ

### 8.1 Điểm tốt

- Hàng đợi có số liệu nhanh, scope, kind, tìm kiếm và ưu tiên.
- SOS và phản ánh có màu/nhãn riêng, timeline rõ.
- Ghi chú có độ dài tối thiểu; kết quả/đóng đòi nội dung dài hơn.
- Có lựa chọn nội bộ/công khai cho ghi chú.
- Backend kiểm tra transition, địa bàn và actor; giảm thao tác sai chỉ dựa vào UI.
- Có cơ chế cập nhật định kỳ và lịch sử không sửa ngược.

### 8.2 Điểm gây khó hiểu/rủi ro

| Vấn đề | Mức | Tác động | Đề xuất |
| --- | :---: | --- | --- |
| Nút **Xử lý hồ sơ** không nói rõ “tự nhận” | Trung bình | Dễ hiểu là mở form xử lý hoặc giao người khác | Đổi thành **Tự nhận hồ sơ** khi chưa phân công |
| **Chuyển tuyến / phối hợp đơn vị** không chọn được đơn vị | Cao | Trạng thái “chuyển tuyến” nhưng thiếu đích đến | Bổ sung đơn vị đích/kênh/mã tham chiếu hoặc đổi nhãn thành “Đánh dấu cần phối hợp” |
| Chỉ số **Đang xử lý** và SLA có thể thay đổi theo layout | Thấp | Giảng viên/người dùng khó đối chiếu | Chuẩn hóa tên chỉ số và tooltip |
| Thông báo chỉ in-app | Cao | Trực ban có thể bỏ lỡ SOS nếu tab đóng | Web Push/SMS/âm thanh có kiểm soát; health monitor màn hình trực |
| Không có điều phối chéo | Cao | Tải công việc không cân bằng; phải phối hợp ngoài hệ thống | Bổ sung role/permission và assignment transaction |
| Không có màn hình quản trị tài khoản | Cao | Khó cấp/khóa/reset trong vận hành | Xây cổng quản trị có audit và nguyên tắc tối thiểu quyền |
| Ghi chú công khai đặt gần thao tác | Trung bình | Có thể vô tình lộ thông tin nội bộ | Mặc định nội bộ cho nội dung nhạy cảm; preview nội dung người dân sẽ thấy |
| Không có xác nhận độc lập cho mọi hành động nghiêm trọng | Trung bình | Dễ đóng/ngoài phạm vi nhầm | Modal xác nhận cho resolved/closed/rejected/cancel và hiển thị mã hồ sơ |

### 8.3 Cán bộ có biết hồ sơ đang chờ không?

Có: chỉ số, **Cần làm ngay**, nhãn **Chờ xác nhận/Chờ tiếp nhận**, badge thông báo và tự refresh. Rủi ro còn lại là tab trình duyệt đóng hoặc mất kết nối mà không có push/âm thanh giám sát.

### 8.4 Hai cán bộ có thể cùng nhận một hồ sơ không?

Cả hai có thể cùng nhìn thấy hồ sơ chưa giao. Backend thực thi transition/assignment theo trạng thái và policy, vì vậy cập nhật cũ có thể bị từ chối sau khi người khác xử lý. Cần kiểm thử tải đồng thời và hiển thị thông báo xung đột thân thiện; UI nên hiển thị ngay người vừa tự nhận.

## 9. Các nút/icon cần xem xét đổi tên

| Hiện tại | Đề xuất | Lý do |
| --- | --- | --- |
| **Đăng nhập VNeID** | **Đăng nhập pilot** (cho đến khi tích hợp thật) | Tránh tuyên bố sai mức tích hợp |
| **Xử lý hồ sơ** | **Tự nhận hồ sơ** khi chưa giao | Phản ánh đúng hành động thực tế |
| **Chuyển tuyến / phối hợp đơn vị** | **Đánh dấu cần chuyển tuyến/phối hợp** nếu chưa chọn được đích | Tránh hiểu rằng đã điều phối hoàn tất |
| Icon thông báo không kèm trạng thái mạng | Thêm chỉ báo **Đang kết nối/Mất kết nối** | Trực ban cần biết dữ liệu có đang cập nhật |
| Nút vị trí chỉ dùng icon | Thêm tooltip/nhãn **Vị trí của tôi** | Hỗ trợ người ít dùng công nghệ |

Không đề xuất đổi các nhãn workflow đã khớp backend nếu chưa có kế hoạch migration và cập nhật đồng bộ tài liệu.

## 10. Các flow còn nhiều bước

### Phản ánh người dân

Biểu mẫu có nhiều trường và bắt buộc một tệp. Có thể giảm tải bằng tiến trình 3 bước: **Nội dung → Bằng chứng & vị trí → Kiểm tra & gửi**, tự lưu nháp cục bộ và hiển thị lỗi theo từng bước.

### Chuyển trạng thái cán bộ

Mỗi trạng thái yêu cầu chọn hành động, nhập ghi chú, chọn công khai và xác nhận. Đây là kiểm soát cần thiết, nhưng có thể dùng mẫu ghi chú theo hành động và phím tắt an toàn; không bỏ bước xác nhận với kết quả/đóng/ngoài phạm vi.

## 11. Kiến nghị theo mức ưu tiên

### P0 – Trước vận hành thật

1. Triển khai HTTPS/domain và sửa fallback `crypto.randomUUID()` cho trang SOS/Phản ánh.
2. Làm rõ bằng UI rằng SOS là local hoặc hoàn tất kết nối 112/113 trước khi gọi là kênh khẩn cấp.
3. Chuẩn hóa dữ liệu địa bàn, service area, đơn vị, CSKV và điểm demo; kiểm tra topology.
4. Thiết lập giám sát, sao lưu, log/audit truy cập, chính sách dữ liệu cá nhân và quy trình sự cố.
5. Kiểm thử end-to-end trên Android/iOS/desktop, mạng chậm/mất mạng, GPS sai, thao tác đồng thời.

### P1 – Vận hành pilot an toàn

1. Bổ sung Web Push/âm thanh/SMS có kiểm soát hoặc quy trình trực tab bắt buộc.
2. Xây role Chỉ huy/điều phối và assignment có đơn vị/cán bộ đích.
3. Xây Admin cho tài khoản, khóa/reset, đơn vị, phân quyền với audit.
4. Bổ sung connection status, conflict message và dashboard health.
5. Tách dữ liệu demo khỏi dữ liệu vận hành, gắn nhãn rõ.

### P2 – Cải thiện trải nghiệm

1. Wizard phản ánh và lưu nháp.
2. Preview ghi chú công khai.
3. Tooltip/nhãn cho icon.
4. Trạng thái giao/đã đến hiện trường nếu nghiệp vụ phê duyệt.
5. Khả năng đính chính phản ánh sau gửi mà vẫn giữ lịch sử.

## 12. Đánh giá bộ tài liệu

| Yêu cầu | Kết quả |
| --- | --- |
| Hướng dẫn chính cho người dân/cán bộ | Đã tạo |
| SOS chi tiết và cảnh báo không thử | Đã tạo |
| Flowchart kiến trúc/SOS | Đã tạo bằng Mermaid |
| Trạng thái đúng source | Đã đối chiếu workflow |
| Ma trận quyền | Đã tạo, không giả định CMD/ADM |
| Hướng dẫn nhanh | Đã tạo |
| FAQ | Đã tạo |
| Tài liệu đào tạo 30–60 phút | Đã tạo, 5 bài thực hành |
| Danh sách màn hình/route | Đã tạo theo query route thực tế |
| Use case/mapping API | Đã tách khỏi tài liệu người dùng chính |
| Screenshot | Đã chụp từ bản pilot thật; dữ liệu minh họa đã xóa sau chụp |
| Giới hạn chưa hoàn thiện | Đã ghi rõ |

## 13. Checklist nghiệm thu tài liệu

- [x] Tất cả chức năng mô tả đều có căn cứ trong source/UI.
- [x] Không mô tả Chỉ huy/Admin là role đang hoạt động.
- [x] Tên menu, nút và trạng thái lấy theo UI/workflow.
- [x] Permission và giới hạn tự nhận đúng chính sách pilot.
- [x] Người dân và cán bộ có hướng dẫn riêng.
- [x] Có SOS, phản ánh, bản đồ, thông báo, lỗi, quyền thiết bị và bảo mật.
- [x] Có FAQ, quick guide, đào tạo, screen matrix, use case matrix.
- [x] Có ảnh thực tế; không tạo ảnh giả.
- [x] Không đưa tài khoản/mật khẩu pilot vào tài liệu.
- [x] Nội dung kỹ thuật/API được tách khỏi hướng dẫn người dùng chính.

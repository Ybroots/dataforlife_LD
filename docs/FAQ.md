# CÂU HỎI THƯỜNG GẶP (FAQ)

## Dành cho người dân

### 1. Tôi có cần đăng nhập để gửi SOS không?

Có. Website cho xem bản đồ, danh bạ và cảnh báo công khai khi chưa đăng nhập; gửi SOS, phản ánh, nhận thông báo và đánh giá yêu cầu đăng nhập.

### 2. Đăng nhập VNeID có phải VNeID chính thức không?

Chưa. Phiên bản hiện tại dùng đăng nhập mô phỏng bằng số điện thoại và mật khẩu cho giai đoạn pilot.

### 3. SOS có gửi vị trí của tôi không?

Có. SOS yêu cầu tọa độ và độ chính xác. Vị trí phải thuộc địa bàn đang phục vụ và sai số không lớn hơn khoảng 1.000 m.

### 4. Làm sao biết SOS đã gửi thành công?

Chỉ coi là thành công khi màn hình hiển thị mã bắt đầu bằng `SOS-`, trạng thái, địa bàn và lịch sử. Không gửi lại nếu đã có mã.

### 5. SOS có gọi trực tiếp 112/113 không?

Không. SOS hiện chỉ vào hàng đợi trực ban local của hệ thống pilot, chưa kết nối chính thức 112/113, SMS hoặc thông báo đẩy.

### 6. Tôi có thể hủy SOS không?

Có, nhưng chỉ khi yêu cầu còn ở **Đã tạo trên thiết bị** hoặc **Đã vào hàng đợi trực ban local**. Hệ thống yêu cầu xác nhận trước khi hủy.

### 7. Vì sao phải nhấn giữ SOS 3 giây?

Để giảm nguy cơ chạm nhầm. Nếu thả trước khi đủ 3 giây, yêu cầu không được gửi.

### 8. Vì sao ứng dụng không xác định được vị trí?

GPS có thể đang tắt, trình duyệt bị chặn quyền, thiết bị ở nơi kín hoặc mạng yếu. Hãy bật GPS, cho phép vị trí, ra nơi thoáng và tải lại trang.

### 9. Vì sao hệ thống báo vị trí không hợp lệ?

Vị trí có thể ngoài địa bàn đang phục vụ hoặc sai số GPS trên 1.000 m. Chờ tín hiệu ổn định và thử lại tại đúng vị trí thực tế.

### 10. Tôi có thể gửi ảnh hoặc video trong SOS không?

Không. Biểu mẫu SOS hiện chỉ nhận nhóm tình huống, ghi chú, vị trí và liên hệ. Ảnh/video được hỗ trợ trong phản ánh.

### 11. Tôi có thể gửi ảnh/video trong phản ánh không?

Có. Mỗi lần tạo phản ánh phải chọn đúng một ảnh JPEG/PNG/WebP tối đa 5 MB hoặc một video MP4/WebM tối đa 20 MB.

### 12. Tôi có thể chỉnh sửa hoặc xóa phản ánh đã gửi không?

Không có chức năng sửa/xóa toàn bộ phản ánh sau khi gửi. Bạn có thể gửi tin nhắn và tệp bổ sung trong chi tiết hồ sơ.

### 13. Làm sao xem lại phản ánh?

Mở **Phản ánh** → **Theo dõi** → chọn hồ sơ trong **Phản ánh của tôi**.

### 14. Làm sao biết yêu cầu đã được tiếp nhận?

Mở hồ sơ và xem trạng thái/lịch sử; hoặc mở **Thông báo**. SOS hiển thị **Cán bộ đã xác nhận tiếp nhận** khi cán bộ xác nhận. Phản ánh hiển thị **Trực ban đã tiếp nhận**.

### 15. Cán bộ nào nhận yêu cầu của tôi?

Hồ sơ được giới hạn theo địa bàn. Chi tiết phản ánh có thể hiển thị người phụ trách sau khi được phân công; SOS không bảo đảm hiển thị đầy đủ tên đơn vị/cán bộ ở mọi giai đoạn.

### 16. Tôi có nhận được thông báo khi đóng trình duyệt không?

Chưa. Thông báo hiện là thông báo trong website và được tải định kỳ khi website đang mở. Web Push/SMS đang phát triển.

### 17. Khi nào tôi được đánh giá?

Khi phản ánh ở **Đã có kết quả** hoặc **Đã đóng**. Mỗi phản ánh được đánh giá một lần từ 1–5 sao; SOS chưa có đánh giá.

### 18. Vì sao bản đồ không hiển thị?

Kiểm tra Internet, tắt chế độ tiết kiệm dữ liệu/VPN nếu gây cản trở, tải lại trang hoặc thử trình duyệt khác. Bản đồ nền phụ thuộc dịch vụ bản đồ ngoài.

### 19. Vì sao trang SOS/Phản ánh bị trắng?

Máy chủ pilot hiện chạy qua HTTP; một số trình duyệt không cung cấp đầy đủ chức năng an toàn mà trang sử dụng. Hãy thử trình duyệt được hỗ trợ, dùng địa chỉ HTTPS khi được cấp và báo bộ phận kỹ thuật.

### 20. Tôi có thể dùng Trợ lý AI để yêu cầu trợ giúp không?

Không. Mục này đang hiển thị **Đang phát triển** và chưa có luồng trả lời hoàn chỉnh.

## Dành cho cán bộ

### 21. Vì sao tôi không nhìn thấy SOS?

Hồ sơ có thể ở địa bàn khác, bị ẩn bởi bộ lọc hoặc đã kết thúc. Chọn **Tất cả**, lọc **SOS**, tải lại và kiểm tra đúng tài khoản địa bàn.

### 22. Vì sao không thể tiếp nhận?

Kiểm tra trạng thái hiện tại, hành động được phép và ghi chú tối thiểu 8 ký tự. Hồ sơ khác địa bàn hoặc tài khoản không hoạt động sẽ bị từ chối.

### 23. Vì sao không thể chuyển đơn vị hoặc giao cán bộ khác?

Chính sách pilot chỉ cho cán bộ đăng nhập tự nhận hồ sơ cho chính mình. Giao chéo/chuyển đơn vị bằng danh sách cán bộ chưa được hỗ trợ.

### 24. Vì sao không thể cập nhật trạng thái?

Các trạng thái phải đi đúng thứ tự. Hành động kết quả, đóng hoặc ngoài phạm vi yêu cầu ghi chú tối thiểu 20 ký tự; các hành động khác tối thiểu 8 ký tự.

### 25. Khi nhiều cán bộ cùng nhìn thấy một SOS thì xử lý thế nào?

Mỗi cán bộ cần tải lại hàng đợi, kiểm tra người phụ trách và tự nhận hồ sơ trước khi xử lý. Backend kiểm tra trạng thái hiện tại nên một cập nhật cũ có thể bị từ chối khi người khác đã thay đổi trước. Sau lỗi, tải lại chi tiết và phối hợp theo quy trình đơn vị.

### 26. Làm sao xem lịch sử xử lý?

Mở hồ sơ và xem mục **Lịch sử không thể sửa ngược**. Lịch sử ghi trạng thái, thời gian và ghi chú; giao diện không cho sửa/xóa ngược.

### 27. Làm sao gọi người dân hoặc mở chỉ đường?

Trong chi tiết hồ sơ, dùng **Gọi người dân** nếu có số và **Mở vị trí**/**Mở Google Maps** nếu có tọa độ. Hệ thống chỉ mở ứng dụng ngoài, không tự ghi nhận kết quả cuộc gọi/di chuyển.

### 28. Khi nào ghi chú được người dân nhìn thấy?

Khi đánh dấu **Thông báo ghi chú này cho người dân**. Bỏ chọn để lưu nội bộ; người dân vẫn nhìn thấy trạng thái hiện tại.

### 29. Tôi có thể yêu cầu người dân gửi thêm ảnh không?

Có đối với phản ánh. Mở phần trao đổi, gửi yêu cầu bổ sung hình ảnh hoặc tin nhắn. SOS hiện không có luồng đính kèm tương tự.

### 30. Tôi có thể sửa lịch sử hoặc mở lại hồ sơ không?

Không thể sửa lịch sử. Phản ánh **Đã có kết quả** có thể trở lại **Đang xử lý**; SOS **Đã có kết quả** có thể trở lại **Đang triển khai xử lý**. Hồ sơ **Đã đóng** không có chuyển trạng thái tiếp theo.

### 31. Thông báo cán bộ có phải SMS/Web Push không?

Không. Đây là thông báo trong cổng cán bộ. SMS/Web Push đang phát triển.

### 32. Có tài khoản Chỉ huy hoặc Admin không?

Chưa có luồng đăng nhập/giao diện vận hành Chỉ huy hay Admin được xác nhận trong phiên bản hiện tại.

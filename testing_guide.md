# 📖 Hướng dẫn Kiểm thử Hệ thống UniThesis

Tài liệu này hướng dẫn cách kiểm tra toàn bộ các tính năng của hệ thống Quản lý Khóa luận UniThesis theo đúng quy trình nghiệp vụ thực tế.

---

## 1. Chuẩn bị Môi trường
Trước khi bắt đầu, hãy đảm bảo:
- Server đang chạy: `npx http-server ./ -p 8888`
- Địa chỉ truy cập: `http://localhost:8888`
- **Quan trọng:** Nhấn `Ctrl + F5` để xóa cache trình duyệt, đảm bảo đang chạy bản code mới nhất.

---

## 2. Kịch bản 1: Quản lý Người dùng (Vai trò TBM)
**Mục tiêu:** Kiểm tra khả năng tạo và quản lý tài khoản theo chuẩn ERD mới.

1. **Đăng nhập:** Truy cập bằng email TBM (VD: `123@@hcmute.edu.vn`).
2. **Tab Quản lý User:**
   - Nhấn **"Thêm Người Dùng"**.
   - Kiểm tra xem có đầy đủ ô nhập: **Mã số (MS)** và **Họ tên (Ten)** hay không.
   - Tạo thử 1 Sinh viên và 1 Giảng viên mới.
3. **Chỉnh sửa:** Nhấn biểu tượng bút chì để sửa thông tin và kiểm tra xem dữ liệu có lưu đúng không.

---

## 3. Kịch bản 2: Đăng ký Đề tài (Vai trò Sinh viên)
**Mục tiêu:** Kiểm tra luồng đăng ký đa năng (BCTT và KLTN).

1. **Đăng nhập:** Truy cập bằng email Sinh viên vừa tạo.
2. **Tab Danh sách Đề tài:**
   - Nhấn **"Đăng ký Đề tài Mới"**.
   - **Test BCTT:** Chọn loại hình BCTT, nhập tên công ty, chọn GVHD -> Nhấn Đăng ký.
   - **Test KLTN:** Sau khi đăng ký BCTT, thử đăng ký tiếp KLTN (Hệ thống cho phép SV thực hiện song song hoặc nối tiếp tùy cấu hình).
3. **Kiểm tra:** Đảm bảo đề tài vừa đăng ký xuất hiện trong bảng với trạng thái "Đăng ký BCTT/KLTN".

---

## 4. Kịch bản 3: Phê duyệt & Quy trình (Vai trò TBM/GV)
**Mục tiêu:** Kiểm tra các bước chuyển trạng thái (Workflow).

1. **Đăng nhập:** Vai trò TBM hoặc GVHD của sinh viên đó.
2. **Tab Phê duyệt & HĐ:**
   - Tìm sinh viên mục tiêu -> Nhấn **"Xử lý Phê duyệt"**.
   - **Bước 1 (Duyệt đề tài):** Chọn "Duyệt" -> Trạng thái chuyển thành "GVHD Duyệt".
   - **Bước 2 (Nộp bài):** Đăng nhập lại SV, nhấn "Thao tác Workflow" để nộp tóm tắt/file bài làm.
   - **Bước 3 (Turnitin):** Log lại TBM, nhập tỷ lệ % Turnitin -> Nhấn Lưu.

---

## 5. Kịch bản 4: Hội đồng & Chấm điểm (Vai trò TBM)
**Mục tiêu:** Kiểm tra bảng điểm 7 cột và tính điểm trung bình.

1. **Phân công Hội đồng:** Ở bước tiếp theo của workflow, nhập thông tin: Chủ tịch, Thư ký, Ủy viên, Ngày, Giờ, Địa điểm.
2. **Nhập điểm chi tiết:**
   - Mở cửa sổ xử lý (Modal lúc này sẽ tự động mở rộng **Siêu rộng - 1100px**).
   - Nhập điểm cho: GVHD, GVPB, CTHĐ, TVHĐ 1, 2, 3, 4.
   - **Kiểm tra:** Xem ô **Điểm TB** có tự động tính khi bạn vừa nhập xong mỗi ô không.
3. **Biên bản:** Nhấn nút **"BIÊN BẢN"**, nhập nhận xét và yêu cầu chỉnh sửa -> Lưu.

---

## 6. Kịch bản 5: Xác nhận Cuối & Đóng hồ sơ
**Mục tiêu:** Kiểm tra khâu chốt hồ sơ an toàn.

1. **Sinh viên:** Đăng nhập, vào Workflow nộp "Minh chứng bản sửa cuối" (Zip file).
2. **Giảng viên hướng dẫn:** Vào phê duyệt, tích chọn **"GVHD xác nhận bài sửa"**.
3. **Chủ tịch hội đồng:** Tích chọn **"Chủ tịch HĐ xác nhận"** -> Nhấn Duyệt.
4. **Kết quả:** Trạng thái đề tài phải chuyển thành **"Xác nhận cuối"** (Màu xanh lá).

---

## 7. Kiểm tra Bảo mật & Hiển thị
- **Sinh viên:** Đăng nhập và xem chi tiết đề tài. Đảm bảo **KHÔNG THẤY** 7 đầu điểm chi tiết, chỉ thấy **Điểm Tổng Kết**.
- **Responsive:** Co giãn cửa sổ trình duyệt để đảm bảo Modal không bị cắt (Đã cấu trúc `max-w-6xl` và `overflow-x-auto`).

---

> [!TIP]
> **Mẹo:** Bạn có thể mở 2 trình duyệt khác nhau (VD: Chrome và Edge) hoặc 1 tab ẩn danh để đăng nhập cùng lúc 2 vai trò nhằm kiểm tra luồng phản hồi nhanh hơn.

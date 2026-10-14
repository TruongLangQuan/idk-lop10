# BÀI TẬP TIN HỌC 10: AN TOÀN, ĐẠO ĐỨC SỐ VÀ ỨNG DỤNG AI CÓ TRÁCH NHIỆM
- **Môn học:** Tin học 10 – Kết nối tri thức với cuộc sống (Chủ đề 2: Đạo đức, pháp luật và văn hóa trong môi trường số)
- **Quy cách trình bày:** Gạch đầu dòng rõ ràng, mạch lạc, bám sát kiến thức SGK và thực tiễn công nghệ số.

---

## CÂU HỎI 2: THẢO LUẬN AN TOÀN & ĐẠO ĐỨC SỐ

### a) Tại sao không nên nhập thông tin cá nhân nhạy cảm, mật khẩu hoặc tài liệu bảo mật lên các công cụ dịch thuật trực tuyến miễn phí?
- **Dữ liệu được lưu trữ trên máy chủ bên thứ ba:** Mọi đoạn văn bản khi nhập vào đều được chuyển về và lưu trên hệ thống máy chủ của nhà cung cấp dịch vụ, nằm ngoài tầm kiểm soát của người dùng.
- **Dữ liệu bị sử dụng để huấn luyện AI:** Các điều khoản sử dụng dịch vụ miễn phí thường cho phép nhà cung cấp khai thác nội dung người dùng nhập vào để tinh chỉnh, nâng cấp mô hình học máy. Thông tin của bạn có thể vô tình xuất hiện trong kết quả trả về cho người khác.
- **Nhân viên kiểm duyệt có thể đọc được:** Để đánh giá chất lượng dịch thuật, các kỹ sư hoặc đối tác thứ ba có thể xem xét ngẫu nhiên các đoạn văn bản lưu trên hệ thống.
- **Nguy cơ rò rỉ dữ liệu (Data Breach):** Nếu dịch vụ bị tin tặc tấn công hoặc đường truyền mạng không an toàn, các thông tin bảo mật (mật khẩu, tài khoản ngân hàng, tài liệu nội bộ) sẽ bị đánh cắp và lợi dụng vào mục đích xấu.

### b) Nguyên tắc phối hợp Con người làm trung tâm (Human-in-the-loop - HITL) khi làm việc với AI là gì?
- **Khái niệm:** Là nguyên tắc khẳng định con người luôn giữ vai trò chủ đạo, tham gia trực tiếp vào các khâu định hướng, giám sát, đánh giá và ra quyết định cuối cùng trong toàn bộ quy trình làm việc với trí tuệ nhân tạo.
- **Nội dung cốt lõi:**
  - AI chỉ đóng vai trò là công cụ hỗ trợ (tổng hợp thông tin, đưa ra gợi ý, xử lý dữ liệu thô).
  - Con người là người kiểm duyệt nội dung, chỉnh sửa sai sót, bảo đảm tính nhân văn, đạo đức và pháp lý của sản phẩm.
  - Con người chịu trách nhiệm hoàn toàn về kết quả cuối cùng trước pháp luật và xã hội, không thể đổ lỗi cho máy móc hay thuật toán.

---

## CÂU HỎI 3: TẠO CÂU LỆNH TÌM KIẾM (PROMPTING)

- **Câu lệnh mẫu (Prompt):**  
  > *"Hãy gợi ý cho tôi 3 kho học liệu mở miễn phí của Việt Nam có cung cấp bài giảng THPT kèm theo địa chỉ trang web truy cập cụ thể."*

- **Kết quả trả lời gợi ý 3 kho học liệu uy tín:**
  1. **Kho học liệu số toàn ngành giáo dục (Bộ GD&ĐT):**
     - *Địa chỉ truy cập:* `https://igiaoduc.vn`
     - *Đặc điểm:* Cung cấp hàng chục nghìn bài giảng e-learning, giáo án điện tử, sách giáo khoa và tài liệu tham khảo chính thống từ lớp 1 đến lớp 12 do Bộ Giáo dục và Đào tạo quản lý.
  2. **Hệ thống Bài giảng Điện tử e-Learning (Bộ GD&ĐT / Cục CNTT):**
     - *Địa chỉ truy cập:* `https://elearning.moet.edu.vn`
     - *Đặc điểm:* Nơi lưu trữ các bài giảng e-learning đạt giải trong các cuộc thi cấp quốc gia, phục vụ học sinh THPT tự học và ôn tập các môn học theo từng bài.
  3. **Hệ tri thức Việt số hóa (V-KNOW / Cổng thông tin học liệu mở):**
     - *Địa chỉ truy cập:* `https://itrithuc.vn` (hoặc kênh học liệu truyền hình số VTV7 trên `https://vtvgo.vn`)
     - *Đặc điểm:* Cung cấp các khóa học, video bài giảng bổ trợ kiến thức môn học lớp 10 bám sát chương trình Giáo dục phổ thông mới.

---

## CÂU HỎI 4: PHÂN TÍCH RỦI RO THÔNG TIN

- **Hiện tượng "Ảo giác" (Hallucination) của mô hình ngôn ngữ:**
  - Bản chất của AI (như ChatGPT, Gemini) là mô hình dự đoán xác suất từ tiếp theo (next-token prediction) dựa trên khối lượng văn bản khổng lồ đã được học, chứ AI không "lướt web" hay hiểu thực thể như con người (nếu không kích hoạt tính năng duyệt web thời gian thực).
- **Cơ chế ghép nối đường dẫn URL của AI:**
  - Khi được yêu cầu cung cấp link, AI sẽ tự động ghép các thành phần quen thuộc theo thói quen ngôn ngữ: giao thức `https://`, tên miền phổ biến (như `.edu.vn`, `.vn`, `.com`) và các từ khóa tiếng Việt viết liền không dấu (`/bai-giang/toan-10/...`).
  - Kết quả tạo ra một đường dẫn trông rất hợp lý, chuẩn cú pháp về mặt hình thức nhưng thực chất chưa từng được khởi tạo trên máy chủ thật, dẫn đến lỗi truy cập `404 Not Found`.

---

## CÂU HỎI 5: SO SÁNH GOOGLE SEARCH TRUYỀN THỐNG VÀ AI CHATBOT

| Tiêu chí so sánh | Google Search truyền thống | AI Chatbot (ChatGPT, Gemini...) |
| :--- | :--- | :--- |
| **Tốc độ** | - Cực nhanh (dưới 1 giây) để trả về hàng triệu đường link.<br>- Tuy nhiên, con người tốn thời gian nhấp vào từng web, đọc lọc và tự tổng hợp thông tin. | - Mất vài giây để sinh văn bản (chậm hơn về thời gian phản hồi ban đầu).<br>- Nhưng tiết kiệm thời gian đọc tổng thể vì AI đã phân tích và tóm tắt trực tiếp câu trả lời. |
| **Độ chính xác** | - Phụ thuộc vào độ uy tín của nguồn trang web do người dùng chọn lọc.<br>- Giữ nguyên vẹn tính chân thực của văn bản gốc (không tự bịa đặt nội dung). | - Có nguy cơ xảy ra hiện tượng "ảo giác" (bịa số liệu, sai lệch ngày tháng, nhầm lẫn tác giả).<br>- Luôn cần con người kiểm chứng lại nguồn dữ liệu. |
| **Khả năng cá nhân hóa** | - Rất hạn chế: Kết quả tìm kiếm chủ yếu dựa trên từ khóa, vị trí địa lý và bài viết cố định của các trang web. | - Cực kỳ cao: Có thể tùy biến văn phong, độ dài, giải thích theo cấp độ người học (học sinh lớp 10, người mới bắt đầu), tương tác qua lại nhiều lượt để làm rõ vấn đề. |

---

## CÂU HỎI 6: TỐI ƯU PROMPT CHO DỊCH THUẬT

### a) So sánh hiệu quả giữa 2 cách viết Prompt:
- **Cách 1 (Thông thường):**
  - AI chỉ đóng vai trò như một bộ máy dịch từ ngữ đơn thuần (dịch theo nghĩa đen - word-by-word).
  - Dễ gặp lỗi cứng nhắc, ngữ điệu thiếu tự nhiên, làm mất đi các sắc thái văn hóa, ẩn dụ hoặc dịch sai các câu thành ngữ, tục ngữ.
- **Cách 2 (Nâng cao):**
  - AI được gán vai trò rõ ràng (*"chuyên gia dịch thuật"*), mục tiêu cụ thể (*"tiếng Anh tự nhiên, giữ nguyên ẩn dụ"*) và có thêm yêu cầu bổ trợ (*"giải thích từ vựng chính"*).
  - Bản dịch sẽ mượt mà, đúng ngữ cảnh thực tế của người bản xứ và giúp người học vừa có bản dịch tốt vừa học thêm được từ vựng và cấu trúc ngữ pháp.

### b) Bài học rút ra về vai trò của việc viết Prompt:
- Một Prompt chất lượng cần tuân thủ cấu trúc chuẩn: **Vai trò (Role) + Bối cảnh (Context) + Yêu cầu cụ thể (Instruction) + Định dạng mong muốn (Constraint/Format)**.
- Khi người dùng cung cấp yêu cầu càng chi tiết, rõ ràng và có định hướng thì AI sẽ trả về kết quả càng chính xác, sâu sắc và hạn chế tối đa việc trả lời chung chung hoặc sai lệch.

---

## CÂU HỎI 7: TRÁCH NHIỆM CỦA CON NGƯỜI

- **AI không có tư cách pháp nhân và ý thức đạo đức:** AI chỉ là phần mềm máy tính và mô hình toán học; AI không thể nhận thức được đúng/sai, không có lương tâm và không thể chịu trách nhiệm trước pháp luật khi có thiệt hại xảy ra.
- **Phòng ngừa rủi ro sai sót của công nghệ:** AI vẫn luôn tiềm ẩn nguy cơ đưa thông tin sai lệch, định kiến văn hóa, đạo văn hoặc vi phạm bản quyền. Nếu không có con người kiểm duyệt, những sản phẩm lỗi sẽ gây hậu quả nghiêm trọng.
- **Yếu tố cảm xúc và nhân văn:** Chỉ con người mới có sự đồng cảm, khả năng thấu hiểu bối cảnh văn hóa xã hội thực tế và đưa ra các quyết định có tính đạo đức, phù hợp với thuần phong mỹ tục và chuẩn mực cộng đồng.

---

## CÂU HỎI 8: RỦI RO RÒ RỈ DỮ LIỆU

### a) Dữ liệu người dùng nhập vào các công cụ AI miễn phí có thể bị khai thác như thế nào?
- **Tái sử dụng làm dữ liệu huấn luyện:** Hệ thống tự động thu thập các cuộc trò chuyện để huấn luyện các phiên bản AI tiếp theo. Dữ liệu này có thể vô tình hiển thị trong câu trả lời cho một người dùng khác trong tương lai.
- **Khai thác hồ sơ hành vi:** Doanh nghiệp cung cấp AI phân tích câu hỏi của người dùng để xây dựng hồ sơ sở thích, thói quen nhằm phục vụ mục đích quảng cáo hướng đối tượng.
- **Đánh giá thủ công từ con người:** Đội ngũ kiểm thử và kỹ sư AI của công ty công nghệ có quyền đọc trực tiếp các đoạn chat để đánh giá hiệu năng mô hình (RLHF).

### b) Rủi ro đối với an toàn thông tin cá nhân:
- **Lộ thông tin định danh:** Nguy cơ rò rỉ họ tên, số điện thoại, địa chỉ nhà, trường lớp, CCCD, khuôn mặt.
- **Lộ bí mật cá nhân và công việc:** Rò rỉ tài liệu nội bộ, kế hoạch dự án, mật khẩu, tài khoản ngân hàng.
- **Nguy cơ lừa đảo và mạo danh:** Kẻ xấu có thể lợi dụng dữ liệu rò rỉ để thực hiện các cuộc tấn công mạng, gửi tin nhắn lừa đảo tống tiền hoặc mạo danh người dùng để lừa gạt bạn bè, người thân.

---

## CÂU HỎI 9: ĐẠO ĐỨC HỌC THUẬT

- **Thui chột tư duy phản biện và khả năng giải quyết vấn đề:** Học sinh dễ hình thành thói quen chấp nhận thụ động mọi kết quả AI đưa ra mà không biết hoài nghi, đối chiếu hay tự đặt câu hỏi "tại sao", khiến não bộ mất dần phản xạ suy luận độc lập.
- **Suy giảm năng lực tự học và trí nhớ:** Quá trình tư duy để tìm ra lời giải bài tập là cách duy nhất giúp củng cố liên kết nơ-ron và ghi nhớ kiến thức lâu dài. Nếu chỉ sao chép kết quả từ AI, học sinh sẽ bị "hổng" kiến thức cơ bản và mất hoàn toàn khả năng làm bài khi bước vào các kỳ thi thực tế không có kết nối mạng.
- **Xói mòn sự trung thực và tính tự giác:** Việc dùng AI làm bài tập hộ rồi nộp cho thầy cô là hành vi gian lận học thuật, làm sai lệch kết quả đánh giá năng lực thực tế và tạo thói quen sống ỷ lại, thiếu trách nhiệm.
- **Hạn chế kỹ năng diễn đạt và giao tiếp:** Dùng văn mẫu AI quá nhiều khiến học sinh không phát triển được vốn từ vựng tự nhiên, văn phong cá nhân và khả năng thuyết phục người khác bằng ngôn từ của chính mình.

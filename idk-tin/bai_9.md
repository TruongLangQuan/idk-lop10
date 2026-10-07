# BÀI 9: AN TOÀN TRÊN KHÔNG GIAN MẠNG
## NỘI DUNG SOẠN: HOẠT ĐỘNG 2 & PHẦN 2 – PHẦN MỀM ĐỘC HẠI (SGK TRANG 45 – 48)
*(Môn Tin học 10 – Bộ sách Kết nối tri thức với cuộc sống – Chủ đề 2: Mạng máy tính và Internet)*

---

## I. SOẠN HOẠT ĐỘNG 2 (SGK TRANG 45)

> **HOẠT ĐỘNG 2: CÓ NHỮNG LOẠI PHẦN MỀM ĐỘC HẠI NÀO?**  
> 1. *Em hiểu gì về virus máy tính?*  
> 2. *Có phải tất cả phần mềm độc hại đều là virus?*

### 1. Em hiểu gì về virus máy tính?
- **Định nghĩa:** Virus máy tính là những **đoạn mã độc** (không phải là một phần mềm hoàn chỉnh độc lập) được tạo ra với ý đồ xấu.
- **Đặc điểm và cơ chế hoạt động:**
  - **Bắt buộc phải kí sinh:** Virus không thể tự tồn tại độc lập mà phải gắn mình vào một tệp chương trình vật chủ khác (như tệp thực thi `.exe`, `.com`, hoặc các tệp văn bản có macro `.docx`, `.xlsm`).
  - **Cơ chế lây lan:** Khi người dùng bấm chạy phần mềm bị nhiễm, đoạn mã virus sẽ được nạp vào bộ nhớ (RAM), sau đó tự động tìm kiếm và chèn mã độc vào các tệp chương trình lành lặn khác trong máy để hoàn thành một chu kì lây lan.
  - **Tác hại:** Gây tiêu tốn tài nguyên hệ thống, làm chậm máy, làm hỏng hoặc xóa dữ liệu, phá hoại các phần mềm khác, thậm chí làm hỏng hệ điều hành.

### 2. Có phải tất cả phần mềm độc hại đều là virus không?
- **Trả lời dứt khoát: KHÔNG.**
- **Giải thích bản chất:**
  - Thuật ngữ chung và chính xác cho tất cả các phần mềm có hại là **Malware (Phần mềm độc hại)**.
  - **Virus chỉ là một nhánh nhỏ** trong thế giới phần mềm độc hại.
  - Nhiều người thường có thói quen gọi chung mọi sự cố máy tính nhiễm mã độc là "bị nhiễm virus", nhưng thực tế còn có rất nhiều loại phần mềm độc hại khác với cấu trúc, cơ chế hoạt động và mục tiêu hoàn toàn khác biệt:
    + **Worm (Sâu máy tính):** Là phần mềm độc lập hoàn chỉnh, tự nhân bản và tự lây qua mạng mà không cần tệp vật chủ.
    + **Trojan (Phần mềm nội gián):** Không tự lây lan, ẩn mình dưới vỏ bọc phần mềm hữu ích để lừa người dùng cài đặt, sau đó mở cổng cho tin tặc xâm nhập hoặc đánh cắp dữ liệu.
    + **Spyware (Phần mềm gián điệp) / Keylogger:** Lén lút theo dõi, ghi lại phím bấm để trộm mật khẩu.
    + **Ransomware (Mã độc tống tiền):** Khóa/mã hóa dữ liệu đòi tiền chuộc (như WannaCry).

---

## II. NỘI DUNG CHI TIẾT PHẦN 2: PHẦN MỀM ĐỘC HẠI (SGK TRANG 45 – 48)

### 1. Khái niệm Phần mềm độc hại (Malware)
- **Thuật ngữ:** Viết tắt từ cụm từ tiếng Anh **Malicious Software** (*Malware*).
- **Định nghĩa:** Là những chương trình hoặc đoạn mã được kẻ xấu viết ra nhằm mục đích xâm nhập, phá hoại hệ thống máy tính, đánh cắp thông tin cá nhân hoặc chiếm đoạt quyền điều khiển của người dùng.
- **Tiêu chí phân loại chính trong SGK:** Dựa theo **cơ chế lây nhiễm**, chia làm:
  - Nhóm có khả năng tự lây nhiễm cao trên quy mô lớn: **Virus** và **Worm**.
  - Nhóm chú trọng hoạt động nội gián, chiếm quyền và đánh cắp dữ liệu (ít chú trọng lây nhiễm): **Trojan**.

---

### 2. Tìm hiểu về Virus, Worm, Trojan và cơ chế hoạt động (Mục 2a, trang 46 – 47)

#### a) Virus máy tính
- **Bản chất:** Không phải là một phần mềm hoàn chỉnh, mà chỉ là **đoạn mã độc kí sinh**.
- **Cách thức lây lan:**
  - Phải gắn chặt vào một phần mềm hợp pháp (vật chủ).
  - Khi người dùng kích hoạt phần mềm nhiễm bệnh $\rightarrow$ mã độc tải vào bộ nhớ $\rightarrow$ tự động tìm và chèn vào các file khác trong máy.
- **Đặc trưng:** Cần có sự tương tác của con người (mở tệp nhiễm) để phát tán.

#### b) Worm (Sâu máy tính)
- **Bản chất:** Là một **chương trình hoàn chỉnh, độc lập** (không cần kí sinh vào tệp nào khác).
- **Cách thức lây lan:**
  - Tự động nhân bản và phát tán qua mạng Internet, email, ứng dụng nhắn tin.
  - Khai thác các **lỗ hổng bảo mật** của hệ điều hành hoặc phần mềm máy chủ.
  - Sử dụng kỹ thuật lừa đảo (Social Engineering): Gửi email/tin nhắn chứa liên kết ngầm với tiêu đề hấp dẫn (ví dụ: *"Bấm vào đây để xem ảnh/nhận thưởng"*), khi người dùng nhấp vào thì mã độc tự động tải về và lây lan sang toàn bộ danh bạ.

#### c) Trojan (Phần mềm nội gián)
- **Nguồn gốc tên gọi:** Bắt nguồn từ điển tích *"Con ngựa thành Troa"* (Trojan Horse) trong thần thoại Hy Lạp – ngụy trang thành món quà tặng để đưa quân địch vào bên trong thành trì.
- **Bản chất:** Ẩn mình bên trong các phần mềm tưởng chừng vô hại hoặc hữu ích (game, ứng dụng xem phim, phần mềm bẻ khóa crack) để lừa người dùng tự cài đặt vào máy.
- **Đặc điểm:** Không có tính năng tự nhân bản lây lan, tập trung vào hoạt động nội gián, ăn trộm dữ liệu hoặc chiếm quyền kiểm soát máy tính.
- **Các dạng Trojan phổ biến (SGK trang 47):**
  - **Spyware (Phần mềm gián điệp):** Ngấm ngầm thu thập thông tin cá nhân, tài liệu, lịch sử duyệt web và gửi về cho tin tặc.
  - **Keylogger:** Loại spyware chuyên ghi lại toàn bộ thao tác bàn phím và chuột nhằm đánh cắp tài khoản, mật khẩu, thông tin thẻ tín dụng.
  - **Backdoor (Cửa sau):** Tạo ra một tài khoản truy cập bí mật, giúp tin tặc dễ dàng vượt qua tường lửa để điều khiển máy tính từ xa.
  - **Rootkit:** Loại mã độc nguy hiểm nhất, chiếm quyền quản trị cao nhất của hệ thống (Root/Administrator), có khả năng ẩn mình hoàn hảo và tự xóa mọi dấu vết hoạt động.

---

### 3. Tác hại của phần mềm độc hại (Mục 2b, trang 47)

- **Các mức độ tác hại:**
  - *Mức độ nhẹ:* Gây phiền toái, hiển thị quảng cáo rác liên tục, thay đổi trang chủ trình duyệt, làm chậm hiệu năng máy tính.
  - *Mức độ nguy hiểm:* Làm hỏng phần mềm, xóa tệp tin quan trọng, đánh cắp mật khẩu, tống tiền, làm tê liệt toàn bộ hệ thống.
  - *Mức độ thảm họa mạng (DDoS):* Phần mềm độc hại biến hàng triệu máy tính nhiễm độc thành một mạng lưới máy tính ma (**Botnet / Zombie**). Khi nhận lệnh, chúng đồng loạt truy cập vào một máy chủ mục tiêu làm quá tải và sập hệ thống (hình thức **Tấn công từ chối dịch vụ - Denial of Service**).

- **Các thảm họa sâu máy tính tiêu biểu trong lịch sử (SGK nêu):**
  1. **Sâu Melissa (1999):** Lừa người dùng mở file đính kèm Word qua email, tự gửi tới 50 địa chỉ đầu tiên trong danh bạ Outlook $\rightarrow$ Gây thiệt hại hơn **1 tỉ USD**.
  2. **Sâu Code Red (2001):** Khai thác lỗ hổng bảo mật của máy chủ Windows IIS, chỉ trong 10 ngày đã lây nhiễm hàng trăm nghìn máy chủ $\rightarrow$ Gây thiệt hại khoảng **2 tỉ USD**.
  3. **Mã độc WannaCry (2017):** Thuộc dòng Ransomware, quét lỗ hổng SMB trên Windows, tự động mã hóa toàn bộ dữ liệu trên ổ cứng tại hơn 150 quốc gia và đòi tiền chuộc bằng Bitcoin để lấy khóa giải mã.

---

### 4. Phòng chống phần mềm độc hại (Mục 2c, trang 48)

Để bảo vệ thiết bị và thông tin cá nhân, người dùng cần tuân thủ **4 nguyên tắc vàng**:

1. **Thận trọng khi sao chép và tải phần mềm:**
   - Không tải hoặc sử dụng phần mềm bẻ khóa (crack), phần mềm không rõ nguồn gốc trôi nổi trên mạng (đa số đều bị cài cắm mã độc có chủ đích).
   - Kiểm tra, quét virus các thiết bị nhớ ngoài (USB, thẻ nhớ, ổ cứng rời) trước khi sao chép tệp vào máy.
2. **Cảnh giác trước các liên kết và thư điện tử:**
   - Không mở liên kết hay tệp đính kèm trong email, tin nhắn lạ.
   - Nếu nhận được link lạ từ tài khoản bạn bè, cần liên hệ xác minh bằng kênh khác (gọi điện, gặp trực tiếp) trước khi bấm vào.
3. **Bảo mật tài khoản cá nhân:**
   - Đặt mật khẩu mạnh (gồm chữ hoa, chữ thường, số và ký tự đặc biệt), không dùng chung một mật khẩu cho nhiều dịch vụ.
   - Bật tính năng xác thực hai yếu tố (2FA).
4. **Sử dụng công cụ bảo vệ chuyên nghiệp:**
   - Bật tường lửa (Firewall) và tính năng bảo vệ thời gian thực của hệ điều hành (**Windows Defender**).
   - Có thể cài đặt thêm các phần mềm diệt virus uy tín: BKAV, Kaspersky, Avast, AVG, Bitdefender, Norton...
   - Thường xuyên cập nhật hệ điều hành (Windows Update) để vá các lỗ hổng bảo mật mới nhất.

---

## III. BẢNG TỔNG KẾT SO SÁNH 3 LOẠI PHẦN MỀM ĐỘC HẠI
*(Hoàn thành bài tập bảng tổng kết – SGK trang 48)*

| Tiêu chí | Virus máy tính | Worm (Sâu máy tính) | Trojan (Phần mềm nội gián) |
| :--- | :--- | :--- | :--- |
| **Bản chất cấu tạo** | Là **đoạn mã độc**, không phải phần mềm hoàn chỉnh. | Là một **chương trình hoàn chỉnh, độc lập**. | Là một **chương trình hoàn chỉnh, độc lập**. |
| **Sự phụ thuộc vật chủ** | **Bắt buộc phải kí sinh** vào tệp/chương trình khác mới hoạt động được. | **Không cần vật chủ**, hoạt động và tồn tại độc lập. | **Không kí sinh**, ngụy trang dưới dạng phần mềm có ích (game, tiện ích). |
| **Cơ chế lây lan** | Lây lan khi người dùng kích hoạt tệp vật chủ; chèn mã độc vào các tệp khác trong máy. | Tự động nhân bản và lây lan qua mạng, email, tin nhắn hoặc qua lỗ hổng hệ thống. | **Không tự lây lan**; lừa người dùng tự tải về và cài đặt vào máy. |
| **Mục đích & Tác hại chính** | Phá hủy dữ liệu, làm hỏng tệp, tiêu hao tài nguyên, làm hỏng hệ điều hành. | Làm nghẽn mạng, phá hoại máy chủ, tạo mạng botnet để tấn công từ chối dịch vụ (DDoS). | Đánh cắp thông tin cá nhân/mật khẩu (Spyware, Keylogger), tạo cửa sau (Backdoor), chiếm quyền điều khiển cao nhất (Rootkit). |

---

## IV. CÂU HỎI CỦNG CỐ & GHI NHỚ TRỌNG TÂM (SGK TRANG 48)

### 1. Hộp ghi nhớ kiến thức cốt lõi:
- *Phần mềm độc hại là phần mềm viết ra với ý đồ xấu, gây ra các tác động không mong muốn.*
- *Virus và worm là các phần mềm độc hại có khả năng lây nhiễm; Trojan là phần mềm nội gián để ăn cắp thông tin và chiếm đoạt quyền trên máy.*
- *Để phòng ngừa phần mềm độc hại, không lấy từ trên mạng hoặc sao chép qua các thiết bị nhớ những phần mềm không biết rõ; không mở liên kết lạ trong email/tin nhắn; sử dụng phần mềm phòng chống mã độc.*

### 2. Câu hỏi trắc nghiệm ôn tập nhanh:

**Câu 1:** Phần mềm độc hại nào sau đây **không** có khả năng tự lây lan?  
A. Virus.  
B. Worm.  
C. Trojan.  
D. Sâu Melissa.  
$\rightarrow$ **Đáp án: C. Trojan** *(Trojan chỉ lừa người dùng cài đặt chứ không có tính năng tự nhân bản lây lan).*

**Câu 2:** Điểm khác biệt cơ bản nhất giữa Virus và Worm là gì?  
A. Virus nguy hiểm hơn Worm.  
B. Virus là đoạn mã cần tệp vật chủ để kí sinh, còn Worm là phần mềm hoàn chỉnh có thể tự nhân bản độc lập.  
C. Worm chỉ lây qua USB còn Virus lây qua Internet.  
D. Worm không gây hại cho máy tính.  
$\rightarrow$ **Đáp án: B.**

**Câu 3:** Phần mềm ngầm ghi lại toàn bộ hoạt động gõ phím của người dùng nhằm đánh cắp mật khẩu được gọi là:  
A. Keylogger.  
B. Rootkit.  
C. Backdoor.  
D. WannaCry.  
$\rightarrow$ **Đáp án: A. Keylogger.**

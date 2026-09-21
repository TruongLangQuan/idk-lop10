# Bài 3: Cấu trúc lớp vỏ electron nguyên tử

## A. ĐỀ CƯƠNG TÓM TẮT KIẾN THỨC

### I. Chuyển động của electron trong nguyên tử
**1. Mô hình hành tinh nguyên tử (Rutherford – Bohr – Sommerfeld):**
- Cho rằng electron chuyển động xung quanh hạt nhân theo quỹ đạo tròn hoặc bầu dục (tương tự các hành tinh quay quanh Mặt Trời).
- *Ý nghĩa và hạn chế:* Thúc đẩy lý thuyết cấu tạo nguyên tử phát triển nhưng không giải thích được nhiều tính chất của nguyên tử.

**2. Mô hình hiện đại về chuyển động của electron:**
- Trong nguyên tử, electron chuyển động rất nhanh, không theo quỹ đạo xác định.
- **Orbital nguyên tử (AO - Atomic Orbital):** Là khu vực không gian xung quanh hạt nhân mà ở đó xác suất có mặt (tìm thấy) electron là lớn nhất (khoảng 90%), được hình dung như một đám mây electron.

**3. Hình dạng orbital nguyên tử:**
- **AO s:** Có dạng hình cầu, tâm là hạt nhân nguyên tử.
- **AO p:** Có dạng hình số 8 nổi (hình quả tạ đôi), định hướng theo 3 trục không gian: $p_x$ (trục x), $p_y$ (trục y), $p_z$ (trục z).
- Ngoài ra còn có các AO d, AO f với hình dạng phức tạp hơn.

**4. Ô orbital:**
- Một AO được biểu diễn bằng một ô vuông (gọi là ô orbital $\square$).
- **Nguyên lí loại trừ Pauli (Pau-li):** Trong 1 orbital chỉ chứa tối đa 2 electron và có chiều tự quay ngược nhau.
  + Nếu AO có 1 electron (electron độc thân): biểu diễn bằng 1 mũi tên hướng lên ($\uparrow$).
  + Nếu AO có 2 electron (electron ghép đôi): biểu diễn bằng 2 mũi tên ngược chiều nhau, mũi tên đi lên viết trước ($\uparrow\downarrow$).

---

### II. Lớp và phân lớp electron
**1. Lớp electron:**
- Gồm các electron có mức năng lượng gần bằng nhau.
- Các electron ở lớp gần hạt nhân bị hút mạnh hơn $\rightarrow$ năng lượng thấp hơn; ở lớp xa hạt nhân $\rightarrow$ năng lượng cao hơn.
- Kí hiệu và tên lớp (đánh số từ trong ra ngoài):
  + Số thứ tự ($n$): $n = 1, 2, 3, 4, 5, 6, 7$
  + Tên lớp: $\text{K, L, M, N, O, P, Q}$

**2. Phân lớp electron:**
- Mỗi lớp electron lại chia thành các phân lớp, kí hiệu bằng các chữ cái thường: $\text{s, p, d, f}$.
- Các electron trên cùng một phân lớp có mức năng lượng bằng nhau.
- Số phân lớp trong mỗi lớp bằng số thứ tự của lớp ($n \le 4$):
  + Lớp thứ 1 ($n=1$, lớp K): có 1 phân lớp ($1\text{s}$).
  + Lớp thứ 2 ($n=2$, lớp L): có 2 phân lớp ($2\text{s}, 2\text{p}$).
  + Lớp thứ 3 ($n=3$, lớp M): có 3 phân lớp ($3\text{s}, 3\text{p}, 3\text{d}$).
  + Lớp thứ 4 ($n=4$, lớp N): có 4 phân lớp ($4\text{s}, 4\text{p}, 4\text{d}, 4\text{f}$).

**3. Số lượng orbital và số electron tối đa trong phân lớp, lớp:**
- **Số AO trong mỗi phân lớp:**
  + Phân lớp s: có 1 AO $\rightarrow$ chứa tối đa 2 electron ($\text{s}^2$).
  + Phân lớp p: có 3 AO $\rightarrow$ chứa tối đa 6 electron ($\text{p}^6$).
  + Phân lớp d: có 5 AO $\rightarrow$ chứa tối đa 10 electron ($\text{d}^{10}$).
  + Phân lớp f: có 7 AO $\rightarrow$ chứa tối đa 14 electron ($\text{f}^{14}$).
- **Trong lớp thứ $n$ ($n \le 4$):**
  + Tổng số AO trong lớp $n$ là $n^2$.
  + Số electron tối đa trong lớp $n$ (lớp bão hòa) là $2n^2$.
  + *Ví dụ:* Lớp L ($n=2$) có $2^2 = 4$ AO, tối đa $2 \cdot 2^2 = 8$ electron; Lớp M ($n=3$) có $3^2 = 9$ AO, tối đa $2 \cdot 3^2 = 18$ electron.

---

### III. Cấu hình electron của nguyên tử
**1. Các nguyên lí và quy tắc phân bố electron:**
- **Nguyên lí vững bền:** Ở trạng thái cơ bản, electron lần lượt chiếm các orbital có mức năng lượng từ thấp đến cao:
  $$1\text{s} \; 2\text{s} \; 2\text{p} \; 3\text{s} \; 3\text{p} \; 4\text{s} \; 3\text{d} \; 4\text{p} \; 5\text{s} \dots$$
- **Nguyên lí Pauli:** Mỗi ô orbital chứa tối đa 2 electron có chiều tự quay ngược nhau.
- **Quy tắc Hund (Hun):** Trong cùng một phân lớp, các electron phân bố vào các orbital sao cho số electron độc thân là tối đa và có chiều tự quay giống nhau.

**2. Các bước viết cấu hình electron:**
- *Bước 1:* Xác định tổng số electron của nguyên tử ($Z$).
- *Bước 2:* Sắp xếp theo trật tự mức năng lượng tăng dần: $1\text{s} \; 2\text{s} \; 2\text{p} \; 3\text{s} \; 3\text{p} \; 4\text{s} \dots$
- *Bước 3:* Điền electron vào các phân lớp theo nguyên lí vững bền đến electron cuối cùng.
- *Bước 4:* Viết lại theo thứ tự từng lớp (từ trong ra ngoài, ví dụ khi có phân lớp 3d: sắp $3\text{d}$ trước $4\text{s}$). Có thể viết gọn qua cấu hình khí hiếm gần nhất ($[\text{He}], [\text{Ne}], [\text{Ar}]$).

**3. Đặc điểm lớp electron ngoài cùng:**
- Số electron ngoài cùng quyết định tính chất hoá học cơ bản của nguyên tố:
  + **1, 2, 3 electron ngoài cùng:** Thường là kim loại (trừ $\text{H}, \text{He}, \text{B}$).
  + **5, 6, 7 electron ngoài cùng:** Thường là phi kim.
  + **8 electron ngoài cùng:** Khí hiếm (rất bền vững; riêng $\text{He}$ có 2 electron ngoài cùng).
  + **4 electron ngoài cùng:** Có thể là kim loại ($\text{Sn}, \text{Pb}$) hoặc phi kim ($\text{C}, \text{Si}$).

---

## B. TRẢ LỜI CÂU HỎI VÀ BÀI TẬP SGK

### 1. Dừng lại và suy ngẫm (Trang 22)
**Câu 1:** Mô hình hiện đại mô tả sự chuyển động của electron trong nguyên tử như thế nào?
$\rightarrow$ Trong nguyên tử, electron chuyển động cực nhanh xung quanh hạt nhân không theo những quỹ đạo xác định. Người ta chỉ có thể xác định được vùng không gian xung quanh hạt nhân mà xác suất tìm thấy electron là lớn nhất (khoảng 90%), được gọi là orbital nguyên tử (AO).

**Câu 2:** Orbital s có dạng:
$\rightarrow$ **C. hình cầu.**

**Câu 3:** Quan sát Hình 3.3 và nêu sự định hướng của các AO p trong không gian.
$\rightarrow$ Các AO p có dạng hình số 8 nổi và định hướng theo 3 trục toạ độ Đề-các vuông góc nhau trong không gian:
- $\text{AO } \text{p}_x$: Định hướng dọc theo trục $x$.
- $\text{AO } \text{p}_y$: Định hướng dọc theo trục $y$.
- $\text{AO } \text{p}_z$: Định hướng dọc theo trục $z$.

---

### 2. Dừng lại và suy ngẫm (Trang 23)
**Câu 4:** Hãy cho biết tổng số electron tối đa chứa trong:
a) Phân lớp p:
$\rightarrow$ Phân lớp p có 3 AO, mỗi AO chứa tối đa 2 electron nên số electron tối đa là **6** (kí hiệu $\text{p}^6$).
b) Phân lớp d:
$\rightarrow$ Phân lớp d có 5 AO, mỗi AO chứa tối đa 2 electron nên số electron tối đa là **10** (kí hiệu $\text{d}^{10}$).

**Câu 5:** Lớp electron có số electron tối đa gọi là lớp electron bão hoà. Tổng số electron tối đa có trong các lớp L và M là:
$\rightarrow$ **C. 8 và 18.**
*(Giải thích: Lớp L ($n=2$) có tối đa $2 \cdot 2^2 = 8\text{e}$; lớp M ($n=3$) có tối đa $2 \cdot 3^2 = 18\text{e}$).*

---

### 3. Dừng lại và suy ngẫm (Trang 24)
**Câu 6:** Cấu hình electron của nguyên tử có $Z = 16$ là:
$\rightarrow$ **C. $1\text{s}^2 2\text{s}^2 2\text{p}^6 3\text{s}^2 3\text{p}^4$.**

**Câu 7:** Biểu diễn cấu hình electron của các nguyên tử có $Z = 8$ và $Z = 11$ theo ô orbital.
$\rightarrow$
* **Với $Z = 8$ (Oxygen - O):**
  - Cấu hình electron: $1\text{s}^2 2\text{s}^2 2\text{p}^4$.
  - Phân bố vào ô orbital:
    + Ô $1\text{s}$: $[\uparrow\downarrow]$
    + Ô $2\text{s}$: $[\uparrow\downarrow]$
    + 3 ô $2\text{p}$: $[\uparrow\downarrow][\uparrow][\uparrow]$ (gồm 1 ô ghép đôi và 2 ô chứa electron độc thân tuân theo quy tắc Hund).
* **Với $Z = 11$ (Sodium - Na):**
  - Cấu hình electron: $1\text{s}^2 2\text{s}^2 2\text{p}^6 3\text{s}^1$.
  - Phân bố vào ô orbital:
    + Ô $1\text{s}$: $[\uparrow\downarrow]$
    + Ô $2\text{s}$: $[\uparrow\downarrow]$
    + 3 ô $2\text{p}$: $[\uparrow\downarrow][\uparrow\downarrow][\uparrow\downarrow]$
    + Ô $3\text{s}$: $[\uparrow]$ (chứa 1 electron độc thân).

---

### 4. Dừng lại và suy ngẫm (Trang 25)
**Câu 8:** Silicon được sử dụng trong nhiều ngành công nghiệp... Hãy biểu diễn cấu hình electron của nguyên tử silicon ($Z = 14$) theo ô orbital, chỉ rõ việc áp dụng các nguyên lí vững bền, nguyên lí Pauli và quy tắc Hund.
$\rightarrow$
* Cấu hình electron của Si ($Z = 14$): $1\text{s}^2 2\text{s}^2 2\text{p}^6 3\text{s}^2 3\text{p}^2$.
* Phân bố theo ô orbital:
  - Ô $1\text{s}$: $[\uparrow\downarrow]$
  - Ô $2\text{s}$: $[\uparrow\downarrow]$
  - 3 ô $2\text{p}$: $[\uparrow\downarrow][\uparrow\downarrow][\uparrow\downarrow]$
  - Ô $3\text{s}$: $[\uparrow\downarrow]$
  - 3 ô $3\text{p}$: $[\uparrow][\uparrow][\quad]$
* Chỉ rõ áp dụng nguyên lí và quy tắc:
  - **Nguyên lí vững bền:** Electron được điền tuần tự từ phân lớp có mức năng lượng thấp đến cao ($1\text{s} \rightarrow 2\text{s} \rightarrow 2\text{p} \rightarrow 3\text{s} \rightarrow 3\text{p}$).
  - **Nguyên lí Pauli:** Ở mỗi ô orbital ($1\text{s}, 2\text{s}, 2\text{p}, 3\text{s}$), 2 electron có chiều tự quay ngược nhau, biểu diễn bằng hai mũi tên ngược chiều ($\uparrow\downarrow$).
  - **Quy tắc Hund:** Ở phân lớp $3\text{p}$ có 2 electron, chúng được phân bố độc thân vào 2 ô orbital khác nhau với mũi tên cùng hướng lên ($[\uparrow][\uparrow][\quad]$) để số electron độc thân là tối đa, không ghép đôi trong 1 ô.

**Câu 9:** Chlorine ($Z = 17$) thường được sử dụng để khử trùng nước máy... Viết cấu hình electron của chlorine và cho biết tại sao chlorine là phi kim.
$\rightarrow$
- Cấu hình electron của Cl ($Z = 17$): $1\text{s}^2 2\text{s}^2 2\text{p}^6 3\text{s}^2 3\text{p}^5$ (viết gọn: $[\text{Ne}] 3\text{s}^2 3\text{p}^5$).
- Chlorine là phi kim vì lớp ngoài cùng (lớp 3) có $2 + 5 = 7$ electron. Nguyên tử có xu hướng dễ nhận thêm 1 electron để đạt cấu hình bền vững của khí hiếm.

**Câu 10:** Nguyên tố calcium giúp cho xương chắc khoẻ. Cấu hình electron lớp ngoài cùng của nguyên tử calcium là $4\text{s}^2$. Hãy viết cấu hình electron đầy đủ của calcium và cho biết calcium là kim loại, phi kim hay khí hiếm.
$\rightarrow$
- Cấu hình electron đầy đủ của Ca: $1\text{s}^2 2\text{s}^2 2\text{p}^6 3\text{s}^2 3\text{p}^6 4\text{s}^2$ (viết gọn: $[\text{Ar}] 4\text{s}^2$, $Z = 20$).
- Calcium là **kim loại** vì lớp ngoài cùng (lớp 4) có 2 electron ($4\text{s}^2$), nguyên tử dễ nhường 2 electron này trong các phản ứng hoá học.

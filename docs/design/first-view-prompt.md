# Prompt cho Claude Code — First View (Home) PC + SP + Hamburger menu

Cập nhật phần First View của trang Home theo phương án **1c "Learn → Test → Fix"**. File thiết kế tham chiếu: `First View Options.dc.html` (PC: `#1c`, SP: `#2a`, menu: `#2b`).

Mọi màu, font, bo góc và đổ bóng lấy từ token của design system Organic (`var(--color-*)`, `--font-heading` = Caprasimo, `--font-body` = Figtree, `--shadow-sm/md/lg`). Dùng các class `.btn .btn-primary .btn-ghost .btn-secondary .btn-block` và `.tag .tag-accent .tag-accent-2`. Icon: Lucide, stroke-width 2.75. Không hard-code hex.

## Mục tiêu
Người dùng hiểu ngay phương pháp học: học bằng mindmap → luyện đề giống đề thi thật → bù phần thiếu. Chỉ số readiness ở giữa vòng lặp cho thấy khả năng pass.

---

## 1. PC (≥ 1024px)

Bố cục grid 2 cột: `minmax(0,1fr) 600px`, gap 40px, align-items center, padding 56px.

**Cột trái (gap 24px):**
- Tag `.tag.tag-accent-2`: "ISTQB® CTFL · Syllabus v4.0.1"
- H1 (Caprasimo, 54px, line-height 1.08, `text-wrap: pretty`): "Learn. Test. Fix the gaps. Repeat until you pass."
- Đoạn mô tả (18px, `--color-neutral-800`): "Each round makes your map more complete and your readiness score climb. When it stays above 65%, you are ready to book the exam."
- **Chỉ một nút** `.btn.btn-primary` (16px, padding 12px 22px): **"Open Mindmap now"**, link tới trang Mindmap.
- Đã bỏ nút phụ "See a sample dashboard".

**Cột phải: hình vòng lặp (600 × 540, position relative)**
- Vòng tròn nét đứt SVG: tâm (300,270), r = 200, stroke `--color-neutral-400`, width 3, dasharray "4 10", round cap.
- 3 mũi tên tam giác (`--color-neutral-600`) chạy theo chiều kim đồng hồ: Learn → Test → Fix → Learn. Mũi tên bên trái chĩa thẳng lên (Fix gaps → Learn).
- Vòng tròn ở tâm, 200px, nền `--color-accent-2-200`:
  - "Readiness" (12px, bold, `--color-accent-2-900`)
  - 4 cột tăng dần (rộng 14px, cao 22/32/44/56px, pill; màu accent-2-400, 400, 500, 700)
  - "48 → 71%" (Caprasimo 30px)
  - "over 4 rounds" (11px)
- 3 thẻ `--color-surface`, bo góc 28px, padding 16px, `--shadow-md`. Mỗi thẻ có badge số tròn 30px + tiêu đề Caprasimo 18px:
  1. **Learn** (trên cùng, giữa, rộng 200px): badge màu accent; 6 chấm tròn 18px (4 chấm sage-500 = đã học, 2 chấm neutral-300 = chưa học); dòng chú thích "Mindmap: 4 of 6 chapters studied".
  2. **Test** (dưới phải, rộng 210px, bottom 40px): badge màu accent; "Mock exam · 40 Q · 60 min"; điểm "27/40" (Caprasimo 26px, `--color-accent-800`) + `.tag.tag-accent-2` "Pass".
  3. **Fix gaps** (dưới trái, rộng 210px, bottom 40px): badge màu sage-500; "Missed most in:"; 2 tag `.tag.tag-accent` là "Ch 4 · Test design" và "Ch 5 · Risk".

---

## 2. SP (< 768px, thiết kế ở 390 × 844)

Cột dọc, nền `--color-bg`.

**Header** (padding 8px 20px, flex space-between):
- Logo: hình tròn 32px nền accent, chữ "T" Caprasimo + tên "Testpath" (Caprasimo 19px).
- Nút hamburger `.btn.btn-ghost` 44 × 44 (vùng chạm tối thiểu 44px), icon Lucide `menu` 22px. Bấm vào thì mở menu (mục 3).

**Nội dung** (padding 14px 20px 0, gap 14px):
- Tag `.tag.tag-accent-2` (12px): "ISTQB® CTFL · v4.0.1"
- H1 Caprasimo **32px**, line-height 1.1: "Learn. Test. Fix the gaps. Repeat until you pass."
- **Bỏ đoạn mô tả** trên SP. Không hiển thị câu "Each round fills in your map…".

**Hình vòng lặp thu nhỏ** (350 × 350, căn giữa, `margin-top: 4px`, dịch xuống 40px bằng `position: relative; top: 40px`):
- Vòng nét đứt: tâm (175,180), r = 128, dasharray "4 9".
- Vòng tròn ở tâm 132px: "Readiness" 11px, 4 cột rộng 9px (cao 12/18/26/34px), "48 → 71%" Caprasimo 20px. Bỏ dòng "over 4 rounds".
- Các thẻ bo góc 22px, padding 11px 12px, badge 24px, tiêu đề Caprasimo 16px, chữ phụ 11.5px:
  - Learn: trên cùng giữa, rộng 150px; 6 chấm 14px; "Mindmap · 4/6 chapters".
  - Test: dưới phải, rộng 140px; "40 Q · 60 min"; "27/40" (20px) + tag "Pass" (10.5px).
  - Fix gaps: dưới trái, rộng 140px; tag "Ch 4 · Design" (rút gọn, `white-space: nowrap`) và "Ch 5 · Risk".

**CTA** (đặt cuối màn hình bằng `margin-top: auto`, padding 8px 20px, margin-bottom 24px):
- **Chỉ một nút** `.btn.btn-primary.btn-block`, min-height 48px, 16px: **"Open Mindmap now"**.
- Đã bỏ nút "See a sample dashboard".

---

## 3. Hamburger menu (SP)

Menu phủ toàn màn hình (overlay full-screen), nền `--color-bg`. Khi mở thì khóa scroll của body.

- **Trang trí**: 2 hình tròn mềm, nằm sau nội dung, không nhận click (pointer-events none):
  - 300px, nền `--color-accent-2-200`, right −90px, bottom −60px
  - 120px, nền `--color-accent-200`, left −60px, bottom 150px
- **Header** giữ nguyên vị trí logo. Nút hamburger đổi thành nút đóng `.btn.btn-secondary` 44 × 44, icon Lucide `x`, aria-label "Close menu".
- **Danh sách điều hướng** (`<nav>`, padding 24px 20px 0, gap 6px). Mỗi mục là một pill (`border-radius: 999px`), min-height 60px, padding 0 20px, chữ Caprasimo 24px:
  - **Trang hiện tại** (vd. Home): nền `--color-accent-200`, chữ `--color-accent-900`, bên phải có chấm tròn 10px màu accent.
  - Các mục khác: nền trong suốt, hover `--color-neutral-200`, bên phải có icon Lucide `chevron-right` 20px màu `--color-neutral-600`.
  - Thứ tự: Home, Mindmap, Practice tests, Dashboard, AI Coach. Mục AI Coach có `.tag.tag-accent` "PRO" (10px).
  - Lấy danh sách route từ cấu hình điều hướng có sẵn trong app nếu có. Danh sách trên là bản đề xuất.
- **Thẻ đăng nhập ở đáy** (margin-top auto, padding 0 20px 32px): thẻ `--color-surface`, bo góc 28px, padding 18px, `--shadow-sm`, gap 12px.
  - Text 14px `--color-neutral-800`: "Sign in with Gmail to save every attempt and see your readiness."
  - Nút `.btn.btn-primary.btn-block`, min-height 48px: "Sign in with Gmail".
  - Ẩn thẻ này khi người dùng đã đăng nhập.
- **Hành vi**: bấm một mục thì điều hướng và đóng menu. Nút ✕ hoặc phím Esc cũng đóng menu. Khi mở, focus chuyển vào menu; khi đóng, focus trả về nút hamburger. Nút hamburger có `aria-expanded` và `aria-controls`.

---

## Dữ liệu
Các số liệu trong hình vòng lặp (4/6 chapters, 27/40, 48 → 71%, Ch 4 / Ch 5) là **minh họa tĩnh** cho người dùng chưa đăng nhập. Không gắn dữ liệu thật vào First View ở bước này.

## Kiểm tra
- PC 1280px và SP 390 × 844: không có chữ bị tràn, các thẻ trong vòng lặp không chồng lên nhau, nút CTA không đè lên home indicator.
- Mọi vùng chạm trên SP ≥ 44px.
- Focus ring dùng `:focus-visible` theo design system (outline 2px accent).

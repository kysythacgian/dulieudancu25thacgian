# 90 Ngày Đêm – Khai báo dữ liệu dân cư (Cloudflare Workers)

## Cấu trúc
- `public/` – giao diện (index.html, _headers bảo mật)
- `src/worker.js` – API `/api/submit`
- `wrangler.jsonc` – cấu hình Cloudflare
- `code.gs` – dán vào Google Apps Script (không chứa khóa bí mật)

## Cài đặt
1. **Google Sheet** > Extensions > Apps Script: dán `code.gs`. Project Settings > Script properties: thêm `API_KEY` = chuỗi ngẫu nhiên dài.
2. Deploy > New deployment > Web app (Execute as: Me; Who has access: Anyone). Sao chép URL.
3. Đưa thư mục này lên **GitHub** (nên để repo **Private**).
4. Cloudflare > Workers & Pages > Create > Import a repository > chọn repo > Deploy.
5. Worker > Settings > Variables and Secrets > thêm **Secret**:
   - `APPS_SCRIPT_URL` = URL ở bước 2
   - `APPS_SCRIPT_API_KEY` = đúng chuỗi `API_KEY` ở bước 1
6. Chia sẻ Google Sheet chỉ cho CSKV.

## Khuyến nghị thêm
- Cloudflare > Security > WAF > Rate limiting: giới hạn `/api/submit` (ví dụ 10 lượt/phút/IP).
- Không bao giờ commit khóa/URL Apps Script vào GitHub.

## Cấu trúc Google Sheet (theo mẫu "Thống kê giấy tờ đã tích hợp VNeID mức 2")
Tự tạo sheet `ThongKeVNeID` ở lần gửi đầu tiên (mỗi thành viên 1 dòng):
Thời gian | Tổ dân phố số | Hộ Ông (Bà) | Địa chỉ | SĐT | STT | Họ tên thành viên | Quan hệ với chủ hộ | Chưa cấp Căn cước | Đã cấp CC chưa đăng ký VNeID mức 2 | cột 1–12 (loại giấy tờ).
- Dấu ✓ = có. Sheet `ChuThich` ghi rõ cột 1–12 là giấy tờ nào.
- **Khi cập nhật code.gs:** dán code mới, rồi Deploy > Manage deployments > Edit > New version. Nếu sheet cũ `DuLieuDanCu` còn đó thì cứ để, dữ liệu mới ghi vào sheet mới.

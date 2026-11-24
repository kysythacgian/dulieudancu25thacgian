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

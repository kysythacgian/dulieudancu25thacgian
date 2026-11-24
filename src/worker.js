// Cloudflare Worker: nhận khai báo từ web và chuyển sang Google Apps Script.
// Khóa bí mật (APPS_SCRIPT_URL, APPS_SCRIPT_API_KEY) lưu ở Cloudflare Secrets, KHÔNG để trong GitHub.
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== '/api/submit') return env.ASSETS.fetch(req);
    if (req.method !== 'POST') return json({ success: false, message: 'Phương thức không được hỗ trợ' }, 405);

    // Chỉ nhận từ chính trang web này
    const origin = req.headers.get('Origin');
    if (origin && origin !== url.origin) return json({ success: false, message: 'Không được phép' }, 403);
    if (!(req.headers.get('Content-Type') || '').includes('application/json')) return json({ success: false, message: 'Dữ liệu không hợp lệ' }, 415);

    if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_API_KEY) {
      console.error('Thiếu secret APPS_SCRIPT_URL / APPS_SCRIPT_API_KEY');
      return json({ success: false, message: 'Hệ thống chưa được cấu hình' }, 500);
    }

    try {
      const raw = await req.text();
      if (raw.length > 30000) return json({ success: false, message: 'Dữ liệu quá lớn' }, 413);
      const b = JSON.parse(raw);
      if (b.website) return json({ success: true }); // bẫy bot

      const phone = clean(b.phone, 20).replace(/[\s.\-]/g, '');
      const payload = {
        headOfHousehold: clean(b.headOfHousehold, 80),
        phone,
        address: clean(b.address, 200),
        members: (Array.isArray(b.members) ? b.members : []).slice(0, 20).map(m => ({
          name: clean(m?.name, 80),
          documents: (Array.isArray(m?.documents) ? m.documents : []).slice(0, 20).map(d => clean(d, 120)),
        })).filter(m => m.name),
      };
      if (!payload.headOfHousehold || !payload.address || !/^(0|\+84)\d{9,10}$/.test(phone)) {
        return json({ success: false, message: 'Thông tin chưa hợp lệ, vui lòng kiểm tra lại' }, 400);
      }

      const r = await fetch(env.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...payload, apiKey: env.APPS_SCRIPT_API_KEY }),
        redirect: 'follow',
      });
      let result = null;
      try { result = await r.json(); } catch {}
      if (!r.ok || !result || result.success !== true) {
        console.error('Apps Script lỗi', r.status, result);
        return json({ success: false, message: 'Không ghi được dữ liệu, vui lòng thử lại sau' }, 502);
      }
      return json({ success: true, message: 'Gửi khai báo thành công' });
    } catch (err) {
      console.error('Worker error', err);
      return json({ success: false, message: 'Lỗi máy chủ, vui lòng thử lại' }, 500);
    }
  },
};

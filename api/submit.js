// api/submit.js — Vercel Serverless Function
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Phương thức không được hỗ trợ' });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;
  if (!appsScriptUrl || !apiKey) {
    console.error('Thiếu biến môi trường APPS_SCRIPT_URL / APPS_SCRIPT_API_KEY');
    return res.status(500).json({ success: false, message: 'Hệ thống chưa được cấu hình' });
  }

  try {
    const b = req.body || {};
    if (b.website) return res.status(200).json({ success: true }); // bẫy bot

    const phone = clean(b.phone, 20).replace(/[\s.\-]/g, '');
    const payload = {
      headOfHousehold: clean(b.headOfHousehold, 80),
      phone,
      address: clean(b.address, 200),
      members: (Array.isArray(b.members) ? b.members : []).slice(0, 20).map(m => ({
        name: clean(m?.name, 80),
        documents: (Array.isArray(m?.documents) ? m.documents : []).slice(0, 20).map(d => clean(d, 60)),
      })).filter(m => m.name),
    };

    if (!payload.headOfHousehold || !payload.address || !/^(0|\+84)\d{9,10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Thông tin chưa hợp lệ, vui lòng kiểm tra lại' });
    }

    const r = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, apiKey }),
      redirect: 'follow',
    });

    let result;
    try { result = await r.json(); } catch { result = null; }

    // Apps Script có thể trả HTTP 200 kèm success:false, nên phải kiểm tra cả hai
    if (!r.ok || !result || result.success !== true) {
      console.error('Apps Script lỗi:', r.status, result);
      return res.status(502).json({ success: false, message: 'Không ghi được dữ liệu, vui lòng thử lại sau' });
    }
    return res.status(200).json({ success: true, message: 'Gửi khai báo thành công' });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

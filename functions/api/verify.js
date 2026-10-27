export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, code } = await request.json();

    if (!email || !code) {
      return new Response(JSON.stringify({ success: false, error: 'البيانات غير مكتملة' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const record = await env.DB.prepare(
      "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1"
    ).bind(email, code).first();

    if (!record) {
      return new Response(JSON.stringify({ success: false, error: 'رمز التحقق غير صحيح أو انتهت صلاحيته' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare("UPDATE users SET is_verified = 1 WHERE email = ?").bind(email).run();
    await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email).run();

    return new Response(JSON.stringify({ success: true, message: 'تم تفعيل الحساب بنجاح' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

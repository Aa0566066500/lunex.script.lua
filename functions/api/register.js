async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'جميع الحقول مطلوبة' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const existing = await env.DB.prepare("SELECT * FROM users WHERE email = ? OR username = ?").bind(email, username).first();
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: 'البريد أو اسم المستخدم مستخدم مسبقاً' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7);
    const password_hash = await hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await env.DB.prepare(
      "INSERT INTO users (id, username, email, password_hash, is_verified) VALUES (?, ?, ?, ?, 0)"
    ).bind(userId, username, email, password_hash).run();

    await env.DB.prepare(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, datetime('now', '+10 minutes'))"
    ).bind(email, verificationCode).run();

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lunex Scripts <lunex.script@gmail.com>',
        to: [email],
        subject: 'رمز التحقق الخاص بك - Lunex Scripts',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 25px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #818cf8; margin-top: 0;">مرحباً ${username} في Lunex Scripts</h2>
            <p>رمز التحقق الخاص بك هو:</p>
            <div style="background: #1e293b; color: #34d399; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              ${verificationCode}
            </div>
            <p style="color: #94a3b8; font-size: 13px;">هذا الرمز صالح لمدة 10 دقائق فقط.</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ success: false, error: 'فشل إرسال البريد الإلكتروني عبر Resend' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'تم إرسال رمز التحقق بنجاح' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

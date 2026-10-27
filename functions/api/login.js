async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'البريد وكلمة المرور مطلوبان' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const password_hash = await hashPassword(password);
    const user = await env.DB.prepare(
      "SELECT * FROM users WHERE email = ? AND password_hash = ?"
    ).bind(email, password_hash).first();

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'البريد أو كلمة المرور غير صحيحة' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!user.is_verified) {
      return new Response(JSON.stringify({ success: false, error: 'الحساب غير مفعل. يرجى التحقق من بريدك' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    // إنشاء جلسة عبر الكوكيز
    const userData = JSON.stringify({ id: user.id, username: user.username, email: user.email });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'تم تسجيل الدخول بنجاح', 
      user: { id: user.id, username: user.username, email: user.email } 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `lunex_session=${encodeURIComponent(userData)}; Path=/; Secure; SameSite=Lax; Max-Age=86400`
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

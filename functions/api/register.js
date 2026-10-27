export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'جميع الحقول مطلوبة' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // توليد رمز تحقق من 6 أرقام
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // إرسال البريد الإلكتروني عبر Resend API باستخدام المفتاح السري المخفي في Cloudflare
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
            <p>شكراً لتسجيلك معنا. رمز التحقق الخاص بك هو:</p>
            <div style="background: #1e293b; color: #34d399; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              ${verificationCode}
            </div>
            <p style="color: #94a3b8; font-size: 13px;">هذا الرمز صالح لمدة 10 دقائق فقط. لا تقم بمشاركته مع أي شخص.</p>
          </div>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ success: false, error: resendData }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ملاحظة: هنا يتم تخزين بيانات المستخدم ورمز التحقق في قاعدة بيانات Cloudflare D1 لاحقاً

    return new Response(JSON.stringify({ success: true, message: 'تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

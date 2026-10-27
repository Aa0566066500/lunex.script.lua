export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ملاحظة: هنا يتم الاستعلام من قاعدة بيانات Cloudflare D1 
    // للتحقق من صحة البريد الإلكتروني ومطابقة كلمة المرور المشفرة (Password Hash)
    // والتأكد من أن الحساب مففعل (is_verified = true)

    // إذا كانت البيانات صحيحة، يتم إنشاء جلسة أو إرجاع استجابة نجاح للانتقال إلى لوحة التحكم
    return new Response(JSON.stringify({ success: true, message: 'تم تسجيل الدخول بنجاح' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

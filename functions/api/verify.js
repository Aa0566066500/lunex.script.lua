export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, code } = await request.json();

    if (!email || !code) {
      return new Response(JSON.stringify({ success: false, error: 'البريد ورمز التحقق مطلوبان' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // هنا يتم مطابقة الكود مع المخزن في قاعدة بيانات D1 أو KV
    // إذا كان صحيحاً يتم تحديث حالة الحساب إلى is_verified = true

    return new Response(JSON.stringify({ success: true, message: 'تم تفعيل الحساب بنجاح' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

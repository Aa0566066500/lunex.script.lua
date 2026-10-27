export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { userId, title, source_code } = await request.json();

    if (!userId || !title || !source_code) {
      return new Response(JSON.stringify({ success: false, error: 'جميع حقول السكريبت مطلوبة' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const scriptId = 'scr_' + Date.now();
    const secret_token = 'tok_' + Math.random().toString(36).substring(2, 15);
    const short_code = Math.random().toString(36).substring(2, 8);

    await env.DB.prepare(
      "INSERT INTO scripts (id, user_id, title, source_code, secret_token, short_code) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(scriptId, userId, title, source_code, secret_token, short_code).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'تم إنشاء السكريبت وحمايته بنجاح',
      execution_link: `https://lunes.script/api/script?token=${secret_token}`,
      short_url: `https://lunes.script/s/${short_code}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

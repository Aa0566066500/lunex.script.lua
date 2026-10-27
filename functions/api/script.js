export async function onRequestGet(context) {
  const { request, env } = context;
  const userAgent = request.headers.get('User-Agent') || '';
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // التحقق إذا كان الطلب قادماً من متصفح عادي (Chrome, Safari...) لمحاولة سحب السورس
  const isBrowser = /Mozilla|AppleWebKit|Chrome|Safari|Edge|Firefox/.test(userAgent);

  if (isBrowser) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ليس لديك صلاحية للوصول</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>body { font-family: 'Cairo', sans-serif; }</style>
      </head>
      <body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
              <div class="text-indigo-400 font-bold text-xl tracking-wider mb-6">lunes<span class="text-white">.script</span></div>
              <div class="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-2xl font-bold">✕</div>
              <h1 class="text-xl font-bold text-slate-100 mb-2">ليس لديك صلاحية للوصول</h1>
              <p class="text-slate-400 text-sm mb-6">هذا الرابط يعمل وقت التنفيذ فقط داخل المشغل (Executor) ولا يمكن عرضه عبر المتصفح.</p>
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 mb-4">
                  <span id="shortUrlText" class="text-xs text-slate-300 font-mono">https://lunes.script/s/protected</span>
                  <button onclick="navigator.clipboard.writeText('https://lunes.script/s/protected')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-medium transition cursor-pointer shrink-0">نسخ الرابط</button>
              </div>
          </div>
      </body>
      </html>
    `, {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // إذا كان الطلب قادماً من المشغل وقت التنفيذ فقط (Executor)
  // هنا يتم جلب السورس الحقيقي المرتبط بالتوكن من قاعدة البيانات D1
  const sourceCode = `print("مرحباً بك في Lunes Script المحمي بنجاح!")`;

  return new Response(sourceCode, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

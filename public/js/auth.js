document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // تخزين مؤقت للبريد الإلكتروني أثناء مرحلة التحقق
    let pendingEmail = '';

    // 1. معالجة إنشاء الحساب وإرسال رمز التحقق عبر Resend
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = registerForm.querySelector('input[placeholder="Username"]').value;
            const email = registerForm.querySelector('input[placeholder="name@example.com"]').value;
            const password = registerForm.querySelector('input[placeholder="••••••••"]').value;
            const confirmPassword = registerForm.querySelectorAll('input[placeholder="••••••••"]')[1].value;

            if (password !== confirmPassword) {
                alert('كلمتا المرور غير متطابقتين!');
                return;
            }

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'جاري إرسال رمز التحقق...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    pendingEmail = email;
                    alert(data.message || 'تم إرسال رمز التحقق إلى بريدك الإلكتروني!');
                    showVerificationModal(email);
                } else {
                    alert(data.error || 'حدث خطأ أثناء التسجيل.');
                }
            } catch (err) {
                alert('تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
                console.error(err);
            } finally {
                submitBtn.textContent = 'إنشاء حساب وإرسال رمز التحقق';
                submitBtn.disabled = false;
            }
        });
    }

    // 2. معالجة تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginForm.querySelector('input[type="email"], input[type="email5"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'جاري تسجيل الدخول...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    window.location.href = '/dashboard.html';
                } else {
                    alert(data.error || 'بيانات الدخول غير صحيحة أو الحساب غير مفعل.');
                }
            } catch (err) {
                alert('حدث خطأ في الاتصال.');
                console.error(err);
            } finally {
                submitBtn.textContent = 'تسجيل الدخول';
                submitBtn.disabled = false;
            }
        });
    }
});

// 3. نافذة إدخال رمز التحقق المكون من 6 أرقام
function showVerificationModal(email) {
    const modalHtml = `
        <div id="verifyModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
                <h3 class="text-lg font-bold text-white mb-2">التحقق من البريد الإلكتروني</h3>
                <p class="text-slate-400 text-xs mb-6">أدخل رمز التحقق المكون من 6 أرقام المرسل إلى <span class="text-indigo-400">${email}</span></p>
                
                <input type="text" id="verifyCodeInput" maxlength="6" placeholder="123456" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-emerald-400 font-mono mb-6 focus:outline-none focus:border-indigo-500">
                
                <button onclick="submitVerificationCode('${email}')" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20">تفعيل الحساب</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 4. إرسال الرمز للتحقق والتفعيل
async function submitVerificationCode(email) {
    const code = document.getElementById('verifyCodeInput').value;

    if (!code || code.length !== 6) {
        alert('الرجاء إدخال رمز تحقق صحيح من 6 أرقام.');
        return;
    }

    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('تم تفعيل الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
            document.getElementById('verifyModal').remove();
            switchTab('login');
        } else {
            alert(data.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته.');
        }
    } catch (err) {
        alert('حدث خطأ أثناء التحقق.');
        console.error(err);
    }
}

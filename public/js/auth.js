    // 2. معالجة تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // استخدام محددات دقيقة لضمان جلب القيم حتى عند التعبئة التلقائية من المتصفح
            const emailInput = loginForm.querySelector('input[type="email"]') || loginForm.querySelector('input[name="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]') || loginForm.querySelector('input[name="password"]');

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                alert('الرجاء التأكد من إدخال البريد وكلمة المرور.');
                return;
            }

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
                    localStorage.setItem('lunex_user', JSON.stringify(data.user));
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

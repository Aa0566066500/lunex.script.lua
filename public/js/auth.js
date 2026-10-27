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
            
            // بدلاً من switchTab('login') التي تسبب المشكلة، 
            // إذا كنت تستخدم نظام تبويبات (Tabs)، قم بتفعيل زر أو تبويب تسجيل الدخول هنا مباشرة:
            const loginTabBtn = document.querySelector('[data-tab="login"]'); // عدل المطلع حسب الكود عندك إن وجد
            if (loginTabBtn) {
                loginTabBtn.click();
            } else {
                // أو إعادة تحميل الصفحة لتبدأ نظيفة على صفحة تسجيل الدخول
                window.location.reload();
            }
        } else {
            alert(data.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته.');
        }
    } catch (err) {
        alert('حدث خطأ أثناء التحقق.');
        console.error(err);
    }
}

                if (response.ok && data.success) {
                    // حفظ بيانات المستخدم محلياً لتأكيد الجلسة
                    localStorage.setItem('lunex_user', JSON.stringify(data.user));
                    window.location.href = '/dashboard.html';
                } else {
                    alert(data.error || 'بيانات الدخول غير صحيحة أو الحساب غير مفعل.');
                }

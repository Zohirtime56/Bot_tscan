// js/core/app.js

async function initApp() {
    const tg = window.Telegram.WebApp;
    
    // إخبار تليجرام أن البوت جاهز للعرض
    tg.ready();
    tg.expand();

    console.log("🚀 محاولة تسجيل الدخول عبر تليجرام...");

    try {
        // ننتظر دالة التحقق
        const user = await window.authenticateUser();

        if (user) {
            console.log("✅ تم التعرف على المستخدم:", user.username);
            
            // تحديث الواجهة
            if (window.updateUI) window.updateUI(user);
            
            // تشغيل محرك التعدين
            if (window.startMiningEngine) window.startMiningEngine(user);
            
            // إخفاء كلمة "تحميل..."
            const nameElem = document.getElementById('user-name');
            if (nameElem) nameElem.innerText = user.username;

        } else {
            // إذا فشل كل شيء حتى بعد الانتظار
            tg.showAlert("عذراً، لم نتمكن من جلب بياناتك من تليجرام. حاول إعادة فتح البوت.");
        }
    } catch (error) {
        console.error("💥 خطأ أثناء التشغيل:", error);
    }
}

// التأكد من تشغيل الكود بعد تحميل المتصفح للملفات
window.addEventListener('load', initApp);

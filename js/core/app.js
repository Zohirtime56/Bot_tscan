// js/core/app.js

/**
 * دالة التشغيل الرئيسية - المحرك الذي يربط كل الملفات ببعضها
 */
async function initApp() {
    console.log("🚀 جاري بدء تشغيل Zohir Mining Pro...");
    
    const tg = window.Telegram.WebApp;
    
    // إخبار تليجرام أن التطبيق جاهز وتوسيع الشاشة
    try {
        tg.ready();
        tg.expand();
    } catch (e) {
        console.warn("⚠️ فشل الاتصال بمكتبة Telegram WebApp");
    }

    try {
        // 1. فحص وجود الدالة قبل مناداتها (لتجنب الـ Crash)
        if (typeof window.authenticateUser !== 'function') {
            console.error("❌ دالة authenticateUser غير معرفة! تأكد من ترتيب الملفات في index.html");
            return;
        }

        // 2. محاولة تسجيل الدخول (ستستخدم حساب الطوارئ إذا فشل تليجرام)
        const user = await window.authenticateUser();

        if (user) {
            console.log("✅ الدخول ناجح للمستخدم:", user.username);

            // 3. تحديث الواجهة (UI)
            if (window.updateUI) {
                window.updateUI(user);
            } else {
                console.warn("⚠️ دالة updateUI غير موجودة");
            }

            // 4. بدء محرك التعدين (Mining Engine)
            if (window.startMiningEngine) {
                window.startMiningEngine(user);
            } else {
                console.warn("⚠️ دالة startMiningEngine غير موجودة");
            }

            // 5. تحميل بيانات المتجر مسبقاً ليكون جاهزاً
            if (window.loadShopItems) {
                window.loadShopItems();
            }

            // 6. تغيير اسم المستخدم في الواجهة وإخفاء كلمة "تحميل..."
            const nameElem = document.getElementById('user-name');
            if (nameElem) {
                nameElem.innerText = user.username || "Zohir User";
            }

        } else {
            // في حالة الفشل التام، لن نظهر Alert يغلق البوت، بل سنكتب في الكونسول
            console.error("❌ فشل جلب بيانات المستخدم نهائياً.");
        }

    } catch (error) {
        console.error("💥 خطأ كارثي في التشغيل:", error);
    }
}

// تشغيل التطبيق عند اكتمال تحميل الصفحة
if (document.readyState === 'complete') {
    initApp();
} else {
    window.addEventListener('load', initApp);
}

/**
 * وظيفة إضافية للتأكد من حفظ الرصيد عند إغلاق التطبيق
 */
window.addEventListener('beforeunload', () => {
    if (window.claimMining) {
        window.claimMining();
    }
});

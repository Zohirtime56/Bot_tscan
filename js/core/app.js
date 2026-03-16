// js/core/app.js

/**
 * الوظيفة الرئيسية لتشغيل التطبيق (Master Init)
 */
async function initApp() {
    const tg = window.Telegram.WebApp;
    
    // 1. إخبار تليجرام أن التطبيق جاهز وتوسيع الشاشة
    tg.ready();
    tg.expand();
    
    console.log("جاري بدء تشغيل Zohir Mining Pro...");

    try {
        // 2. التحقق من هوية المستخدم (من ملف auth.js)
        // ملاحظة: تأكد أن دالة authenticateUser موجودة في window
        const user = await window.authenticateUser();

        if (user) {
            // 3. تحديث الواجهة بالبيانات الأساسية (من ملف ui.js)
            window.updateUI(user);

            // 4. بدء محرك التعدين الحي (من ملف mining.js)
            window.startMiningEngine(user);

            // 5. إخفاء شاشة التحميل إذا كنت قد وضعت واحدة
            console.log("تم تحميل بيانات المستخدم وبدء التعدين بنجاح.");
            
            // تخصيص لون شريط الحالة في تليجرام ليتناسب مع التصميم
            tg.setHeaderColor('#000000'); 
            tg.setBackgroundColor('#000000');
        } else {
            tg.showAlert("فشل تسجيل الدخول. يرجى فتح البوت من تليجرام.");
        }
    } catch (error) {
        console.error("خطأ كارثي أثناء تشغيل التطبيق:", error);
    }
}

// تشغيل التطبيق فور تحميل الصفحة بالكامل
window.addEventListener('load', initApp);

// التعامل مع إغلاق التطبيق (اختياري: حفظ البيانات قبل الخروج)
window.addEventListener('beforeunload', () => {
    // يمكننا استدعاء claimMining هنا لضمان عدم ضياع أي ثانية تعدين
    if (typeof window.claimMining === 'function') {
        window.claimMining();
    }
});

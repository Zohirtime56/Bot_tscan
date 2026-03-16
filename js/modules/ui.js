// js/modules/ui.js

/**
 * دالة التبديل بين الصفحات مع جلب البيانات تلقائياً
 */
function switchPage(pageId) {
    // 1. إخفاء جميع الصفحات
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });

    // 2. إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.style.display = 'block';
        // إضافة تأخير بسيط للأنيميشن
        setTimeout(() => targetPage.classList.add('active'), 10);
    }

    // 3. تحديث شكل القائمة السفلية (الزر النشط)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        // التحقق من الزر الذي تم الضغط عليه
        if (item.getAttribute('onclick').includes(pageId)) {
            item.classList.add('active');
        }
    });

    // --- 🚀 الجزء الأهم: تشغيل الوظائف عند فتح الصفحات ---
    
    if (pageId === 'shop') {
        // استدعاء جلب الأجهزة من ملف shop.js
        if (typeof window.loadShopItems === 'function') {
            window.loadShopItems();
        }
    }
    
    if (pageId === 'tasks') {
        // سنبرمج جلب المهام لاحقاً
        console.log("جاري تحميل المهام...");
    }

    if (pageId === 'wallet') {
        // تحديث الرصيد عند فتح المحفظة للتأكد من دقته
        console.log("تحديث بيانات المحفظة...");
    }

    // إضافة تأثير اهتزاز بسيط (Haptic Feedback) عند التنقل
    if (window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

/**
 * تحديث نصوص الواجهة (الأسماء والأرصدة)
 */
function updateUI(userData) {
    if (!userData) return;

    // تحديث الاسم
    const nameElem = document.getElementById('user-name');
    if (nameElem) nameElem.innerText = userData.username || "مستخدم";

    // تحديث الأرصدة (ZTX)
    const ramElem = document.getElementById('ram-balance');
    const topRamElem = document.getElementById('top-ram');
    const topZElem = document.getElementById('top-z');

    if (ramElem) ramElem.innerText = (userData.ram_balance || 0).toFixed(8);
    if (topRamElem) topRamElem.innerText = (userData.ram_balance || 0).toFixed(2);
    if (topZElem) topZElem.innerText = (userData.z_balance || 0).toFixed(4);
    
    // تحديث شريط المستوى
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        let levelProgress = (userData.experience || 0) % 100;
        progressFill.style.width = `${levelProgress}%`;
    }
}

// جعل الدوال متاحة عالمياً
window.switchPage = switchPage;
window.updateUI = updateUI;

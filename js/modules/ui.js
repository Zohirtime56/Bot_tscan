// js/modules/ui.js

/**
 * دالة التبديل بين الصفحات مع جلب البيانات تلقائياً
 */
function switchPage(pageId) {
    // 1. إخفاء جميع الصفحات أولاً
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });

    // 2. إظهار الصفحة المطلوبة فقط
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.style.display = 'block';
        setTimeout(() => targetPage.classList.add('active'), 10);
    }

    // 3. تحديث شكل القائمة السفلية (تمكين الزر النشط)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(pageId)) {
            item.classList.add('active');
        }
    });

    // --- 🚀 تشغيل الوظائف الخاصة بكل صفحة (خارج حلقة الـ forEach) ---
    
    if (pageId === 'shop') {
        console.log("🛒 فتح المتجر، جاري جلب الأجهزة...");
        if (typeof window.loadShopItems === 'function') {
            window.loadShopItems();
        }
    }
    
    if (pageId === 'tasks') {
        console.log("📋 جاري تحميل المهام...");
    }

    if (pageId === 'wallet') {
        console.log("💰 تحديث بيانات المحفظة...");
    }

    // إضافة تأثير اهتزاز بسيط عند التنقل (اختياري)
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

    // استخدام أسماء الحقول الصحيحة ram_balance
    const balance = userData.ram_balance || 0;
    
    if (ramElem) ramElem.innerText = balance.toFixed(8);
    if (topRamElem) topRamElem.innerText = balance.toFixed(2);
    if (topZElem) topZElem.innerText = (userData.z_balance || 0).toFixed(4);
    
    // تحديث شريط المستوى
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        let levelProgress = (userData.experience || 0) % 100;
        progressFill.style.width = `${levelProgress}%`;
    }
}

// جعل الدوال متاحة عالمياً لملف app.js والـ HTML
window.switchPage = switchPage;
window.updateUI = updateUI;
    

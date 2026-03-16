// js/modules/ui.js

/**
 * دالة التبديل بين الصفحات
 * @param {string} pageId - اسم الصفحة المراد فتحها (home, shop, tasks, wallet)
 */
function switchPage(pageId) {
    // 1. إخفاء جميع الصفحات أولاً
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });

    // 2. إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.style.display = 'block';
        setTimeout(() => targetPage.classList.add('active'), 10);
    }

    // 3. تحديث شكل القائمة السفلية (Bottom Nav)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        // إذا كان نص الزر يحتوي على اسم الصفحة أو مرتبط بها
        if (item.getAttribute('onclick').includes(pageId)) {
            item.classList.add('active');
        }
    });

    // 4. إغلاق أي قوائم فرعية أو لوحات تنبيه إذا كانت مفتوحة
    console.log(`تم الانتقال إلى صفحة: ${pageId}`);
}

/**
 * تحديث البيانات في الواجهة (الرصيد، الاسم، إلخ)
 * @param {Object} userData - بيانات المستخدم من Supabase
 */
function updateUI(userData) {
    if (!userData) return;

    // تحديث النصوص الأساسية
    document.getElementById('user-name').innerText = userData.username || "مستخدم";
    document.getElementById('top-ram').innerText = userData.ram_balance.toFixed(2);
    document.getElementById('top-z').innerText = userData.z_balance.toFixed(4);
    document.getElementById('ram-balance').innerText = userData.ram_balance.toFixed(8);
    
    // تحديث شريط الخبرة (إذا وُجد)
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        // حساب النسبة المئوية (مثال: الخبرة الحالية / 1000)
        let progress = (userData.experience % 100); 
        progressFill.style.width = `${progress}%`;
    }
}

// تصدير الدوال لاستخدامها في app.js
window.switchPage = switchPage;
window.updateUI = updateUI;

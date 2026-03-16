// js/modules/mining.js

let miningInterval;
let currentZTX = 0;
let miningRate = 0; // الزيادة في الثانية الواحدة

/**
 * بدء محرك التعدين
 * @param {Object} user - بيانات المستخدم من الداتابيز
 */
function startMiningEngine(user) {
    currentZTX = user.ram_balance; // الرصيد المخزن في الداتابيز (سنسميه ZTX برمجياً)
    miningRate = user.mining_rate; // السرعة لكل ثانية

    // 1. حساب الأرباح أثناء الغياب (Offline Earnings)
    calculateOfflineEarnings(user.last_claim_time);

    // 2. بدء العداد الحي (Visual Counter)
    if (miningInterval) clearInterval(miningInterval);
    
    miningInterval = setInterval(() => {
        currentZTX += miningRate;
        updateMiningDisplay();
    }, 1000);
}

/**
 * حساب كم ربح المستخدم منذ آخر "تجميع" حتى الآن
 */
function calculateOfflineEarnings(lastClaimTime) {
    const lastClaim = new Date(lastClaimTime);
    const now = new Date();
    
    // الفارق بالثواني
    const secondsElapsed = Math.floor((now - lastClaim) / 1000);
    
    if (secondsElapsed > 0) {
        const earned = secondsElapsed * miningRate;
        currentZTX += earned;
        console.log(`تم إضافة أرباح غياب: ${earned.toFixed(8)} ZTX`);
    }
}

/**
 * تحديث الأرقام في الواجهة
 */
function updateMiningDisplay() {
    const balanceElement = document.getElementById('ram-balance');
    const topBalanceElement = document.getElementById('top-ram');

    if (balanceElement) balanceElement.innerText = currentZTX.toFixed(8);
    if (topBalanceElement) topBalanceElement.innerText = currentZTX.toFixed(2);
}

/**
 * وظيفة تجميع الأرباح وحفظها في Supabase
 */
async function claimMining() {
    const tg = window.Telegram.WebApp;
    const userId = tg.initDataUnsafe.user.id;

    // تعطيل الزر مؤقتاً لمنع التكرار
    const claimBtn = document.querySelector('.claim-btn');
    claimBtn.disabled = true;

    const { error } = await window.supabaseClient
        .from('users')
        .update({ 
            ram_balance: currentZTX,
            last_claim_time: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error("خطأ في التجميع:", error);
        tg.showAlert("فشل تجميع الأرباح، حاول مجدداً");
    } else {
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert(`تم تجميع رصيدك بنجاح! رصيدك الحالي: ${currentZTX.toFixed(4)} ZTX`);
    }
    
    claimBtn.disabled = false;
}

// تصدير الدوال
window.startMiningEngine = startMiningEngine;
window.claimMining = claimMining;
  

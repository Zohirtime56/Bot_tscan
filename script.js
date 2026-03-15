let balance = 0.00000000;
const rate = 0.00000001; // مقدار الزيادة في الثانية

function updateBalance() {
    balance += rate;
    document.getElementById('balance').innerText = balance.toFixed(8);
}

// تحديث الرصيد كل ثانية
setInterval(updateBalance, 1000);

// تهيئة تطبيق تليجرام
const tg = window.Telegram.WebApp;
tg.expand(); // فتح التطبيق بكامل الشاشة
document.getElementById('user-name').innerText = `مرحباً ${tg.initDataUnsafe.user.first_name}`;


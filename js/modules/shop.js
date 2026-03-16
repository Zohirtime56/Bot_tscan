// js/modules/shop.js - النسخة النهائية لحل مشكلة CORS
async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;

    shopContainer.innerHTML = '<p style="text-align:center; color:#00ffcc;">جاري تجاوز حظر المتصفح وجلب الأجهزة...</p>';

    // استخدام البروكسي لتجاوز حظر CORS الظاهر في صورك
    const proxy = 'https://corsproxy.io/?'; 
    const targetUrl = 'https://ldvakoamwgplowlgyexqs.supabase.co/rest/v1/miners_shop?select=*';
    const finalUrl = proxy + encodeURIComponent(targetUrl);

    // مفتاح الأمان والرابط من صور إعداداتك الخاصة
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0';

    try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("السيرفر رفض الاتصال بالبيانات");

        const items = await response.json();

        if (!items || items.length === 0) {
            shopContainer.innerHTML = '<p style="text-align:center;">لا توجد بيانات في جدول miners_shop حالياً.</p>';
            return;
        }

        shopContainer.innerHTML = ''; 
        items.forEach(item => {
            shopContainer.innerHTML += `
                <div class="shop-card glass" style="margin:10px; padding:15px; border:1px solid #333; border-radius:12px; background:rgba(255,255,255,0.05);">
                    <h4 style="color:#00ffcc; margin:0;">${item.name}</h4>
                    <p style="font-size:12px; color:#888;">${item.description || ''}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <span style="color:#ffcc00; font-weight:bold;">${item.price_ram} ZTX</span>
                        <button onclick="buyMiner('${item.id}', ${item.price_ram}, ${item.power_boost})" 
                                style="background:#00ffcc; color:#000; border:none; padding:6px 12px; border-radius:6px; font-weight:bold; cursor:pointer;">
                            شراء
                        </button>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error("Shop Error:", err);
        shopContainer.innerHTML = `<p style="color:#ff4444; text-align:center;">عذراً، لا تزال هناك مشكلة: ${err.message}</p>`;
    }
}

// دالة الشراء (تأكد من وجودها)
async function buyMiner(itemId, price, boost) {
    const tg = window.Telegram.WebApp;
    if (window.currentZTX < price) {
        tg.showAlert("رصيدك غير كافٍ!");
        return;
    }
    tg.showAlert("تم إرسال طلب الشراء، جاري المعالجة...");
    // هنا يمكنك إضافة كود التحديث لجدول المستخدمين لاحقاً
}

window.loadShopItems = loadShopItems;
window.buyMiner = buyMiner;
    

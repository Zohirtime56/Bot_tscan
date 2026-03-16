// js/modules/shop.js
async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;

    shopContainer.innerHTML = '<p style="text-align:center; color:cyan;">📡 جاري المحاولة الأخيرة للاتصال...</p>';

    // الرابط والمفتاح من لقطات الشاشة الخاصة بك
    const url = 'https://ldvakoamwgplowlgyexqs.supabase.co/rest/v1/miners_shop?select=*';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`السيرفر رفض الطلب: ${response.status} - ${errorBody}`);
        }

        const items = await response.json();
        if (items.length === 0) {
            shopContainer.innerHTML = 'الجدول فارغ في Supabase!';
            return;
        }

        shopContainer.innerHTML = ''; 
        items.forEach(item => {
            shopContainer.innerHTML += `
                <div class="shop-card glass" style="border:1px solid #333; padding:15px; margin-bottom:10px; border-radius:12px;">
                    <h4 style="color:#00ffcc; margin:0;">${item.name}</h4>
                    <p style="color:#ffcc00;">السعر: ${item.price_ram} ZTX</p>
                    <button onclick="buyMiner('${item.id}', ${item.price_ram}, ${item.power_boost})" 
                            style="width:100%; background:#00ffcc; color:#000; font-weight:bold; border:none; padding:8px; border-radius:5px;">
                        شراء الجهاز
                    </button>
                </div>`;
        });

    } catch (err) {
        // إذا فشل، ستعرف السبب هنا بدقة
        let hint = "تأكد من اتصال الإنترنت أو إعدادات CORS";
        if (err.message.includes("Failed to fetch")) hint = "المتصفح يحظر الطلب (CORS)";
        
        shopContainer.innerHTML = `
            <div style="color:#ff4444; font-size:12px; text-align:center; padding:10px;">
                ⚠️ خطأ تقني: ${err.message}<br>
                <small style="color:#888;">نصيحة: ${hint}</small>
            </div>`;
    }
}
window.loadShopItems = loadShopItems;

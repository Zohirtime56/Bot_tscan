// js/modules/shop.js المحاولة النهائية

async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;

    shopContainer.innerHTML = '<p style="text-align:center;">جاري كسر حظر CORS والتحميل...</p>';

    // استخدمنا وسيط (CORS Anywhere) لتجاوز حظر المتصفح تماماً
    const proxy = 'https://corsproxy.io/?'; 
    const targetUrl = 'https://ldvakoamwgplowlgyexqs.supabase.co/rest/v1/miners_shop?select=*';
    const finalUrl = proxy + encodeURIComponent(targetUrl);

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

        if (!response.ok) throw new Error("السيرفر رفض الاتصال");

        const items = await response.json();

        shopContainer.innerHTML = ''; 
        items.forEach(item => {
            shopContainer.innerHTML += `
                <div class="shop-card glass" style="margin:10px; padding:15px; border:1px solid #00ffcc; border-radius:10px;">
                    <h3 style="color:#00ffcc; margin:0;">${item.name}</h3>
                    <p style="color:#ffcc00; font-weight:bold;">${item.price_ram} ZTX</p>
                    <button onclick="buyMiner('${item.id}', ${item.price_ram}, ${item.power_boost})" 
                            style="width:100%; background:#00ffcc; border:none; padding:10px; border-radius:5px; font-weight:bold;">
                        شراء الآن
                    </button>
                </div>`;
        });

    } catch (err) {
        shopContainer.innerHTML = `<p style="color:red;">فشلت كل المحاولات: ${err.message}</p>`;
    }
}
window.loadShopItems = loadShopItems;

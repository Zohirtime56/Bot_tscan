// js/modules/shop.js

async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;

    shopContainer.innerHTML = '<p style="text-align:center;">جاري البحث عن الأجهزة...</p>';

    try {
        // جلب البيانات من الجدول الظاهر في صورتك
        const { data: items, error } = await window.supabaseClient
            .from('miners_shop')
            .select('*');

        if (error) throw error;

        if (!items || items.length === 0) {
            shopContainer.innerHTML = '<p style="text-align:center;">قاعدة البيانات فارغة!</p>';
            return;
        }

        shopContainer.innerHTML = ''; // مسح رسالة التحميل

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-card glass';
            card.innerHTML = `
                <div style="padding: 15px; border: 1px solid #333; border-radius: 12px; margin-bottom: 10px; background: rgba(255,255,255,0.05);">
                    <h4 style="color: #00ffcc; margin: 0;">${item.name}</h4>
                    <p style="font-size: 12px; color: #888;">${item.description || 'جهاز تعدين احترافي'}</p>
                    <div style="margin: 10px 0; color: #ffcc00;">
                        🚀 قوة التعدين: +${item.power_boost}
                    </div>
                    <button onclick="buyMiner('${item.id}', ${item.price_ram}, ${item.power_boost})" 
                            style="width: 100%; background: #00ffcc; color: black; border: none; padding: 10px; border-radius: 8px; font-weight: bold;">
                        شراء بـ ${item.price_ram} ZTX
                    </button>
                </div>
            `;
            shopContainer.appendChild(card);
        });
        console.log("✅ تم عرض الأجهزة بنجاح");
    } catch (err) {
        console.error("خطأ في المتجر:", err);
        shopContainer.innerHTML = '<p style="color:red; text-align:center;">تعذر الاتصال بقاعدة البيانات</p>';
    }
}

window.loadShopItems = loadShopItems;

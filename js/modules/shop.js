// js/modules/shop.js

async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;

    // إظهار رسالة تحميل بسيطة
    shopContainer.innerHTML = '<p style="text-align:center; color: #888;">جاري فحص المستودع...</p>';

    try {
        // تأكد من أن الجدول اسمه miners_shop كما في صورتك
        const { data: items, error } = await window.supabaseClient
            .from('miners_shop')
            .select('*');

        if (error) throw error;

        if (!items || items.length === 0) {
            shopContainer.innerHTML = '<p style="text-align:center;">المتجر فارغ حالياً!</p>';
            return;
        }

        shopContainer.innerHTML = ''; // تنظيف الحاوية

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-card glass';
            card.style = "border: 1px solid #333; padding: 15px; margin-bottom: 15px; border-radius: 15px; background: #1a1a1a;";
            card.innerHTML = `
                <h4 style="color: #00ffcc; margin-top: 0;">${item.name}</h4>
                <p style="font-size: 0.85rem; color: #bbb;">${item.description || 'جهاز تعدين قوي'}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <span style="color: #ffcc00; font-weight: bold;">💰 ${item.price_ram} ZTX</span>
                    <button onclick="buyMiner('${item.id}', ${item.price_ram}, ${item.power_boost})" 
                            style="background: #00ffcc; color: #000; border: none; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                        شراء
                    </button>
                </div>
            `;
            shopContainer.appendChild(card);
        });

    } catch (err) {
        console.error("Shop Load Error:", err);
        // هذه هي الرسالة التي تظهر لك في الصورة، سنغيرها لنعرف السبب
        shopContainer.innerHTML = `<p style="color:red; text-align:center;">خطأ في الوصول للجداول: ${err.message}</p>`;
    }
}

// جعلها متاحة للملفات الأخرى
window.loadShopItems = loadShopItems;
                                                              

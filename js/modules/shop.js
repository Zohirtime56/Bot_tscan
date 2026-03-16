// js/modules/shop.js

/**
 * جلب قائمة الأجهزة من Supabase وعرضها في المتجر
 */
async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;

    shopContainer.innerHTML = '<p class="loading">جاري جلب المعدات...</p>';

    const { data: items, error } = await window.supabaseClient
        .from('miners_shop')
        .select('*')
        .order('price_ram', { ascending: true });

    if (error) {
        console.error("خطأ في جلب المتجر:", error);
        return;
    }

    shopContainer.innerHTML = ''; // تنظيف الحاوية

    items.forEach(item => {
        const itemCard = `
            <div class="shop-card glass">
                <div class="item-image">
                    <img src="${item.image_url || 'assets/miners/default.png'}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div class="item-stats">
                        <span>🚀 +${item.power_boost} ZTX/s</span>
                    </div>
                    <button class="buy-btn" onclick="buyMiner('${item.id}', ${item.price_ram}, ${item.power_boost})">
                        شراء بـ ${item.price_ram} ZTX
                    </button>
                </div>
            </div>
        `;
        shopContainer.innerHTML += itemCard;
    });
}

/**
 * منطق شراء الجهاز
 */
async function buyMiner(itemId, price, boost) {
    const tg = window.Telegram.WebApp;
    const userId = tg.initDataUnsafe.user.id;

    // 1. التأكد من الرصيد الحالي للمستخدم (من خلال المتغير العالمي في mining.js)
    if (window.currentZTX < price) {
        tg.showAlert("رصيدك من ZTX غير كافٍ لشراء هذا الجهاز!");
        return;
    }

    tg.showConfirm(`هل أنت متأكد من شراء هذا الجهاز مقابل ${price} ZTX؟`, async (confirmed) => {
        if (confirmed) {
            // 2. تحديث البيانات في Supabase
            // خصم الرصيد + زيادة سرعة التعدين
            const { error } = await window.supabaseClient
                .from('users')
                .update({ 
                    ram_balance: window.currentZTX - price,
                    mining_rate: window.miningRate + boost,
                    last_claim_time: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                tg.showAlert("حدث خطأ أثناء عملية الشراء.");
            } else {
                tg.HapticFeedback.notificationOccurred('success');
                tg.showAlert("مبروك! تم تفعيل الجهاز وزيادة سرعة التعدين.");
                
                // تحديث المتغيرات المحلية لإظهار التأثير فوراً
                window.currentZTX -= price;
                window.miningRate += boost;
                
                // إعادة تحميل المتجر والواجهة
                loadShopItems();
                if (window.updateUI) window.updateUI({ ram_balance: window.currentZTX, z_balance: 0 }); // تحديث مبدئي
            }
        }
    });
}

// تصدير الدوال
window.loadShopItems = loadShopItems;
window.buyMiner = buyMiner;


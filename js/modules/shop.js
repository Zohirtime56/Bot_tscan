// js/modules/shop.js

/**
 * جلب قائمة الأجهزة من Supabase وعرضها في المتجر
 */
async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;

    shopContainer.innerHTML = '<p style="text-align:center;">جاري جلب الأجهزة...</p>';

    try {
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
            const itemCard = `
                <div class="shop-card glass">
                    <div class="item-image">
                        <img src="${item.image_url || 'assets/miners/default.png'}" alt="${item.name}" style="width:60px;">
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
    } catch (err) {
        console.error("خطأ في المتجر:", err.message);
        shopContainer.innerHTML = '<p style="color:red;">فشل تحميل المتجر. تأكد من جدول miners_shop</p>';
    }
}

/**
 * منطق شراء الجهاز
 */
async function buyMiner(itemId, price, boost) {
    const tg = window.Telegram.WebApp;
    // التأكد من وجود بيانات المستخدم
    const user = tg.initDataUnsafe?.user;
    if (!user) return;

    // 1. التأكد من الرصيد الحالي (نستخدم window.currentZTX المعرف في mining.js)
    if (window.currentZTX < price) {
        tg.showAlert("رصيدك من ZTX غير كافٍ لشراء هذا الجهاز!");
        return;
    }

    tg.showConfirm(`هل أنت متأكد من شراء ${price} ZTX؟`, async (confirmed) => {
        if (confirmed) {
            try {
                // 2. تحديث البيانات في Supabase
                const { error } = await window.supabaseClient
                    .from('users')
                    .update({ 
                        ram_balance: window.currentZTX - price,
                        mining_rate: window.miningRate + boost,
                        last_claim_time: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (error) throw error;

                // 3. نجاح العملية
                tg.HapticFeedback.notificationOccurred('success');
                tg.showAlert("مبروك! تم تفعيل الجهاز وزيادة السرعة.");
                
                // تحديث القيم محلياً فوراً
                window.currentZTX -= price;
                window.miningRate += boost;
                
                // تحديث الواجهة
                loadShopItems();
                if (window.updateUI) window.updateUI({ ram_balance: window.currentZTX });

            } catch (err) {
                console.error("خطأ شراء:", err);
                tg.showAlert("حدث خطأ أثناء الشراء، تأكد من اتصال الإنترنت.");
            }
        }
    });
}

// تصدير الدوال للخارج
window.loadShopItems = loadShopItems;
window.buyMiner = buyMiner;
                        

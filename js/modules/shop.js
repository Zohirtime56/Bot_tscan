// js/modules/shop.js

async function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) {
        console.error("❌ لم يتم العثور على حاوية المتجر (shop-items)");
        return;
    }

    shopContainer.innerHTML = '<div class="loading">جاري فحص المتجر...</div>';

    try {
        console.log("📡 محاولة جلب الأجهزة من جدول miners_shop...");
        
        const { data: items, error } = await window.supabaseClient
            .from('miners_shop')
            .select('*');

        if (error) {
            console.error("❌ خطأ من Supabase:", error.message);
            throw error;
        }

        console.log("✅ البيانات المستلمة:", items);

        if (!items || items.length === 0) {
            shopContainer.innerHTML = '<p style="text-align:center;">المتجر فارغ في قاعدة البيانات!</p>';
            return;
        }

        shopContainer.innerHTML = ''; // تنظيف الحاوية

        items.forEach(item => {
            const itemCard = `
                <div class="shop-card glass" style="border: 1px solid #333; padding: 15px; margin-bottom: 10px; border-radius: 12px; background: rgba(255,255,255,0.05);">
                    <div class="item-details">
                        <h4 style="color: #00ffcc; margin: 0;">${item.name}</h4>
                        <p style="font-size: 12px; color: #ccc;">${item.description || 'لا يوجد وصف'}</p>
                        <div class="item-stats" style="margin: 10px 0;">
                            <span style="color: #ffcc00;">🚀 زيادة: ${item.power_boost} ZTX/s</span>
                        </div>
                        <button class="buy-btn" 
                                onclick="buyMiner('${item.id}', ${item.price_ram}, ${item.power_boost})"
                                style="background: #00ffcc; color: #000; border: none; padding: 8px 15px; border-radius: 5px; width: 100%; font-weight: bold;">
                            شراء بـ ${item.price_ram} ZTX
                        </button>
                    </div>
                </div>
            `;
            shopContainer.innerHTML += itemCard;
        });

    } catch (err) {
        shopContainer.innerHTML = `<p style="color:red; text-align:center;">خطأ في التحميل: ${err.message}</p>`;
    }
}

async function buyMiner(itemId, price, boost) {
    const tg = window.Telegram.WebApp;
    const user = tg.initDataUnsafe?.user;

    if (!user) {
        tg.showAlert("يرجى فتح البوت من تليجرام للشراء");
        return;
    }

    // فحص الرصيد من المتغير العالمي
    if (window.currentZTX < price) {
        tg.showAlert("رصيدك الحالي غير كافٍ!");
        return;
    }

    tg.showConfirm(`تأكيد شراء الجهاز مقابل ${price} ZTX؟`, async (confirmed) => {
        if (confirmed) {
            try {
                const { error } = await window.supabaseClient
                    .from('users')
                    .update({ 
                        ram_balance: window.currentZTX - price,
                        mining_rate: (window.miningRate || 0.00000001) + boost
                    })
                    .eq('id', user.id);

                if (error) throw error;

                tg.showAlert("تمت عملية الشراء بنجاح! ستزيد سرعة التعدين الآن.");
                window.currentZTX -= price;
                if (window.updateUI) window.updateUI({ ram_balance: window.currentZTX });
                loadShopItems(); // تحديث القائمة
            } catch (e) {
                tg.showAlert("فشل الشراء: " + e.message);
            }
        }
    });
}

window.loadShopItems = loadShopItems;
window.buyMiner = buyMiner;

// shop.js - متجر التعدين لتطبيق Telegram Mini App

// تهيئة متغيرات Supabase من الإعدادات العامة
// تأكد من وجود هذه المتغيرات في ملف HTML الرئيسي
const SUPABASE_URL = window.SUPABASE_URL || 'https://ldvakoamwgplowlgyexqs.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0';

/**
 * دالة مساعدة لتنفيذ طلبات fetch إلى Supabase REST API
 */
async function supabaseFetch(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    
    const defaultHeaders = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

/**
 * جلب جميع الأجهزة من جدول miners_shop
 */
async function loadShop() {
    try {
        // إظهار حالة التحميل
        const container = document.getElementById('shop-container');
        if (container) {
            container.innerHTML = '<div class="loading">جاري تحميل المتجر...</div>';
        }

        // جلب البيانات من Supabase مع ترتيب حسب السعر
        const miners = await supabaseFetch('miners_shop?select=*&order=price_ram.asc');
        
        console.log('تم جلب البيانات:', miners);
        renderShop(miners);
        
    } catch (error) {
        console.error('خطأ في جلب بيانات المتجر:', error);
        
        const container = document.getElementById('shop-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>عذراً، حدث خطأ في تحميل المتجر</p>
                    <button onclick="loadShop()" class="retry-btn">إعادة المحاولة</button>
                </div>
            `;
        }
    }
}

/**
 * عرض الأجهزة في الصفحة
 */
function renderShop(miners) {
    const container = document.getElementById('shop-container');
    
    if (!container) {
        console.error('عنصر shop-container غير موجود في الصفحة');
        return;
    }

    if (!miners || miners.length === 0) {
        container.innerHTML = '<div class="empty-shop">لا توجد أجهزة متاحة حالياً</div>';
        return;
    }

    // بناء HTML لعرض الأجهزة
    const shopHTML = `
        <div class="shop-grid">
            ${miners.map(miner => `
                <div class="miner-card" data-id="${miner.id}">
                    <div class="miner-header">
                        <h3 class="miner-name">${escapeHtml(miner.name)}</h3>
                        <span class="miner-power">⚡ ${miner.power_boost} قوة</span>
                    </div>
                    
                    <p class="miner-description">${escapeHtml(miner.description || 'لا يوجد وصف')}</p>
                    
                    <div class="miner-footer">
                        <div class="miner-price">
                            <span class="price-label">السعر:</span>
                            <span class="price-value">${formatNumber(miner.price_ram)} RAM</span>
                        </div>
                        
                        <button class="buy-btn" onclick="buyMiner('${miner.id}')">
                            شراء الجهاز
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = shopHTML;
}

/**
 * دالة شراء الجهاز - سيتم تطويرها لاحقاً
 */
async function buyMiner(minerId) {
    try {
        console.log('محاولة شراء الجهاز:', minerId);
        
        // إظهار رسالة للمستخدم
        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'جاري الشراء...';
        }

        // هنا سيتم إضافة منطق الشراء لاحقاً
        // سيتم التحقق من رصيد المستخدم وتحديث قاعدة البيانات
        
        // محاكاة عملية الشراء
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert('تمت عملية الشراء بنجاح! (واجهة تجريبية)');
        
    } catch (error) {
        console.error('خطأ في عملية الشراء:', error);
        alert('حدث خطأ في عملية الشراء. الرجاء المحاولة مرة أخرى.');
    } finally {
        // إعادة الزر إلى حالته الطبيعية
        const btn = event?.target;
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'شراء الجهاز';
        }
    }
}

/**
 * دوال مساعدة
 */

// تنسيق الأرقام
function formatNumber(num) {
    return new Intl.NumberFormat('ar-SA').format(num);
}

// منع هجمات XSS بتنظيف النصوص
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// إضافة أنماط CSS للعرض
function injectShopStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .shop-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .miner-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 20px;
            color: white;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
            animation: fadeIn 0.5s ease;
        }

        .miner-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }

        .miner-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            padding-bottom: 10px;
        }

        .miner-name {
            margin: 0;
            font-size: 1.2rem;
            font-weight: bold;
        }

        .miner-power {
            background: rgba(255,255,255,0.2);
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.9rem;
        }

        .miner-description {
            margin: 15px 0;
            line-height: 1.5;
            opacity: 0.9;
            min-height: 60px;
        }

        .miner-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.2);
            padding-top: 15px;
        }

        .miner-price {
            display: flex;
            flex-direction: column;
        }

        .price-label {
            font-size: 0.8rem;
            opacity: 0.8;
        }

        .price-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: #ffd700;
        }

        .buy-btn {
            background: white;
            color: #764ba2;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .buy-btn:hover {
            background: #f0f0f0;
            transform: scale(1.05);
        }

        .buy-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .loading, .empty-shop, .error-message {
            text-align: center;
            padding: 40px;
            font-size: 1.2rem;
            color: #666;
        }

        .error-message {
            color: #e74c3c;
        }

        .retry-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 15px;
        }

        .retry-btn:hover {
            background: #764ba2;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* دعم الوضع المظلم في Telegram */
        @media (prefers-color-scheme: dark) {
            body {
                background: #1a1a1a;
            }
            
            .miner-card {
                background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    // إضافة الأنماط
    injectShopStyles();
    
    // تحميل المتجر
    loadShop();
});

// تصدير الدوال للاستخدام العام
window.loadShop = loadShop;
window.buyMiner = buyMiner;

// shop.js - متجر التعدين المحسن لتطبيق Telegram Mini App

// التحقق من بيئة Telegram WebApp
const telegram = window.Telegram?.WebApp;

// إعدادات Supabase - يجب وضع القيم الصحيحة هنا مباشرة للتأكد
const SUPABASE_CONFIG = {
    url: 'https://dwfzydrmtjsfpzpfzaxb.supabase.co', // تأكد من صحة هذا الرابط
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Znp5ZHJtdGpzZnB6cGZ6YXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjY2NTIsImV4cCI6MjA1NzgwMjY1Mn0.rHjMDFI_6SclvQm5n7Fqy13THIZbA-SZ2-BD2v36t0E' // تأكد من صحة هذا المفتاح
};

/**
 * دالة لاختبار الاتصال بقاعدة البيانات
 */
async function testConnection() {
    try {
        console.log('اختبار الاتصال بـ Supabase...');
        
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/miners_shop?select=count`, {
            method: 'HEAD',
            headers: {
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
            }
        });
        
        console.log('حالة الاتصال:', response.status);
        return response.ok;
    } catch (error) {
        console.error('فشل الاتصال:', error);
        return false;
    }
}

/**
 * جلب جميع الأجهزة من جدول miners_shop
 */
async function loadShop() {
    const container = document.getElementById('shop-container');
    
    if (!container) {
        console.error('❌ عنصر shop-container غير موجود');
        return;
    }

    try {
        // إظهار حالة التحميل
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل الأجهزة...</p>
                <small class="debug-info">محاولة الاتصال بقاعدة البيانات...</small>
            </div>
        `;

        // اختبار الاتصال أولاً
        const isConnected = await testConnection();
        console.log('نتيجة اختبار الاتصال:', isConnected);

        // محاولة جلب البيانات
        console.log('محاولة جلب البيانات من:', `${SUPABASE_CONFIG.url}/rest/v1/miners_shop`);
        
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/miners_shop?select=*`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('حالة الاستجابة:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const miners = await response.json();
        console.log('✅ تم جلب البيانات بنجاح:', miners);

        if (!miners || miners.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد أجهزة في المتجر حالياً</p>
                    <small>يمكنك إضافة أجهزة من لوحة تحكم Supabase</small>
                </div>
            `;
            return;
        }

        renderShop(miners);

    } catch (error) {
        console.error('❌ خطأ مفصل:', error);
        
        // عرض رسالة خطأ مفصلة
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>عذراً، حدث خطأ في تحميل المتجر</h3>
                <p class="error-details">${error.message}</p>
                <div class="debug-box">
                    <p><strong>معلومات للتصحيح:</strong></p>
                    <ul>
                        <li>رابط Supabase: ${SUPABASE_CONFIG.url}</li>
                        <li>حالة الاتصال: ${await testConnection() ? '✅' : '❌'}</li>
                        <li>بيئة التشغيل: ${telegram ? 'Telegram WebApp' : 'متصفح عادي'}</li>
                    </ul>
                </div>
                <button onclick="location.reload()" class="retry-btn">
                    إعادة تحميل الصفحة
                </button>
                <button onclick="window.loadShop()" class="retry-btn secondary">
                    محاولة مرة أخرى
                </button>
            </div>
        `;
    }
}

/**
 * عرض الأجهزة في الصفحة
 */
function renderShop(miners) {
    const container = document.getElementById('shop-container');
    
    const shopHTML = `
        <div class="shop-header">
            <h2>🛒 متجر الأجهزة</h2>
            <p>اختر جهاز التعدين المناسب لك</p>
        </div>
        <div class="shop-grid">
            ${miners.map(miner => `
                <div class="miner-card" data-id="${miner.id}">
                    <div class="miner-badge">🔥 جديد</div>
                    <div class="miner-icon">⛏️</div>
                    <h3 class="miner-name">${escapeHtml(miner.name)}</h3>
                    <p class="miner-description">${escapeHtml(miner.description || 'جهاز تعدين عالي الكفاءة')}</p>
                    
                    <div class="miner-stats">
                        <div class="stat">
                            <span class="stat-label">⚡ قوة التعدين</span>
                            <span class="stat-value">${miner.power_boost} GH/s</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">💾 السعر</span>
                            <span class="stat-value price">${formatNumber(miner.price_ram)} RAM</span>
                        </div>
                    </div>
                    
                    <button class="buy-btn" onclick="buyMiner('${miner.id}')">
                        شراء الآن
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = shopHTML;
}

/**
 * دوال مساعدة
 */
function formatNumber(num) {
    return new Intl.NumberFormat('ar-SA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function buyMiner(minerId) {
    try {
        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'جاري الشراء...';
        }

        // هنا منطق الشراء الفعلي
        alert('تمت إضافة جهاز التعدين إلى محفظتك! (واجهة تجريبية)');
        
    } catch (error) {
        console.error('خطأ في الشراء:', error);
        alert('حدث خطأ في عملية الشراء');
    } finally {
        const btn = event?.target;
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'شراء الآن';
        }
    }
}

// إضافة الأنماط المحسنة
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 16px;
        }

        #shop-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .shop-header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
            padding: 20px;
        }

        .shop-header h2 {
            font-size: 2rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .shop-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 10px;
        }

        .miner-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 25px;
            position: relative;
            transition: transform 0.3s, box-shadow 0.3s;
            animation: fadeInUp 0.5s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .miner-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .miner-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, #ff6b6b, #ff4757);
            color: white;
            padding: 5px 15px;
            border-radius: 25px;
            font-size: 0.8rem;
            font-weight: bold;
            animation: pulse 2s infinite;
        }

        .miner-icon {
            font-size: 3rem;
            text-align: center;
            margin: 10px 0;
        }

        .miner-name {
            font-size: 1.5rem;
            color: #333;
            margin: 15px 0 10px;
            text-align: center;
        }

        .miner-description {
            color: #666;
            text-align: center;
            margin-bottom: 20px;
            line-height: 1.6;
            font-size: 0.95rem;
        }

        .miner-stats {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 15px;
            margin: 20px 0;
            color: white;
        }

        .stat {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }

        .stat-label {
            opacity: 0.9;
        }

        .stat-value {
            font-weight: bold;
            font-size: 1.1rem;
        }

        .stat-value.price {
            color: #ffd700;
        }

        .buy-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #00b09b, #96c93d);
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .buy-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 5px 20px rgba(0,176,155,0.4);
        }

        .buy-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .loading-state, .error-state, .empty-state {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            margin: 20px;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }

        .debug-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            font-family: monospace;
            font-size: 0.9rem;
        }

        .debug-box ul {
            list-style: none;
            padding: 10px 0;
        }

        .debug-box li {
            margin: 5px 0;
        }

        .retry-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
            transition: transform 0.2s;
        }

        .retry-btn.secondary {
            background: linear-gradient(135deg, #95a5a6, #7f8c8d);
        }

        .retry-btn:hover {
            transform: scale(1.05);
        }

        .error-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }

        .error-details {
            color: #e74c3c;
            background: #fde8e8;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
            .shop-grid {
                grid-template-columns: 1fr;
            }
            
            .miner-card {
                margin: 10px 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ تم تحميل shop.js');
    
    // إضافة الأنماط
    injectStyles();
    
    // توسيط Telegram WebApp إذا كان متاحاً
    if (telegram) {
        telegram.expand();
        console.log('Telegram WebApp متاح:', telegram);
    }
    
    // تحميل المتجر
    setTimeout(loadShop, 500); // تأخير بسيط للتأكد من تحميل كل شيء
});

// للتصحيح من وحدة التحكم
window.debugShop = {
    testConnection,
    loadShop,
    config: SUPABASE_CONFIG
};

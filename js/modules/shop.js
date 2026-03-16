// shop.js - متجر التعدين (محدث ومتوافق مع باقي المشروع)

// تهيئة Supabase بنفس الطريقة المستخدمة في باقي الملفات
const SUPABASE_URL = 'https://dwfzydrmtjsfpzpfzaxb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Znp5ZHJtdGpzZnB6cGZ6YXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjY2NTIsImV4cCI6MjA1NzgwMjY1Mn0.rHjMDFI_6SclvQm5n7Fqy13THIZbA-SZ2-BD2v36t0E';

// تهيئة عميل Supabase بنفس الطريقة المستخدمة في main.js
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دالة تحميل المتجر (بنفس نمط دوال المشروع)
window.loadShop = async function() {
    try {
        console.log('جاري تحميل المتجر...');
        
        // التحقق من وجود العنصر
        const container = document.getElementById('shop-container');
        if (!container) {
            console.error('عنصر shop-container غير موجود');
            return;
        }

        // عرض حالة التحميل
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">جاري تحميل الأجهزة...</p>
            </div>
        `;

        // جلب البيانات من Supabase (بنفس طريقة main.js)
        const { data: miners, error } = await supabase
            .from('minersshop')
            .select('*')
            .order('price_ram', { ascending: true });

        if (error) {
            throw error;
        }

        console.log('تم جلب البيانات:', miners);

        if (!miners || miners.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3 class="empty-title">لا توجد أجهزة متاحة</h3>
                    <p class="empty-text">سيتم إضافة أجهزة قريباً</p>
                </div>
            `;
            return;
        }

        // عرض الأجهزة
        displayMiners(miners);

    } catch (error) {
        console.error('خطأ في تحميل المتجر:', error.message);
        
        const container = document.getElementById('shop-container');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <h3 class="error-title">عذراً، حدث خطأ</h3>
                    <p class="error-message">${error.message || 'فشل تحميل المتجر'}</p>
                    <button class="retry-button" onclick="window.loadShop()">
                        إعادة المحاولة
                    </button>
                </div>
            `;
        }
    }
};

// دالة عرض الأجهزة (مطابقة لتصميم المشروع)
function displayMiners(miners) {
    const container = document.getElementById('shop-container');
    
    let minersHTML = '<div class="miners-grid">';
    
    miners.forEach(miner => {
        minersHTML += `
            <div class="miner-card" onclick="buyMiner('${miner.id}')">
                <div class="miner-card-header">
                    <h3 class="miner-card-title">${escapeHtml(miner.name)}</h3>
                    <span class="miner-card-badge">جديد</span>
                </div>
                <p class="miner-card-description">${escapeHtml(miner.description || 'جهاز تعدين عالي الأداء')}</p>
                <div class="miner-card-stats">
                    <div class="stat-item">
                        <span class="stat-label">⚡ القوة</span>
                        <span class="stat-value">${miner.power_boost} TH/s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💾 السعر</span>
                        <span class="stat-value price">${formatNumber(miner.price_ram)} RAM</span>
                    </div>
                </div>
                <button class="buy-miner-btn">شراء الجهاز</button>
            </div>
        `;
    });
    
    minersHTML += '</div>';
    container.innerHTML = minersHTML;
}

// دالة شراء الجهاز (مؤقتة للاختبار)
window.buyMiner = async function(minerId) {
    try {
        console.log('شراء جهاز:', minerId);
        
        // هنا يمكن إضافة منطق الشراء لاحقاً
        alert('تمت إضافة الجهاز إلى محفظتك! (خاصية قيد التطوير)');
        
    } catch (error) {
        console.error('خطأ في الشراء:', error);
        alert('حدث خطأ في عملية الشراء');
    }
};

// دوال مساعدة
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(number) {
    return new Intl.NumberFormat('ar-SA').format(number);
}

// إضافة الأنماط CSS للصفحة (بنفس تنسيق المشروع)
function addShopStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .miners-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            padding: 20px;
            animation: fadeIn 0.5s ease;
        }

        .miner-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 20px;
            color: white;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .miner-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1));
            pointer-events: none;
        }

        .miner-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .miner-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            padding-bottom: 10px;
        }

        .miner-card-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin: 0;
        }

        .miner-card-badge {
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            border: 1px solid rgba(255,255,255,0.3);
        }

        .miner-card-description {
            margin: 15px 0;
            line-height: 1.5;
            opacity: 0.9;
            min-height: 60px;
        }

        .miner-card-stats {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
            backdrop-filter: blur(5px);
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }

        .stat-label {
            opacity: 0.8;
        }

        .stat-value {
            font-weight: bold;
        }

        .stat-value.price {
            color: #ffd700;
            font-size: 1.1rem;
        }

        .buy-miner-btn {
            width: 100%;
            padding: 12px;
            background: white;
            color: #764ba2;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }

        .buy-miner-btn:hover {
            background: #f0f0f0;
            transform: scale(1.02);
        }

        .loading-container, .error-container, .empty-state {
            text-align: center;
            padding: 40px 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            margin: 20px;
            backdrop-filter: blur(10px);
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        .loading-text, .error-title, .empty-title {
            color: white;
            font-size: 1.2rem;
            margin-bottom: 10px;
        }

        .error-message, .empty-text {
            color: rgba(255,255,255,0.8);
            margin-bottom: 20px;
        }

        .error-icon, .empty-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }

        .retry-button {
            background: white;
            color: #764ba2;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .retry-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(255,255,255,0.2);
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
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

        @media (max-width: 768px) {
            .miners-grid {
                grid-template-columns: 1fr;
                padding: 10px;
            }
            
            .miner-card {
                margin: 5px 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ تم تحميل shop.js');
    addShopStyles();
    
    // تحميل المتجر إذا كان العنصر موجوداً
    if (document.getElementById('shop-container')) {
        window.loadShop();
    }
});

// للتصحيح من وحدة التحكم
console.log('🛒 متجر التعدين جاهز للاستخدام');

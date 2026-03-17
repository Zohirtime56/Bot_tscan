// shop.js - نسخة مخصصة للتجربة على المتصفح (Chrome)
const SUPABASE_URL = 'https://ldvakoamwgplowlgyexqs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0';

async function loadShop() {
    const container = document.getElementById('shop-container');
    if (!container) return;

    container.innerHTML = '<p style="text-align:center; color:#00ffcc;">جاري جلب البيانات من Supabase...</p>';

    // طلب البيانات مباشرة من جداول REST API
    const url = `${SUPABASE_URL}/rest/v1/miners_shop?select=*`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`خطأ في السيرفر: ${response.status}`);
        }

        const data = await response.json();
        renderShop(data);

    } catch (error) {
        console.error('خطأ التفاصيل:', error);
        container.innerHTML = `
            <div style="color:#ff4444; text-align:center; padding:20px;">
                <p>تعذر الاتصال بقاعدة البيانات</p>
                <small>${error.message}</small>
            </div>`;
    }
}

function renderShop(miners) {
    const container = document.getElementById('shop-container');
    if (!miners || miners.length === 0) {
        container.innerHTML = '<p style="text-align:center;">لا توجد أجهزة في المتجر حالياً</p>';
        return;
    }

    container.innerHTML = miners.map(miner => `
        <div style="background:#1a1a1a; border:1px solid #333; border-radius:12px; padding:15px; margin-bottom:15px; color:white;">
            <h3 style="margin:0; color:#00ffcc;">${miner.name}</h3>
            <p style="font-size:13px; color:#aaa;">${miner.description || 'جهاز تعدين فعال'}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#ffcc00; font-weight:bold;">${miner.price_ram} ZTX</span>
                <button style="background:#00ffcc; border:none; padding:8px 15px; border-radius:5px; font-weight:bold;">شراء</button>
            </div>
        </div>
    `).join('');
}

// تشغيل عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadShop);

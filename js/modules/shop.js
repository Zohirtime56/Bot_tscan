/**
 * دالة جلب البيانات باستخدام بروكسي لتجاوز حظر CORS
 */
async function supabaseFetch(endpoint, options = {}) {
    // الرابط الأصلي
    const targetUrl = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    
    // استخدام بروكسي AllOrigins لتجاوز الحظر
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
        throw new Error(`خطأ في البروكسي: ${response.status}`);
    }

    const data = await response.json();
    
    // تحويل البيانات من نص (String) إلى كائن (JSON) لأن البروكسي يعيدها كنص
    const finalData = JSON.parse(data.contents);

    if (data.status && data.status.http_code !== 200) {
        throw new Error(`خطأ من Supabase: ${data.status.http_code}`);
    }

    return finalData;
}

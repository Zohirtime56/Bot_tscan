// js/core/auth.js

async function authenticateUser() {
    const tg = window.Telegram.WebApp;
    
    // إعطاء تليجرام ثانية واحدة للتأكد من الجاهزية
    tg.ready();

    let user = tg.initDataUnsafe?.user;

    // --- وضع المطور (Developer Mode) ---
    // إذا لم يجد مستخدم (لأنك تفتح من المتصفح)، سيستخدم حساب تجريبي
    if (!user) {
        console.warn("⚠️ لم يتم العثور على تليجرام، استخدام حساب تجريبي للمطور");
        user = {
            id: 12345678, // ايدي وهمي للتجربة
            username: "Zohir_Dev",
            first_name: "Zohir"
        };
    }
    // ------------------------------------

    try {
        let { data: dbUser, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !dbUser) {
            // تسجيل مستخدم جديد إذا لم يكن موجوداً
            const newUser = {
                id: user.id,
                username: user.username || user.first_name,
                ram_balance: 0,
                z_balance: 0,
                mining_rate: 0.00000001,
                last_claim_time: new Date().toISOString()
            };

            const { data, error: insErr } = await window.supabaseClient
                .from('users')
                .insert([newUser])
                .select().single();
            
            dbUser = data;
        }

        return dbUser;
    } catch (e) {
        console.error("Error in Auth:", e);
        return null;
    }
}

window.authenticateUser = authenticateUser;

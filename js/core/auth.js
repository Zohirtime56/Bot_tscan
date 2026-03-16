// js/core/auth.js

async function authenticateUser() {
    const tg = window.Telegram.WebApp;
    const user = tg.initDataUnsafe?.user;

    // إذا لم يجد بيانات (نادر الحدوث داخل تليجرام)
    if (!user || !user.id) {
        console.error("❌ بيانات تليجرام غير متوفرة حالياً");
        return null; 
    }

    try {
        // البحث عن المستخدم في Supabase
        let { data: dbUser, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !dbUser) {
            console.log("📝 تسجيل مستخدم جديد بـ ID:", user.id);
            
            const newUser = {
                id: user.id,
                username: user.username || user.first_name,
                ram_balance: 0,
                mining_rate: 0.00000001,
                last_claim_time: new Date().toISOString()
            };

            const { data, error: insErr } = await window.supabaseClient
                .from('users')
                .insert([newUser])
                .select().single();
            
            if (insErr) throw insErr;
            dbUser = data;
        }

        return dbUser;
    } catch (e) {
        console.error("❌ خطأ في الاتصال بقاعدة البيانات:", e.message);
        return null;
    }
}

window.authenticateUser = authenticateUser;

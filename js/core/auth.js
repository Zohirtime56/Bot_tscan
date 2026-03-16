// js/core/auth.js

async function authenticateUser() {
    console.log("🛠️ محاولة اختراق حاجز الدخول...");
    const tg = window.Telegram.WebApp;
    
    // محاولة جلب بيانات تليجرام، وإذا فشلت نستخدم ID ثابت للتجربة
    let user = tg.initDataUnsafe?.user;

    if (!user || !user.id) {
        console.warn("⚠️ تليجرام لم يرسل بيانات، استخدام حساب الطوارئ.");
        user = { 
            id: 565656, // أي رقم ثابت لكي يعمل الجدول
            username: "Zohir_Hero", 
            first_name: "Zohir" 
        };
    }

    try {
        // البحث في Supabase
        let { data: dbUser, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        // إذا لم يجد المستخدم أو حدث خطأ، سنقوم بإنشائه فوراً
        if (!dbUser) {
            console.log("📝 إنشاء سجل جديد للمستخدم...");
            const newUser = {
                id: user.id,
                username: user.username || "Zohir_User",
                ram_balance: 0,
                mining_rate: 0.00000001,
                last_claim_time: new Date().toISOString()
            };

            const { data, error: insErr } = await window.supabaseClient
                .from('users')
                .insert([newUser])
                .select()
                .single();
            
            if (insErr) {
                console.error("❌ فشل الإنشاء في Supabase:", insErr.message);
                // حتى لو فشل الداتابيز، سنعيد كائن وهمي لكي يفتح البوت
                return newUser;
            }
            dbUser = data;
        }

        console.log("✅ تم تجاوز بوابة الدخول بنجاح!");
        return dbUser;

    } catch (e) {
        console.error("💥 خطأ غير متوقع:", e);
        // العودة بكائن تجريبي لضمان عدم توقف الواجهة
        return { id: 565656, username: "Zohir_Fallback", ram_balance: 0, mining_rate: 0 };
    }
}

window.authenticateUser = authenticateUser;

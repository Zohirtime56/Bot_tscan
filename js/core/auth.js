// js/core/auth.js

async function authenticateUser() {
    const tg = window.Telegram.WebApp;
    
    // ننتظر تليجرام قليلاً للتأكد من استقرار البيانات
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let user = tg.initDataUnsafe?.user;

    // إذا فشل تليجرام تماماً، سنستخدم حساب "تجريبي" لكي لا يتوقف البوت أمامك
    if (!user || !user.id) {
        console.error("بيانات تليجرام غير متوفرة، تحويل للوضع التجريبي");
        user = { id: 9999, username: "Zohir_Guest" }; 
    }

    try {
        // محاولة جلب المستخدم
        let { data: dbUser, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !dbUser) {
            // إذا لم يجد المستخدم، ينشئه فوراً بالأسماء التي في جدولك
            const newUser = {
                id: user.id,
                username: user.username || "User_" + user.id,
                ram_balance: 0, // تأكد أن هذا الاسم مطابق لـ Supabase
                mining_rate: 0.00000001,
                last_claim_time: new Date().toISOString()
            };

            const { data, error: insErr } = await window.supabaseClient
                .from('users')
                .insert([newUser])
                .select().single();
            
            if (insErr) {
                console.error("خطأ في الإنشاء:", insErr.message);
                return null;
            }
            dbUser = data;
        }

        return dbUser;
    } catch (e) {
        console.error("عطل في الاتصال:", e);
        return null;
    }
}

window.authenticateUser = authenticateUser;

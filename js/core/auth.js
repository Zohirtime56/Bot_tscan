// js/core/auth.js

/**
 * دالة التحقق الرئيسية: تربط بين تليجرام وقاعدة بيانات Supabase
 */
async function authenticateUser() {
    console.log("🔍 جاري فحص الهوية...");
    
    const tg = window.Telegram.WebApp;
    // التأكد من أن التطبيق يعمل داخل تليجرام
    const user = tg.initDataUnsafe?.user;

    if (!user) {
        console.error("❌ فشل الاتصال بتليجرام. تأكد من فتح البوت من هاتفك.");
        const nameElem = document.getElementById('user-name');
        if (nameElem) nameElem.innerText = "يرجى الفتح من تليجرام";
        return null;
    }

    try {
        // 1. محاولة جلب بيانات المستخدم من جدول users
        let { data: dbUser, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        // 2. إذا كان المستخدم غير موجود (خطأ Single أو لا توجد بيانات)
        if (error || !dbUser) {
            console.log("🆕 مستخدم جديد، جاري إنشاء حساب في الداتابيز...");
            
            // استخراج معرف الشخص الداعي إن وجد (Referral ID)
            const startParam = tg.initDataUnsafe.start_param;
            const referrerId = startParam ? parseInt(startParam) : null;

            const newUser = {
                id: user.id,
                username: user.username || user.first_name,
                first_name: user.first_name,
                referred_by: (referrerId && referrerId !== user.id) ? referrerId : null,
                ram_balance: 0, // رصيدك من ZTX
                z_balance: 0,   // العملة القابلة للسحب
                mining_rate: 0.00000001, // السرعة الابتدائية
                last_claim_time: new Date().toISOString()
            };

            const { data, error: insertError } = await window.supabaseClient
                .from('users')
                .insert([newUser])
                .select()
                .single();

            if (insertError) {
                console.error("❌ خطأ أثناء تسجيل المستخدم الجديد:", insertError.message);
                return null;
            }
            
            dbUser = data;
            console.log("✅ تم تسجيل المستخدم الجديد بنجاح!");
        } else {
            console.log("✅ تم تسجيل الدخول لمستخدم سابق:", dbUser.username);
        }

        return dbUser;

    } catch (err) {
        console.error("💥 خطأ غير متوقع في نظام التحقق:", err);
        return null;
    }
}

// جعل الدالة متاحة عالمياً لملف app.js
window.authenticateUser = authenticateUser;
                

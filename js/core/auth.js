// js/core/auth.js

async function authenticateUser() {
    const tg = window.Telegram.WebApp;
    tg.ready();
    
    const user = tg.initDataUnsafe.user;
    if (!user) {
        console.error("هذا التطبيق يعمل داخل تليجرام فقط.");
        return null;
    }

    // استخراج معرف الشخص الداعي من رابط البوت (start_param)
    // الرابط يكون عادة: t.me/bot?start=123456
    const startParam = tg.initDataUnsafe.start_param;
    const referrerId = startParam ? parseInt(startParam) : null;

    // محاولة جلب المستخدم من قاعدة البيانات
    let { data: dbUser, error } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !dbUser) {
        // إذا كان المستخدم جديداً، نقوم بإنشائه
        console.log("مستخدم جديد، جاري الإنشاء...");
        
        const newUser = {
            id: user.id,
            username: user.username || user.first_name,
            first_name: user.first_name,
            referred_by: referrerId !== user.id ? referrerId : null, // منع المستخدم من دعوة نفسه
            ram_balance: 0,
            z_balance: 0,
            mining_rate: 0.00000001 // السرعة الافتراضية
        };

        const { data, error: insertError } = await window.supabaseClient
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (insertError) {
            console.error("خطأ في إنشاء المستخدم:", insertError);
            return null;
        }

        // إذا كان هناك داعي، نزيد عدد إحالاته (اختياري في هذه المرحلة)
        if (referrerId) {
            updateReferrerCount(referrerId);
        }

        dbUser = data;
    }

    console.log("تم التحقق بنجاح:", dbUser.username);
    return dbUser;
}

async function updateReferrerCount(refId) {
    await window.supabaseClient.rpc('increment_referral_count', { row_id: refId });
          }

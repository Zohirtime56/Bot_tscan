// js/core/auth.js
async function authenticateUser() {
    console.log("بدء عملية التحقق...");
    const tg = window.Telegram.WebApp;
    const user = tg.initDataUnsafe.user;

    if (!user) {
        console.error("فشل جلب بيانات تليجرام");
        document.getElementById('user-name').innerText = "خطأ: افتح من تليجرام";
        return null;
    }

    // محاولة جلب المستخدم من Supabase
    const { data, error } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.log("مستخدم جديد، جاري التسجيل...");
        // كود إنشاء مستخدم جديد (الذي كتبناه سابقاً)
        return await registerNewUser(user); 
    }

    console.log("تم جلب بيانات المستخدم بنجاح:", data);
    return data;
}

async function registerNewUser(tgUser) {
    const newUser = {
        id: tgUser.id,
        username: tgUser.username || tgUser.first_name,
        ram_balance: 0,
        mining_rate: 0.000001,
        last_claim_time: new Date().toISOString()
    };
    const { data, error } = await window.supabaseClient.from('users').insert([newUser]).select().single();
    return data;
}

window.authenticateUser = authenticateUser;

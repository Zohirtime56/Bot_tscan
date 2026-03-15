// 1. إعداد الاتصال بـ Supabase
// استبدل القيم برابط مشروعك ومفتاحك الذي حصلت عليهما
const supabaseUrl = 'https://ldvakoamwgplowlgyxqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0'; 
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. تهيئة واجهة تليجرام (Telegram Mini App)
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // لفتح التطبيق بكامل الشاشة

const userId = tg.initDataUnsafe.user.id;
const firstName = tg.initDataUnsafe.user.first_name;

// 3. الدالة الأساسية لتشغيل التطبيق والمزامنة
async function startApp() {
    try {
        // محاولة جلب بيانات المستخدم من جدول users
        let { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        // إذا لم يجد المستخدم (خطأ أو لا توجد بيانات)، نقوم بإنشائه
        if (error || !user) {
            const { data, error: insertError } = await supabase
                .from('users')
                .insert([{ 
                    id: userId, 
                    username: tg.initDataUnsafe.user.username || firstName, 
                    balance: 0.0, 
                    mining_rate: 0.00000001 
                }])
                .select();
            
            if (insertError) throw insertError;
            user = data[0];
        }

        // تحديث واجهة المستخدم بالبيانات
        document.getElementById('user-name').innerText = `مرحباً ${firstName}`;
        runMiningAnimation(user);

    } catch (err) {
        console.error("خطأ في المزامنة:", err.message);
        // في حال حدوث خطأ، نعرض اسماً افتراضياً
        document.getElementById('user-name').innerText = `مرحباً ${firstName}`;
    }
}

// 4. محرك العداد الحي (الربح الوهمي)
function runMiningAnimation(user) {
    let currentBalance = user.balance;
    const rate = user.mining_rate;

    setInterval(() => {
        currentBalance += rate;
        // تحديث الرقم في الواجهة (تأكد أن الـ ID في HTML هو balance)
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.innerText = currentBalance.toFixed(8);
        }
    }, 1000); // تحديث كل ثانية
}

// تشغيل التطبيق
startApp();
                

// script.js — واجهة تعدين متحركة (وهمية) مع تكامل Supabase
// مبني على ملفك الأصلي لكن محسن بالميزات والستايل
// تم الاستناد إلى ملفك الأصلي. (ملفك: index.html, style.css, script.js). 3 4 5

// --------------------------- إعداد Supabase (ضع بيانات مشروعك هنا) ---------------------------
const supabaseUrl = 'https://ldvakoamwgplowlgyxqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --------------------------- Telegram WebApp init (آمن للاختبار) ---------------------------
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); try { tg.expand(); } catch (e) {} }

// إذا لم يتوفر TG (اختبار محلي)، سنستخدم بيانات افتراضية
const userId = tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id ? tg.initDataUnsafe.user.id : `test_${String(Date.now()).slice(-6)}`;
const firstName = tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name ? tg.initDataUnsafe.user.first_name : 'مستخدم';

// عناصر DOM
const elUserName = document.getElementById('user-name');
const elBalance = document.getElementById('balance');
const elMinerText = document.getElementById('miner-text');
const elLevelText = document.getElementById('level-text');
const elProgressFill = document.getElementById('progress-fill');
const elHashPower = document.getElementById('hash-power');
const elHourlyProfit = document.getElementById('hourly-profit');
const elSpeed = document.getElementById('speed');
const elReferrals = document.getElementById('referrals');
const elLeaderList = document.getElementById('leader-list');
const elMiningState = document.getElementById('mining-state');

// أزرار
const btnBoost = document.getElementById('btn-boost');
const btnDaily = document.getElementById('btn-daily');
const btnWithdraw = document.getElementById('btn-withdraw');
const btnLeaderboardToggle = document.getElementById('btn-leaderboard');
const leaderboardSection = document.getElementById('leaderboard');

let currentUser = null;
let saveTimer = null;

// multipliers & state
let multiplier = 1;
let boostActive = false;

// --------------- دالة بدء التطبيق والمزامنة مع Supabase ---------------
async function startApp() {
  elUserName.innerText = `مرحباً ${firstName}`;

  try {
    // jلب المستخدم من Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', String(userId))
      .maybeSingle();

    if (error) throw error;

    if (!userData) {
      const defaults = {
        id: String(userId),
        username: (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.username) || firstName,
        balance: 0.0,
        mining_rate: 0.00000001, // افتراضي
        level: 1,
        exp: 0,
        last_daily: null,
        referrals: 0,
        hash_power: '128.5 TH/s'
      };
      const { data: inserted, error: insErr } = await supabase.from('users').insert([defaults]).select().single();
      if (insErr) throw insErr;
      currentUser = inserted;
    } else {
      currentUser = userData;
    }

    // تحديث الواجهة
    updateUIFromUser(currentUser);
    runMiningLoop();

    // تحميل لوحة المتصدرين
    loadLeaderboard();

  } catch (err) {
    console.error("خطأ في المزامنة:", err);
    // عرض افتراضي واستمرار
    currentUser = {
      id: String(userId),
      username: firstName,
      balance: 0,
      mining_rate: 0.00000001,
      level: 1,
      exp: 0,
      last_daily: null,
      referrals: 0,
      hash_power: '128.5 TH/s'
    };
    updateUIFromUser(currentUser);
    runMiningLoop();
  }
}

// --------------- تحديث الواجهة من بيانات المستخدم ---------------
function updateUIFromUser(user){
  elUserName.innerText = `مرحباً ${user.username || firstName}`;
  elBalance.innerText = Number(user.balance || 0).toFixed(8);
  elHashPower.innerText = user.hash_power || '128.5 TH/s';
  elReferrals.innerText = user.referrals || 0;
  updateLevelUI(user.level || 1, user.exp || 0);
  updateHourlyProfit();
}

// --------------- تحديث مستوى و EXP في الواجهة ---------------
function updateLevelUI(level, exp){
  const nextExp = level * 100; // قاعدة بسيطة للـ EXP
  elLevelText.innerText = `مستوى ${level} • EXP ${exp}/${nextExp}`;
  const pct = Math.min(100, (exp / nextExp) * 100);
  elProgressFill.style.width = `${pct}%`;
}

// --------------- حلقة التعدين (محاكاة) ---------------
function runMiningLoop(){
  // سنحفظ كل 30 ثانية أو عند أحداث مهمة
  if (saveTimer) clearInterval(saveTimer);
  saveTimer = setInterval(saveUserToDB, 30000);

  // كل ثانية: زيادة الرصيد وEXP
  setInterval(async () => {
    if (!currentUser) return;
    const baseRate = Number(currentUser.mining_rate) || 0.00000001;
    const gain = baseRate * multiplier;
    // زيادة الرصيد
    currentUser.balance = Number(currentUser.balance || 0) + gain;
    // زيادة EXP
    currentUser.exp = Number(currentUser.exp || 0) + (gain * 10000); // مقياس EXP تقريبي

    // ترقية المستوى إذا تجاوز الــ EXP الحد
    const nextExp = (currentUser.level || 1) * 100;
    if (currentUser.exp >= nextExp) {
      currentUser.exp = currentUser.exp - nextExp;
      currentUser.level = (currentUser.level || 1) + 1;
      // مكافأة عن الترقية: زيادة في معدل التعدين
      currentUser.mining_rate = Number(currentUser.mining_rate || 0) * 1.08; // +8%
      // تأثير بصري
      elMinerText.innerText = `🔥 مستوى ارتفع! الآن مستوى ${currentUser.level}`;
      setTimeout(()=> elMinerText.innerText = `Mining • جاري التعدين`, 2500);
    }

    // تحديث الواجهة بصرياً
    elBalance.style.transform = "scale(1.06)";
    setTimeout(()=> elBalance.style.transform = "scale(1)", 120);
    elBalance.innerText = Number(currentUser.balance).toFixed(8);
    updateLevelUI(currentUser.level, currentUser.exp);
    updateHourlyProfit();
  }, 1000);
}

// --------------- حساب الربح/الساعة (تقديري) ---------------
function updateHourlyProfit(){
  const rate = Number(currentUser.mining_rate || 0);
  const hourly = rate * 3600 * multiplier;
  elHourlyProfit.innerText = hourly.toFixed(8);
  elSpeed.innerText = `${multiplier}x`;
}

// --------------- حفظ تغييرات المستخدم إلى Supabase ---------------
async function saveUserToDB(){
  if (!currentUser) return;
  try {
    // تحديث الحقول المهمة
    const { error } = await supabase
      .from('users')
      .update({
        balance: currentUser.balance,
        mining_rate: currentUser.mining_rate,
        level: currentUser.level,
        exp: currentUser.exp,
        referrals: currentUser.referrals
      })
      .eq('id', String(currentUser.id));
    if (error) console.warn("حفظ إلى DB فشل:", error);
  } catch (err) {
    console.error("خطأ في حفظ المستخدم:", err);
  }
}

// --------------- Boost مؤقت ---------------
btnBoost.addEventListener('click', async () => {
  if (boostActive) return alert('الـ Boost شغال بالفعل!');
  boostActive = true;
  multiplier = 5; // x5
  btnBoost.innerText = '🚀 Boost مفعل (30s)';
  elMinerText.innerText = '⚡ Boost مفعل — سرعة x5';
  updateHourlyProfit();

  setTimeout(() => {
    multiplier = 1;
    boostActive = false;
    btnBoost.innerText = '🚀 Boost 30s';
    elMinerText.innerText = 'Mining • جاري التعدين';
    updateHourlyProfit();
  }, 30000);
});

// --------------- مكافأة يومية (مرة كل 24 ساعة) ---------------
btnDaily.addEventListener('click', async () => {
  if (!currentUser) return;
  try {
    const now = new Date();
    const last = currentUser.last_daily ? new Date(currentUser.last_daily) : null;
    if (last && (now - last) < 24*60*60*1000) {
      const rem = Math.ceil((24*60*60*1000 - (now - last)) / (60*60*1000));
      return alert(`استلمت المكافأة اليوم — حاول مرة أخرى بعد ~${rem} ساعة.`);
    }
    // منحة يومية بسيطة
    const bonus = 0.00005 + Math.random() * 0.00005; // قيمة عشوائية صغيرة
    currentUser.balance = Number(currentUser.balance || 0) + bonus;
    currentUser.last_daily = now.toISOString();

    // حفظ فوري
    const { error } = await supabase.from('users').update({
      balance: currentUser.balance,
      last_daily: currentUser.last_daily
    }).eq('id', String(currentUser.id));
    if (error) throw error;

    elBalance.innerText = Number(currentUser.balance).toFixed(8);
    alert(`تم إرسال مكافأتك اليومية: ${bonus.toFixed(8)} BTC`);
  } catch (err) {
    console.error("خطأ في المكافأة اليومية:", err);
    alert('حدث خطأ أثناء استلام المكافأة.');
  }
});

// --------------- طلب سحب (محاكاة بسيطة) ---------------
btnWithdraw.addEventListener('click', async () => {
  if (!currentUser) return;
  const minWithdraw = 0.0001;
  const amountStr = prompt(`أدخل مبلغ السحب (الحد الأدنى ${minWithdraw} BTC):`, Number(currentUser.balance).toFixed(8));
  if (!amountStr) return;
  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) return alert('المبلغ غير صالح.');
  if (amount > Number(currentUser.balance)) return alert('الرصيد غير كافي.');

  // هنا يمكنك تنفيذ منطق السحب (ارسال إلى جدول withdrawals أو استدعاء API خارجي)
  // سنقوم بمحاكاة: خصم الرصيد وحفظ سجل سحب في جدول "withdrawals" إن وُجد
  try {
    currentUser.balance = Number(currentUser.balance) - amount;
    // حفظ الرصيد المخصوم
    const { error: updateErr } = await supabase.from('users').update({ balance: currentUser.balance }).eq('id', String(currentUser.id));
    if (updateErr) throw updateErr;

    // إدخال سجل سحب (اختياري — إن أردت إنشئ جدول withdrawals)
    const { error: insertErr } = await supabase.from('withdrawals').insert([{
      user_id: currentUser.id,
      amount: amount,
      status: 'pending',
      created_at: new Date().toISOString()
    }]);
    // قد يفشل الإدخال إن لم يكن جدول withdrawals موجود — لا بأس
    if (insertErr) console.warn('لم يتم إضافة سجل السحب (قد لا يوجد جدول withdrawals):', insertErr);

    elBalance.innerText = Number(currentUser.balance).toFixed(8);
    alert('تم تقديم طلب السحب — الحالة: قيد المعالجة.');
    loadLeaderboard(); // تحديث القوائم
  } catch (err) {
    console.error("خطأ في السحب:", err);
    alert('حدث خطأ أثناء تقديم طلب السحب.');
  }
});

// --------------- لوحة المتصدرين ---------------
btnLeaderboardToggle.addEventListener('click', () => {
  leaderboardSection.style.display = leaderboardSection.style.display === 'none' ? 'block' : 'none';
  if (leaderboardSection.style.display === 'block') loadLeaderboard();
});
async function loadLeaderboard(){
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username,balance')
      .order('balance', { ascending: false })
      .limit(8);
    if (error) throw error;
    elLeaderList.innerHTML = '';
    (data || []).forEach((u, i) => {
      const li = document.createElement('li');
      li.innerText = `${i+1}. ${u.username || 'مستخدم'} — ${Number(u.balance || 0).toFixed(8)} BTC`;
      elLeaderList.appendChild(li);
    });
  } catch (err) {
    console.error('خطأ في تحميل المتصدرين:', err);
  }
}

// --------------- بدء التنفيذ ---------------
startApp();

const http = require('http');
const fs = require('fs');
const { Bot, InlineKeyboard, session } = require('grammy');

// خادم HTTP لإبقاء الخدمة نشطة على Render
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('البوت يعمل بنجاح!');
}).listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

const BOT_TOKEN = process.env.BOT_TOKEN || '8872434743:AAFnPa1rCVC4nlzuSnsBqqIX0GrkP3SKYpM';
const ADMIN_ID = 7527825632;

const REF_REWARD = 0.02;      // مكافأة الإحالة (0.02$)
const SUGGESTED_GMAIL_RATE = 0.20; // سعر بيع الجيميل المقترح

const PAY = {
  orange: '🟠 رصيد أورنج',
  inwi: '🟣 رصيد إنوي',
  iam: '🔵 رصيد اتصالات المغرب',
  usdt: '💵 USDT (TRC20)',
  ff_diamonds: '💎 جواهر فري فاير',
  pubg_uc: '🔫 شدات ببجي'
};

const DB_FILE = 'accounts_db.json';
let db = { users: {}, listings: [], nextListing: 1 };

if (fs.existsSync(DB_FILE)) {
  try {
    db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
  } catch (e) {
    console.error("خطأ في قراءة قاعدة البيانات:", e);
  }
}

const save = () => {
  fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db, null, 2));
  fs.renameSync(DB_FILE + '.tmp', DB_FILE);
};

const isAdmin = (id) => id === ADMIN_ID;

const bot = new Bot(BOT_TOKEN);
bot.use(session({ initial: () => ({ step: null, data: {} }) }));

// القائمة الرئيسية
const mainMenu = () => new InlineKeyboard()
  .text('📧 بيع إيميلات Gmail', 'sell').row()
  .text('🎁 إكمال صناديق', 'box_menu').row()
  .text('💵 رصيدي وشحن الحساب', 'balance').text('📋 متابعة الطلبات', 'my_listings').row()
  .text('👥 نظام الإحالة (0.02$)', 'ref').text('💬 الدعم الفني', 'support');

const cancelKb = new InlineKeyboard().text('❌ إلغاء', 'cancel');

const home = async (ctx, text) => {
  await ctx.reply(text, { reply_markup: mainMenu() });
};

// أمر البدء والتحقق
bot.command('start', async (ctx) => {
  const id = ctx.from.id;
  const param = ctx.match ? Number(ctx.match) : null;

  if (!db.users[id]) {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;

    db.users[id] = {
      id,
      username: ctx.from.username || '',
      name: ctx.from.first_name || '',
      balance: 0.00,
      pendingRef: (param && param !== id && db.users[param]) ? param : null,
      isVerified: false,
      refCount: 0,
      banned: false,
      joinedAt: new Date().toISOString()
    };
    save();

    ctx.session.step = 'captcha';
    ctx.session.data = { num1, num2, ans: num1 + num2 };

    return ctx.reply(
      `👋 أهلاً بك في بوت خدمات Gmail والصناديق!\n\n` +
      `🔒 اختبار التحقق من البشرية:\n` +
      `يرجى حل المسألة الحسابية التالية لتفعيل حسابك:\n\n` +
      `❓ كم يساوي: ${num1} + ${num2} ؟`
    );
  }

  const u = db.users[id];
  if (!u.isVerified) {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    ctx.session.step = 'captcha';
    ctx.session.data = { num1, num2, ans: num1 + num2 };
    return ctx.reply(`🤖 يرجى إكمال أمان التحقق أولاً:\n\n❓ كم يساوي: ${num1} + ${num2} ؟`);
  }

  ctx.session = { step: null, data: {} };
  await home(ctx, `👋 أهلاً بك مجدداً يا ${ctx.from.first_name}!`);
});

bot.callbackQuery('cancel', async (ctx) => {
  await ctx.answerCallbackQuery('تم الإلغاء');
  ctx.session = { step: null, data: {} };
  await home(ctx, '🏠 القائمة الرئيسية');
});

// قسم إكمال الصناديق - تحديد عدد النقاط
bot.callbackQuery('box_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  const kb = new InlineKeyboard()
    .text('📦 50 نقطة ($0.20)', 'box_pts:50').text('📦 100 نقطة ($0.40)', 'box_pts:100').row()
    .text('📦 200 نقطة ($0.80)', 'box_pts:200').text('📦 500 نقطة ($2.00)', 'box_pts:500').row()
    .text('✏️ كتابة عدد نقاط آخر', 'box_pts:custom').row()
    .text('❌ إلغاء', 'cancel');

  await ctx.reply(
    `🎁 قسم إكمال الصناديق (Google Play)\n\n` +
    `💡 نسبة الخدمة: النظام يأخذ 40% من قيمة نقاط الصندوق ($0.40 لكل 100 نقطة).\n\n` +
    `اختر عدد النقاط الموجودة في صندوقك:`,
    { reply_markup: kb }
  );
});

// التعامل مع اختيار النقاط
bot.callbackQuery(/^box_pts:(50|100|200|500|custom)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const choice = ctx.match[1];

  if (choice === 'custom') {
    ctx.session.step = 'box_custom_pts';
    return ctx.reply('✍️ أرسل عدد النقاط الموجودة في الصندوق (مثال: 150):', { reply_markup: cancelKb });
  }

  const points = parseInt(choice);
  await processBoxPointsSelection(ctx, points);
});

// دالة معالجة اختيار النقاط والتحقق من الرصيد
async function processBoxPointsSelection(ctx, points) {
  const cost = Number((points * 0.004).toFixed(2)); // 100 points = 0.40$
  const u = db.users[ctx.from.id] || { balance: 0 };

  if (u.balance < cost) {
    const kb = new InlineKeyboard()
      .url('💬 شحن الرصيد من الأدمن', `tg://user?id=${ADMIN_ID}`).row()
      .text('👥 جمع الرصيد عبر الإحالة', 'ref').row()
      .text('❌ إلغاء', 'cancel');

    return ctx.reply(
      `⚠️ رصيدك غير كافٍ لإكمال هذا الصندوق!\n\n` +
      `📊 عدد النقاط: ${points} نقطة\n` +
      `💵 التكلفة المطلوبة: $${cost}\n` +
      `💰 رصيدك الحالي: $${(u.balance || 0).toFixed(2)}\n\n` +
      `يرجى شحن حسابك عن طريق التواصل مع الأدمن أو دعوة أصدقائك عبر رابط الإحالة.`,
      { reply_markup: kb }
    );
  }

  ctx.session.data.boxPoints = points;
  ctx.session.data.cost = cost;
  ctx.session.step = 'box_photo';

  await ctx.reply(
    `📸 يرجى الآن إرسال صورة الصندوق الخاص بك:`,
    { reply_markup: cancelKb }
  );
}

// قسم بيع Gmail
bot.callbackQuery('sell', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.data = {};
  ctx.session.step = 'qty';

  await ctx.reply(
    '⚠️ تنبيه: يجب أن تكون جميع الإيميلات جديدة وطازجة.\n\n' +
    '🔢 كم عدد الإيميلات التي تريد بيعها؟ (أرسل الرقم فقط، مثال: 10)',
    { reply_markup: cancelKb }
  );
});

// اختيار طريقة الاستلام
bot.callbackQuery(/^pay:(\w+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (ctx.session.step !== 'pay' || !PAY[ctx.match[1]]) return;

  const key = ctx.match[1];
  ctx.session.data.payMethod = key;
  ctx.session.step = 'payout';

  let hint = 'أرسل بيانات تحويل الأموال إليك:';
  if (key === 'ff_diamonds' || key === 'pubg_uc') hint = 'أرسل الـ ID الخاص بك في اللعبة:';
  else if (['orange', 'inwi', 'iam'].includes(key)) hint = 'أرسل رقم الهاتف لاستلام الرصيد:';
  else if (key === 'usdt') hint = 'أرسل عنوان محفظتك USDT (TRC20):';

  await ctx.reply(hint, { reply_markup: cancelKb });
});

// معالجة الرسائل والصور
bot.on(['message:text', 'message:photo'], async (ctx) => {
  const s = ctx.session;
  const text = ctx.message.text ? ctx.message.text.trim() : '';

  // 1. اختبار التحقق (Captcha)
  if (s && s.step === 'captcha') {
    const userAns = parseInt(text);
    if (isNaN(userAns) || userAns !== s.data.ans) {
      const num1 = Math.floor(Math.random() * 9) + 1;
      const num2 = Math.floor(Math.random() * 9) + 1;
      s.data = { num1, num2, ans: num1 + num2 };
      return ctx.reply(`❌ إجابة خاطئة! حاول مجدداً:\n\n❓ كم يساوي: ${num1} + ${num2} ؟`);
    }

    const u = db.users[ctx.from.id];
    u.isVerified = true;

    if (u.pendingRef && db.users[u.pendingRef]) {
      const refUser = db.users[u.pendingRef];
      refUser.balance = Number(((refUser.balance || 0) + REF_REWARD).toFixed(2));
      refUser.refCount = (refUser.refCount || 0) + 1;

      bot.api.sendMessage(
        refUser.id,
        `🎉 انضم شخص جديد عبر رابطك وتم التحقق منه!\n💰 تم إضافة $${REF_REWARD} إلى رصيدك.\nإجمالي رصيدك الآن: $${refUser.balance.toFixed(2)}`
      ).catch(() => {});

      u.pendingRef = null;
    }
    save();

    ctx.session = { step: null, data: {} };
    await ctx.reply('✅ تم التحقق بنجاح! تم تفعيل حسابك.');
    return home(ctx, '🏠 القائمة الرئيسية:');
  }

  // 2. إدخال عدد نقاط مخصص للصندوق
  if (s && s.step === 'box_custom_pts') {
    const pts = parseInt(text);
    if (isNaN(pts) || pts <= 0) return ctx.reply('⚠️ يرجى أدخال عدد نقاط صحيح.', { reply_markup: cancelKb });
    return processBoxPointsSelection(ctx, pts);
  }

  // 3. استلام صورة الصندوق
  if (s && s.step === 'box_photo') {
    if (!ctx.message.photo) {
      return ctx.reply('⚠️ يرجى إرسال صورة الصندوق فقط.', { reply_markup: cancelKb });
    }

    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    s.data.boxPhoto = photoId;
    s.step = 'box_credentials';

    return ctx.reply(
      `✅ تم استلام صورة الصندوق بنجاح.\n\n` +
      `📝 الآن أرسل الإيميل وكلمة السر للحساب:\n` +
      `(مثال: example@gmail.com : password123)`,
      { reply_markup: cancelKb }
    );
  }

  // 4. استلام إيميل وكلمة سر الصندوق وخيار الإنهاء
  if (s && s.step === 'box_credentials') {
    if (text.length < 5) return ctx.reply('⚠️ يرجى إدخال البيانات بشكل صحيح.', { reply_markup: cancelKb });

    const u = db.users[ctx.from.id];
    u.balance = Number((u.balance - s.data.cost).toFixed(2));

    const l = {
      id: db.nextListing++,
      type: 'box',
      sellerId: ctx.from.id,
      sellerName: ctx.from.first_name || '',
      sellerUser: ctx.from.username || '',
      points: s.data.boxPoints,
      cost: s.data.cost,
      credentials: text,
      photoId: s.data.boxPhoto,
      status: 'pending',
      date: new Date().toISOString()
    };

    db.listings.push(l);
    save();
    ctx.session = { step: null, data: {} };

    await home(ctx, `✅ تم الخصم ($${l.cost}) واستلام طلبك رقم #${l.id}!\n⏳ سيتم إكمال الصندوق وقبول الطلب قريباً.`);

    const kb = new InlineKeyboard()
      .text('✅ تم إكمال الصندوق', `box_ok:${l.id}`)
      .text('❌ رفض وإرجاع الرصيد', `box_refund:${l.id}`);

    const caption = `🎁 طلب إكمال صندوق جديد #${l.id}\n\n` +
      `👤 المستخدم: ${l.sellerName} (@${l.sellerUser || '-'})\n` +
      `📦 النقاط: ${l.points} نقطة\n` +
      `💵 المبلغ المخصوم: $${l.cost}\n\n` +
      `📝 بيانات الحساب:\n${l.credentials}`;

    await bot.api.sendPhoto(ADMIN_ID, l.photoId, { caption, reply_markup: kb });
  }

  // الأدمن
  if (isAdmin(ctx.from.id) && s.step === 'admin_reject_reason') {
    const l = db.listings.find(x => x.id === s.data.listingId);
    ctx.session = { step: null, data: {} };
    if (!l) return ctx.reply('⚠️ العرض غير موجود.');
    l.status = 'rejected';
    l.rejectReason = text;
    save();
    bot.api.sendMessage(l.sellerId, `❌ تم رفض عرضك رقم #${l.id}\n📌 السبب: ${text}`).catch(() => {});
    return ctx.reply(`✅ تم رفض العرض #${l.id}.`);
  }

  if (isAdmin(ctx.from.id) && s.step === 'admin_approve_note') {
    const l = db.listings.find(x => x.id === s.data.listingId);
    ctx.session = { step: null, data: {} };
    if (!l) return ctx.reply('⚠️ العرض غير موجود.');
    l.status = 'sold';
    l.approveNote = text;
    save();
    bot.api.sendMessage(l.sellerId, `🎉 تم قبول عرضك رقم #${l.id}\n💬 الملاحظة: ${text}`).catch(() => {});
    return ctx.reply(`✅ تم قبول العرض #${l.id}.`);
  }

  if (isAdmin(ctx.from.id) && s.step === 'broadcast') {
    ctx.session = { step: null, data: {} };
    let ok = 0;
    for (const u of Object.values(db.users)) {
      try { await bot.api.sendMessage(u.id, text); ok++; } catch (e) {}
      await new Promise(r => setTimeout(r, 40));
    }
    return ctx.reply(`📢 تم الإرسال إلى ${ok} مستخدم.`);
  }

  if (!s || !s.step) return;

  // بيع الجيميل
  if (s.step === 'qty') {
    const qty = parseInt(text);
    if (isNaN(qty) || qty <= 0) return ctx.reply('⚠️ أدخل رقماً صحيحاً.', { reply_markup: cancelKb });

    s.data.qty = qty;
    const suggestedPrice = (qty * SUGGESTED_GMAIL_RATE).toFixed(2) + '$';
    s.data.suggestedPrice = suggestedPrice;
    s.step = 'price';

    return ctx.reply(`💡 السعر المقترح لـ (${qty}) إيميل هو: ${suggestedPrice}\n\n✍ أدخل السعر الذي تطلبه:`, { reply_markup: cancelKb });
  }

  if (s.step === 'price') {
    s.data.price = text;
    s.step = 'credentials';
    return ctx.reply('📝 أرسل الإيميلات وكلمات السر الآن:', { reply_markup: cancelKb });
  }

  if (s.step === 'credentials') {
    if (text.length < 5) return ctx.reply('⚠️ أدخل البيانات بشكل صحيح.', { reply_markup: cancelKb });
    s.data.credentials = text;

    s.step = 'pay';
    const kb = new InlineKeyboard();
    Object.entries(PAY).forEach(([k, v]) => kb.text(v, `pay:${k}`).row());
    kb.text('❌ إلغاء', 'cancel');
    await ctx.reply('💳 اختر طريقة استلام المستحقات:', { reply_markup: kb });
  }

  if (s.step === 'payout') {
    const l = {
      id: db.nextListing++,
      type: 'gmail',
      sellerId: ctx.from.id,
      sellerName: ctx.from.first_name || '',
      sellerUser: ctx.from.username || '',
      qty: s.data.qty,
      suggestedPrice: s.data.suggestedPrice,
      price: s.data.price,
      credentials: s.data.credentials,
      payMethod: s.data.payMethod,
      payout: text,
      status: 'pending',
      date: new Date().toISOString()
    };

    db.listings.push(l);
    save();
    ctx.session = { step: null, data: {} };

    await home(ctx, `📩 تم استلام عرضك للبيع! (طلب رقم #${l.id})`);

    const kb = new InlineKeyboard()
      .text('✅ قبول ودفع', `adm_ok:${l.id}`)
      .text('❌ رفض العرض', `adm_no:${l.id}`);

    const msg = `📥 عرض بيع Gmail جديد #${l.id}\n\n` +
      `🔢 العدد: ${l.qty} إيميل | السعر: ${l.price}\n` +
      `📝 الإيميلات:\n${l.credentials}\n\n` +
      `💳 الطريقة: ${PAY[l.payMethod]} | البيانات: ${l.payout}\n` +
      `👤 المستخدم: ${l.sellerName} (@${l.sellerUser || '-'})`;

    await bot.api.sendMessage(ADMIN_ID, msg, { reply_markup: kb });
  }
});

// أزرار التحكم للأدمن
bot.callbackQuery(/^box_ok:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const lId = Number(ctx.match[1]);
  const l = db.listings.find(x => x.id === lId);
  if (!l || l.status !== 'pending') return ctx.answerCallbackQuery('تمت المعالجة سابقاً');

  l.status = 'completed';
  save();
  await ctx.answerCallbackQuery('تم الإكمال بنجاح');
  await ctx.reply(`✅ تم إكمال طلب الصندوق #${lId}`);
  bot.api.sendMessage(l.sellerId, `🎉 تم إكمال صندوق النقاط بنجاح للطلب رقم #${l.id}!`).catch(() => {});
});

bot.callbackQuery(/^box_refund:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const lId = Number(ctx.match[1]);
  const l = db.listings.find(x => x.id === lId);
  if (!l || l.status !== 'pending') return ctx.answerCallbackQuery('تمت المعالجة سابقاً');

  l.status = 'refunded';
  if (db.users[l.sellerId]) {
    db.users[l.sellerId].balance = Number(((db.users[l.sellerId].balance || 0) + l.cost).toFixed(2));
  }
  save();
  await ctx.answerCallbackQuery('تم الإلغاء وإرجاع المبلغ');
  await ctx.reply(`❌ تم رفض الطلب #${lId} وإعادة $${l.cost} للمستخدم.`);
  bot.api.sendMessage(l.sellerId, `❌ تعذر إكمال الصندوق للطلب رقم #${l.id}.\n💰 تم إعادة $${l.cost} إلى رصيدك.`).catch(() => {});
});

bot.callbackQuery(/^adm_ok:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const lId = Number(ctx.match[1]);
  ctx.session.step = 'admin_approve_note';
  ctx.session.data = { listingId: lId };
  await ctx.reply(`✍️ أدخل ملاحظة القبول للطلب #${lId}:`);
});

bot.callbackQuery(/^adm_no:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const lId = Number(ctx.match[1]);
  ctx.session.step = 'admin_reject_reason';
  ctx.session.data = { listingId: lId };
  await ctx.reply(`✍️ اكتب سبب الرفض للطلب #${lId}:`);
});

// أزرار الرصيد والإحالة والطلبات
bot.callbackQuery('balance', async (ctx) => {
  await ctx.answerCallbackQuery();
  const u = db.users[ctx.from.id] || { balance: 0 };
  const kb = new InlineKeyboard()
    .url('💬 شحن الرصيد (التواصل مع الأدمن)', `tg://user?id=${ADMIN_ID}`).row()
    .text('❌ إلغاء', 'cancel');

  await ctx.reply(
    `💵 تفاصيل محفظتك:\n\n` +
    `💰 رصيدك الحالي: $${(u.balance || 0).toFixed(2)}\n\n` +
    `📌 كيفية الشحن؟\n` +
    `تواصل مع الأدمن مباشرة لشحن حسابك بجميع الطرق المتوفرة (رصيد هاتف، USDT، فري فاير...).`,
    { reply_markup: kb }
  );
});

bot.callbackQuery('ref', async (ctx) => {
  await ctx.answerCallbackQuery();
  const me = await bot.api.getMe();
  const u = db.users[ctx.from.id] || { refCount: 0, balance: 0 };
  await ctx.reply(
    `👥 نظام الإحالات والربح\n\n` +
    `🔗 رابطك الشخصي للدعوة:\n` +
    `https://t.me/${me.username}?start=${ctx.from.id}\n\n` +
    `🎁 المكافأة: تحصل على $${REF_REWARD} عن كل شخص حقيقي يدخل من رابطك ويتخطى الاختبار الأمني.\n\n` +
    `📊 الدعوات الناجحة: ${u.refCount || 0}\n` +
    `💰 رصيدك الحالي: $${(u.balance || 0).toFixed(2)}`,
    { reply_markup: cancelKb }
  );
});

bot.callbackQuery('my_listings', async (ctx) => {
  await ctx.answerCallbackQuery();
  const mine = db.listings.filter(l => l.sellerId === ctx.from.id).slice(-10);
  if (!mine.length) return ctx.reply('لا توجد طلبات سابقة.', { reply_markup: cancelKb });

  let text = '📋 قائمة طلباتك الأخيرة:\n\n';
  mine.forEach(l => {
    const typeStr = l.type === 'box' ? `🎁 إكمال صندوق (${l.points} نقطة)` : '📧 بيع Gmail';
    text += `🔹 طلب #${l.id} (${typeStr})\nالحالة: ${l.status}\n-------------\n`;
  });
  await ctx.reply(text, { reply_markup: cancelKb });
});

bot.callbackQuery('support', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(`💬 تواصل مباشرة مع الدعم الفني: tg://user?id=${ADMIN_ID}`);
});

// أوامر الأدمن
bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const totalUsers = Object.keys(db.users).length;
  await ctx.reply(
    `⚙️ لوحة تحكم الأدمن\n\n` +
    `👥 عدد المستخدمين: ${totalUsers}\n` +
    `📦 إجمالي الطلبات: ${db.listings.length}\n\n` +
    `💡 لشحن رصيد مستخدم اكتب:\n/addbalance <ID> <المبلغ>`,
    { reply_markup: new InlineKeyboard().text('📢 رسالة جماعية', 'adm_broadcast') }
  );
});

bot.command('addbalance', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const parts = ctx.message.text.split(' ');
  if (parts.length < 3) {
    return ctx.reply('⚠️ الاستخدام: /addbalance <ID> <المبلغ>\nمثال: /addbalance 123456789 2.50');
  }
  const targetId = Number(parts[1]);
  const amount = parseFloat(parts[2]);

  if (isNaN(targetId) || isNaN(amount) || !db.users[targetId]) {
    return ctx.reply('⚠️ المستخدم غير موجود.');
  }

  db.users[targetId].balance = Number(((db.users[targetId].balance || 0) + amount).toFixed(2));
  save();

  await ctx.reply(`✅ تم إضافة $${amount} لرصيد المستخدم ${targetId}.\nرصيده الحالي: $${db.users[targetId].balance}`);
  bot.api.sendMessage(targetId, `💰 تم شحن رصيدك!\nتم إضافة $${amount} لحسابك من الأدمن.\nرصيدك الحالي: $${db.users[targetId].balance}`).catch(() => {});
});

bot.callbackQuery('adm_broadcast', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  await ctx.answerCallbackQuery();
  ctx.session.step = 'broadcast';
  await ctx.reply('📢 أرسل نص الرسالة الجماعية:', { reply_markup: cancelKb });
});

bot.catch((e) => console.error(e));
bot.start();
console.log('Bot fully running with Box Points and Balance System...');

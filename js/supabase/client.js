// js/supabase/client.js

const supabaseUrl = 'https://ldvakoamwgplowlgyexqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0';

// التأكد من أن مكتبة Supabase محملة قبل البدء
if (typeof supabase === 'undefined') {
    console.error("❌ مكتبة Supabase لم يتم تحميلها من الـ CDN!");
}

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// تصدير الكليانت عالمياً
window.supabaseClient = _supabase;

console.log("✅ تم إنشاء اتصال Supabase");

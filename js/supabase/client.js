// js/supabase/client.js

// الرابط الخاص بمشروعك على Supabase
const supabaseUrl = 'https://ldvakoamwgplowlgyexqs.supabase.co';

// مفتاح Anon Key الذي أرسلته لي
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmFrb2Ftd2dwbG93bGd5eHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjA2ODMsImV4cCI6MjA4OTEzNjY4M30.SbOS7LDPcT9gDZa7QxITcFQVMf5XoJWxx5aQuTTYmY0';

// إنشاء اتصال العميل
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// تصدير العميل عالمياً (Global) ليكون متاحاً لجميع ملفات الـ JS الأخرى
window.supabaseClient = _supabase;

console.log("تم تفعيل اتصال Supabase بنجاح ✅");

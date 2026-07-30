const { createClient } = require('@supabase/supabase-js');

// 兼容新版 publishable key 和旧版 anon key
const supabaseUrl = process.env.SUPABASE_URL;
// 新版：sb_publishable_...; 旧版：eyJ... (JWT)
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY 环境变量');
  console.error('   请在 Railway 的 Variables 中设置这两个变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

module.exports = supabase;

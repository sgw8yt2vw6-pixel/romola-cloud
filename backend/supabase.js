const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY 环境变量');
  console.error('   请在 Railway 的 Variables 中设置这两个变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

module.exports = supabase;

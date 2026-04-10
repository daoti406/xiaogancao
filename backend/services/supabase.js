import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

// 验证Supabase配置
const isValidConfig = () => {
  const url = config.supabase.url;
  const anonKey = config.supabase.anonKey;

  // 检查是否是有效的URL和key
  return url && url.startsWith('http') && url !== 'your_supabase_url'
    && anonKey && anonKey !== 'your_supabase_anon_key';
};

// 延迟创建Supabase客户端，只有在配置有效时才创建
let _supabase = null;
let _supabaseAdmin = null;

// 获取 supabase 客户端实例
const getSupabase = () => {
  if (!_supabase && isValidConfig()) {
    _supabase = createClient(config.supabase.url, config.supabase.anonKey);
    console.log('✅ Supabase 客户端已创建');
  }
  return _supabase;
};

// 获取 supabaseAdmin 客户端实例（用于数据库操作）
const getSupabaseAdmin = () => {
  if (!_supabaseAdmin && isValidConfig()) {
    _supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);
    console.log('✅ Supabase Admin 客户端已创建');
  }
  return _supabaseAdmin;
};

// 导出 supabase 客户端（完整实例，支持 .from() 等方法）
export const supabase = getSupabase();

// 导出 supabaseAdmin 客户端（完整实例，支持 .from() 等方法）
export const supabaseAdmin = getSupabaseAdmin();

// 验证Supabase配置
export const validateSupabaseConfig = () => {
  if (!isValidConfig()) {
    console.error('❌ Supabase 配置无效，请检查 backend/.env 文件中的配置');
    console.error('   需要配置: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
    console.error('   获取地址: https://supabase.com → 您的项目 → Settings → API');
    return false;
  }
  console.log('✅ Supabase 配置验证通过');
  return true;
};

// 导出默认客户端（兼容旧代码）
export default supabase;

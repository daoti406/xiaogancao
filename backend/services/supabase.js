import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

// 创建Supabase客户端（用于客户端操作，使用anon_key）
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// 创建Supabase服务端客户端（使用service_role_key，具有更高权限）
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

// 验证Supabase配置
export const validateSupabaseConfig = () => {
  if (!config.supabase.url || config.supabase.url === 'your_supabase_url') {
    throw new Error('SUPABASE_URL 未配置，请在 backend/.env 中设置');
  }
  if (!config.supabase.anonKey || config.supabase.anonKey === 'your_supabase_anon_key') {
    throw new Error('SUPABASE_ANON_KEY 未配置，请在 backend/.env 中设置');
  }
  if (!config.supabase.serviceRoleKey || config.supabase.serviceRoleKey === 'your_service_role_key') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 未配置，请在 backend/.env 中设置');
  }
  return true;
};

export default supabase;

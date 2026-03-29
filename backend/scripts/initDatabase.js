/**
 * 数据库初始化脚本
 * 在Supabase SQL编辑器中执行以下SQL语句
 */

// 体质结果表
const createConstitutionResultsTable = `
-- 体质结果表
CREATE TABLE IF NOT EXISTS constitution_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  constitution_type VARCHAR(50) NOT NULL,
  scores JSONB NOT NULL,
  result_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_constitution_results_user_id ON constitution_results(user_id);
`;

// 对话会话表
const createChatSessionsTable = `
-- 对话会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
`;

// 对话消息表
const createChatMessagesTable = `
-- 对话消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
`;

// 养生方案表
const createWellnessPlansTable = `
-- 养生方案表
CREATE TABLE IF NOT EXISTS wellness_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  constitution_type VARCHAR(50),
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wellness_plans_user_id ON wellness_plans(user_id);
`;

// 提醒表
const createRemindersTable = `
-- 提醒表
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  remind_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
`;

// 启用RLS策略（可选，安全性更高）
const enableRLS = `
-- 启用行级安全策略
ALTER TABLE constitution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- 创建策略（服务端操作需要）
CREATE POLICY "Service role can do anything" ON constitution_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON wellness_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON reminders FOR ALL USING (true) WITH CHECK (true);
`;

const allSQL = `
-- =============================================
-- 小甘草数据库初始化脚本
-- 在Supabase SQL编辑器中执行此脚本
-- =============================================

${createConstitutionResultsTable}

${createChatSessionsTable}

${createChatMessagesTable}

${createWellnessPlansTable}

${createRemindersTable}

-- 启用RLS（推荐在生产环境启用）
-- ${enableRLS}
`;

console.log('=== 数据库初始化SQL ===\n');
console.log(allSQL);
console.log('\n=== 使用说明 ===');
console.log('1. 登录Supabase控制台');
console.log('2. 进入SQL编辑器');
console.log('3. 粘贴并执行上述SQL语句');
console.log('4. 确保已创建auth.users表（Supabase默认提供）');

export default allSQL;

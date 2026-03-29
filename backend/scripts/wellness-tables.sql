-- =============================================
-- 养生方案系统数据库表
-- 在 Supabase SQL 编辑器中执行
-- =============================================

-- 用户健康档案表
CREATE TABLE IF NOT EXISTS user_health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  constitution_type VARCHAR(50),
  special_period VARCHAR(50) CHECK (special_period IN ('menstruating', 'pregnant', 'postpartum', 'menopause', 'none')),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 养生方案表（替换策略，每次生成新方案替换旧方案）
CREATE TABLE IF NOT EXISTS wellness_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  constitution_type VARCHAR(50),
  gender VARCHAR(10),
  special_period VARCHAR(50),
  plan_data JSONB NOT NULL,
  adjustment_questions JSONB, -- 用户调整问题记录
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_health_profiles_user_id ON user_health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_plans_user_id ON wellness_plans(user_id);

-- 启用 RLS
ALTER TABLE user_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_plans ENABLE ROW LEVEL SECURITY;

-- RLS 策略（允许服务端完全访问）
CREATE POLICY "Service role full access" ON user_health_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON wellness_plans FOR ALL USING (true) WITH CHECK (true);

-- 添加 updated_at 自动更新触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_user_health_profiles_updated_at ON user_health_profiles;
CREATE TRIGGER update_user_health_profiles_updated_at
  BEFORE UPDATE ON user_health_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wellness_plans_updated_at ON wellness_plans;
CREATE TRIGGER update_wellness_plans_updated_at
  BEFORE UPDATE ON wellness_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

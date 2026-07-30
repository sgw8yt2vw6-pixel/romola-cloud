# Romola 云端同步 - Supabase Schema
# 在 Supabase SQL Editor 中运行这段 SQL

-- 创建同步数据表
CREATE TABLE IF NOT EXISTS sync_data (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_sync_data_device_id ON sync_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sync_data_updated_at ON sync_data(updated_at DESC);

-- 自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_data_updated_at ON sync_data;
CREATE TRIGGER trg_sync_data_updated_at
  BEFORE UPDATE ON sync_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 行级安全策略（可选：若启用 anon key 直接访问，则需以下策略）
ALTER TABLE sync_data ENABLE ROW LEVEL SECURITY;

-- 允许所有用户通过 device_id 查询
CREATE POLICY "允许通过 device_id 查询" ON sync_data
  FOR SELECT USING (true);

-- 允许所有用户插入/更新（upsert）
CREATE POLICY "允许 upsert" ON sync_data
  FOR ALL USING (true)
  WITH CHECK (true);

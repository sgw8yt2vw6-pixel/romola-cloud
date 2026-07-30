require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================================
//  中间件
// ============================================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ============================================================
//  健康检查
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '2.0' });
});

// ============================================================
//  同步 API
// ============================================================

/**
 * 推送数据到云端
 * POST /api/sync/push
 * Body: { deviceId: string, data: object }
 * 逻辑：Upsert — 若 deviceId 已存在则更新，否则新建
 */
app.post('/api/sync/push', async (req, res) => {
  try {
    const { deviceId, data } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: '缺少 deviceId' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: '缺少数据' });
    }

    // 限制数据大小
    const rawSize = JSON.stringify(data).length;
    if (rawSize > 5 * 1024 * 1024) {
      return res.status(413).json({ error: '数据超过 5MB 限制' });
    }

    const now = new Date().toISOString();

    // Upsert: 尝试插入，冲突则更新
    const { data: result, error } = await supabase
      .from('sync_data')
      .upsert(
        { device_id: deviceId, data, updated_at: now },
        { onConflict: 'device_id', ignoreDuplicates: false }
      )
      .select('device_id, updated_at')
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: '云端写入失败', detail: error.message });
    }

    console.log(`☁️ 推送成功 deviceId=${deviceId} size=${(rawSize/1024).toFixed(1)}KB`);
    res.json({
      success: true,
      deviceId: result.device_id,
      updatedAt: result.updated_at,
      sizeKB: Math.round(rawSize / 1024 * 10) / 10
    });
  } catch (err) {
    console.error('Push error:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * 从云端拉取数据
 * GET /api/sync/pull?deviceId=xxx
 * 返回该 deviceId 的最新数据
 */
app.get('/api/sync/pull', async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: '缺少 deviceId 参数' });
    }

    const { data, error } = await supabase
      .from('sync_data')
      .select('device_id, data, updated_at')
      .eq('device_id', deviceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 数据不存在
        return res.status(404).json({ error: '该设备码尚未创建数据', exists: false });
      }
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: '查询失败', detail: error.message });
    }

    const rawSize = JSON.stringify(data.data).length;
    console.log(`☁️ 拉取成功 deviceId=${deviceId} size=${(rawSize/1024).toFixed(1)}KB`);

    res.json({
      success: true,
      deviceId: data.device_id,
      data: data.data,
      updatedAt: data.updated_at,
      sizeKB: Math.round(rawSize / 1024 * 10) / 10
    });
  } catch (err) {
    console.error('Pull error:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * 获取设备列表（调试用）
 * GET /api/sync/devices
 */
app.get('/api/sync/devices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sync_data')
      .select('device_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, devices: data });
  } catch (err) {
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================================
//  SPA 回退
// ============================================================
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// ============================================================
//  启动
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎀 Romola Cloud Server running on port ${PORT}`);
  console.log(`   Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`   Push:   POST /api/sync/push`);
  console.log(`   Pull:   GET  /api/sync/pull?deviceId=xxx`);
});

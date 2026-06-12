// คัดลอกไฟล์นี้เป็น config.js แล้วใส่ค่าจริง
window.CONFIG = {
  SUPABASE_URL: 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_...',

  // Supabase Dashboard → Settings → API → service_role (ใช้สร้าง user โดยไม่ส่ง email)
  SUPABASE_SERVICE_ROLE_KEY: '',

  // LINE Login Channel ID (สำหรับผู้ปกครอง connect LINE)
  // สร้างที่ https://developers.line.biz → LINE Login channel
  LINE_LOGIN_CHANNEL_ID: '',
}
const CONFIG = window.CONFIG

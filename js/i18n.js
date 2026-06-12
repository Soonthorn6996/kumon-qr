// Central i18n module — all pages share this translations object
const T = {
  th: {
    /* ── Common ── */
    logout:       'ออกจากระบบ',
    nav_exit:     'ออก',
    back:         '← กลับ',
    nav_home:     '← หน้าหลัก',
    loading:      'กำลังโหลด...',
    all:          'ทั้งหมด',

    /* ── Filters ── */
    filter_all:       'ทั้งหมด',
    filter_in:        'กำลังเรียน',
    filter_out:       'ว่าง',
    filter_all_subj:  'ทุกวิชา',

    /* ── Status ── */
    status_in:    'กำลังเรียน',
    status_out:   'ว่าง',

    /* ── Index ── */
    hero_title:         'ยินดีต้อนรับสู่ ClassScan',
    hero_sub:           'ระบบลงเวลาเรียน — เลือกเมนูที่ต้องการ',
    menu_scan:          'สแกน QR',
    menu_scan_desc:     'บันทึกเข้า-ออกห้องเรียน',
    menu_dashboard:     'Dashboard',
    menu_dashboard_desc:'ดูสถานะนักเรียน Realtime',
    menu_admin:         'จัดการนักเรียน',
    menu_admin_desc:    'เพิ่มนักเรียน + สร้าง QR Code',
    menu_settings:      'ตั้งค่าระบบ',
    menu_settings_desc: 'ภาษา + จัดการบัญชีผู้ใช้',
    menu_notify:        'การแจ้งเตือน',
    menu_notify_desc:   'เลือกนักเรียนที่ติดตาม',

    /* ── Dashboard ── */
    dash_title:     'Dashboard นักเรียน',
    stat_total:     'นักเรียนทั้งหมด',
    stat_in_class:  'กำลังเรียน',
    stat_avail:     'ว่าง/ยังไม่เข้า',
    stat_sessions:  'รายการเปิดอยู่',
    students_heading: 'รายชื่อนักเรียน',

    /* ── Scan ── */
    scan_title:     'สแกน QR',
    scan_sub:       'บันทึกเข้า-ออกห้องเรียน',
    scan_camera_h:  'กล้องสแกน',
    scan_camera_p:  'ใช้ QR ที่สร้างจากหน้า "จัดการนักเรียน"',
    btn_start:      'เริ่มสแกน',
    btn_stop:       'หยุด',
    btn_manual:     'บันทึก',
    manual_ph:      'ทดสอบด้วยรหัส QR เช่น qr_code:subject_id',
    history_h:      'รายการล่าสุด',
    history_p:      'ประวัติการเข้า-ออกล่าสุด',
    no_history:     'ยังไม่มีประวัติ',
    no_history_sub: 'รายการสแกนจะมาแสดงตรงนี้',

    /* ── Admin ── */
    admin_title:    'จัดการนักเรียน',
    btn_add:        '+ เพิ่มนักเรียน',
    btn_qr_all:     '📱 สร้าง QR ทั้งหมด',
    btn_print_qr:   'พิมพ์ QR',
    btn_hide_qr:    'ซ่อน',
    search_ph:      'ค้นหาชื่อนักเรียน ชื่อเล่น ชั้น หรือวิชา',

    /* ── Notify ── */
    notify_title:         'การแจ้งเตือน',
    notify_sub:           'ตั้งค่านักเรียนที่แจ้งเตือนสำหรับแต่ละบัญชีผู้ใช้',
    notify_perm_title:    'การแจ้งเตือนของ Chrome',
    notify_perm_desc:     'กดเปิดเพื่อรับแจ้งเตือนเมื่อนักเรียนสแกน QR',
    notify_perm_btn:      'เปิดการแจ้งเตือน',
    notify_perm_on:       'เปิดอยู่แล้ว ✓',
    notify_perm_on_desc:  'รับแจ้งเตือนเมื่อนักเรียนสแกน QR',
    notify_perm_blocked:  'ถูกบล็อก',
    notify_perm_blocked_desc: 'กรุณาเปิดสิทธิ์ใน Chrome Settings แล้วรีโหลดหน้า',
    notify_perm_unsupported: 'ไม่รองรับ',
    notify_user_label:    'ตั้งค่าสำหรับบัญชีผู้ใช้',
    notify_me:            '(ฉัน)',
    notify_students_title:'นักเรียนที่ติดตาม',
    toggle_on:            'ติดตาม',
    toggle_off:           'ไม่ติดตาม',

    /* ── Notes ── */
    menu_notes:           'บันทึกพัฒนาการ',
    menu_notes_desc:      'ติดตามพัฒนาการนักเรียน',
    notes_title:          'บันทึกพัฒนาการ',
    notes_sub:            'บันทึกโดยครู สำหรับนักเรียนที่ผู้ปกครองติดตาม',
    notes_write_title:    'เขียนบันทึกใหม่',
    notes_select_student: '— เลือกนักเรียน —',
    notes_ph:             'เขียนบันทึกพัฒนาการ ความก้าวหน้า หรือข้อสังเกต...',
    notes_submit:         'บันทึก',
    notes_history:        'ประวัติบันทึก',
    notes_my_students:    'บันทึกสำหรับนักเรียนที่ติดตาม',
    notes_empty:          'ยังไม่มีบันทึก',
    notes_no_watch:       'ยังไม่ได้ติดตามนักเรียนคนใด กรุณาตั้งค่าที่หน้า การแจ้งเตือน',
    notes_all:            'ทุกนักเรียน',
    notes_by:             'โดย',
    notes_saved:          'บันทึกแล้ว ✓',
    notes_err_select:     'กรุณาเลือกนักเรียน',
    notes_err_body:       'กรุณาเขียนบันทึก',
    btn_write_note:       '✏️ บันทึก',
    notes_today_label:    'บันทึกวันนี้',

    /* ── Leave ── */
    menu_leave:           'การลาหยุด',
    menu_leave_desc:      'แจ้งลาและดูรายการลาของนักเรียน',
    leave_title:          'การลาหยุด',
    leave_sub:            'แจ้งลาและตรวจสอบรายการลา',
    leave_write_title:    'แจ้งลาใหม่',
    leave_date_label:     'วันที่ลา',
    leave_reason_ph:      'เหตุผล (ไม่บังคับ) เช่น ป่วย ธุระ...',
    leave_submit:         'ยืนยันการลา',
    leave_my_history:     'การลาของฉัน',
    leave_all_list:       'รายการลาวันนี้',
    leave_filter_date:    'ดูตามวันที่',
    leave_empty:          'ไม่มีรายการลา',
    leave_saved:          'บันทึกการลาแล้ว ✓',
    leave_err_select:     'กรุณาเลือกนักเรียน',
    leave_err_date:       'กรุณาเลือกวันที่',
    leave_no_watch:       'ยังไม่ได้ติดตามนักเรียนคนใด กรุณาตั้งค่าที่หน้า การแจ้งเตือน',
    leave_duplicate:      'นักเรียนคนนี้มีการลาในวันที่นี้อยู่แล้ว',
    leave_delete_btn:     'ยกเลิกการลา',
    leave_deleted:        'ยกเลิกการลาแล้ว',
    leave_no_reason:      'ไม่ระบุเหตุผล',
    stat_absent:          'ลาวันนี้',
    leave_today_heading:  'ลาวันนี้',
    leave_badge:          '📅 ลา',
    leave_select_ph:      '— เลือกนักเรียน —',

    /* ── Parent (My Children) ── */
    parent_title:         '👨‍👩‍👧 ลูกของฉัน',
    parent_sub:           'ดูสถานะการเข้าเรียนและพัฒนาการของบุตรหลาน',
    parent_no_children:   'ยังไม่มีนักเรียนผูกกับบัญชีของท่าน กรุณาติดต่อเจ้าหน้าที่',
    parent_perm_desc:     'เปิดการแจ้งเตือนเพื่อรับข่าวสารเมื่อบุตรหลานเข้า-ออกห้องเรียน',
    parent_latest_notes:  'บันทึกล่าสุด',
    parent_no_notes:      'ยังไม่มีบันทึกพัฒนาการ',
    parent_view_all:      'ดูทั้งหมด →',
    parent_report_leave:  '📅 แจ้งลา',
    parent_enable_notif:  '🔔 เปิดการแจ้งเตือน',
    parent_notif_on:      '🔔 เปิดการแจ้งเตือนแล้ว',
    parent_notif_blocked: '🔕 การแจ้งเตือนถูกบล็อก',
    parent_line_connect:  '💬 เชื่อมต่อ LINE แจ้งเตือน',
    parent_line_connected:'✅ เชื่อมต่อ LINE แล้ว',
    parent_since:         'เข้าเมื่อ',

    /* ── Settings ── */
    settings_title:    'ตั้งค่าระบบ',
    settings_sub:      'ภาษา & จัดการบัญชีผู้ใช้',
    ttlLang:           'ภาษา / Language',
    ttlLangDesc:       'เลือกภาษาที่ต้องการแสดงผล',
    ttlUsers:          'บัญชีผู้ใช้',
    ttlUsersDesc:      'รายชื่อผู้ใช้งานทั้งหมดในระบบ',
    toggleCreate:      '+ สร้างผู้ใช้ใหม่',
    lblEmail:          'อีเมล',
    lblPwd:            'รหัสผ่าน',
    lblConfirm:        'ยืนยันรหัสผ่าน',
    phEmail:           'staff@example.com',
    phPwd:             'อย่างน้อย 6 ตัวอักษร',
    phConfirm:         'พิมพ์รหัสผ่านอีกครั้ง',
    formNote:          '⚠️ หากปิด Email Confirmation ใน Supabase ระบบจะ Sign Out อัตโนมัติหลังสร้างผู้ใช้',
    submitCreate:      'สร้างบัญชี',
    cancelCreate:      'ยกเลิก',
    colEmail:          'อีเมล',
    colRole:           'สิทธิ์',
    colCreated:        'วันที่สร้าง',
    colLastLogin:      'เข้าสู่ระบบล่าสุด',
    never_login:       'ยังไม่เคยเข้า',
    users_loading:     'กำลังโหลดรายชื่อผู้ใช้...',
    users_empty:       'ยังไม่มีบัญชีผู้ใช้ในระบบ',
    creating:          'กำลังสร้าง...',
    errEmail:          'กรุณากรอกอีเมล',
    errPwdLen:         'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    errPwdMatch:       'รหัสผ่านไม่ตรงกัน',
    youBadge:          'คุณ',
    successCreate:     (e) => `สร้างบัญชี ${e} สำเร็จ กรุณาตรวจอีเมลเพื่อยืนยันบัญชี`,
    noticeRelogin:     (e) => `สร้างบัญชี ${e} สำเร็จแล้ว กรุณาเข้าสู่ระบบอีกครั้ง`,
    migrationNote:     'ยังไม่ได้รัน Migration 005 กรุณาไปที่ Supabase Dashboard → SQL Editor แล้วรัน: supabase/migrations/005_add_profiles.sql',
  },

  en: {
    /* ── Common ── */
    logout:       'Logout',
    nav_exit:     'Exit',
    back:         '← Back',
    nav_home:     '← Home',
    loading:      'Loading...',
    all:          'All',

    /* ── Filters ── */
    filter_all:       'All',
    filter_in:        'In Class',
    filter_out:       'Available',
    filter_all_subj:  'All Subjects',

    /* ── Status ── */
    status_in:    'In Class',
    status_out:   'Available',

    /* ── Index ── */
    hero_title:         'Welcome to ClassScan',
    hero_sub:           'Attendance System — Select a menu',
    menu_scan:          'Scan QR',
    menu_scan_desc:     'Record class check-in & check-out',
    menu_dashboard:     'Dashboard',
    menu_dashboard_desc:'View real-time student status',
    menu_admin:         'Manage Students',
    menu_admin_desc:    'Add students & generate QR codes',
    menu_settings:      'System Settings',
    menu_settings_desc: 'Language & user management',
    menu_notify:        'Notifications',
    menu_notify_desc:   'Choose students to monitor',

    /* ── Dashboard ── */
    dash_title:     'Student Dashboard',
    stat_total:     'Total Students',
    stat_in_class:  'In Class',
    stat_avail:     'Available',
    stat_sessions:  'Open Sessions',
    students_heading: 'Student List',

    /* ── Scan ── */
    scan_title:     'Scan QR',
    scan_sub:       'Record class attendance',
    scan_camera_h:  'Scanner',
    scan_camera_p:  'Use QR codes generated from the Manage Students page',
    btn_start:      'Start Scan',
    btn_stop:       'Stop',
    btn_manual:     'Submit',
    manual_ph:      'Test with QR payload e.g. qr_code:subject_id',
    history_h:      'Recent History',
    history_p:      'Latest check-in / check-out records',
    no_history:     'No history yet',
    no_history_sub: 'Scan results will appear here',

    /* ── Admin ── */
    admin_title:    'Manage Students',
    btn_add:        '+ Add Student',
    btn_qr_all:     '📱 Generate All QR',
    btn_print_qr:   'Print QR',
    btn_hide_qr:    'Hide',
    search_ph:      'Search by name, nickname, grade or subject',

    /* ── Notify ── */
    notify_title:         'Notifications',
    notify_sub:           'Set notification students per user account',
    notify_perm_title:    'Chrome Notifications',
    notify_perm_desc:     'Enable to receive alerts when students scan QR',
    notify_perm_btn:      'Enable Notifications',
    notify_perm_on:       'Already enabled ✓',
    notify_perm_on_desc:  'You will receive alerts when students scan QR',
    notify_perm_blocked:  'Blocked',
    notify_perm_blocked_desc: 'Enable permission in Chrome Settings and reload the page',
    notify_perm_unsupported: 'Not supported',
    notify_user_label:    'Configure for user account',
    notify_me:            '(Me)',
    notify_students_title:'Watched Students',
    toggle_on:            'Watching',
    toggle_off:           'Not watching',

    /* ── Notes ── */
    menu_notes:           'Development Notes',
    menu_notes_desc:      'Track student progress',
    notes_title:          'Development Notes',
    notes_sub:            'Written by teachers for parents watching their students',
    notes_write_title:    'Write New Note',
    notes_select_student: '— Select Student —',
    notes_ph:             'Write about progress, observations or suggestions...',
    notes_submit:         'Save',
    notes_history:        'Notes History',
    notes_my_students:    'Notes for Watched Students',
    notes_empty:          'No notes yet',
    notes_no_watch:       'You are not watching any students. Set up in the Notifications page.',
    notes_all:            'All Students',
    notes_by:             'by',
    notes_saved:          'Saved ✓',
    notes_err_select:     'Please select a student',
    notes_err_body:       'Please write a note',
    btn_write_note:       '✏️ Note',
    notes_today_label:    "Today's Notes",

    /* ── Leave ── */
    menu_leave:           'Leave',
    menu_leave_desc:      'Submit and view student leave requests',
    leave_title:          'Leave',
    leave_sub:            'Submit leave / View absence records',
    leave_write_title:    'New Leave Request',
    leave_date_label:     'Leave Date',
    leave_reason_ph:      'Reason (optional) e.g. sick, personal...',
    leave_submit:         'Submit Leave',
    leave_my_history:     'My Submissions',
    leave_all_list:       "Today's Absences",
    leave_filter_date:    'View by Date',
    leave_empty:          'No leave records',
    leave_saved:          'Leave submitted ✓',
    leave_err_select:     'Please select a student',
    leave_err_date:       'Please select a date',
    leave_no_watch:       'You are not watching any students. Set up in the Notifications page.',
    leave_duplicate:      'This student already has a leave record for this date',
    leave_delete_btn:     'Cancel Leave',
    leave_deleted:        'Leave cancelled',
    leave_no_reason:      'No reason provided',
    stat_absent:          'Absent Today',
    leave_today_heading:  'Absent Today',
    leave_badge:          '📅 Leave',
    leave_select_ph:      '— Select Student —',

    /* ── Parent (My Children) ── */
    parent_title:         '👨‍👩‍👧 My Children',
    parent_sub:           "View your children's attendance and progress",
    parent_no_children:   'No students are linked to your account yet. Please contact staff.',
    parent_perm_desc:     'Enable notifications to get alerts when your child checks in or out.',
    parent_latest_notes:  'Latest Notes',
    parent_no_notes:      'No progress notes yet',
    parent_view_all:      'View all →',
    parent_report_leave:  '📅 Report Leave',
    parent_enable_notif:  '🔔 Enable Notifications',
    parent_notif_on:      '🔔 Notifications On',
    parent_notif_blocked: '🔕 Notifications Blocked',
    parent_line_connect:  '💬 Connect LINE Alerts',
    parent_line_connected:'✅ LINE Connected',
    parent_since:         'Since',

    /* ── Settings ── */
    settings_title:    'System Settings',
    settings_sub:      'Language & User Management',
    ttlLang:           'Language',
    ttlLangDesc:       'Select display language',
    ttlUsers:          'User Accounts',
    ttlUsersDesc:      'All system user accounts',
    toggleCreate:      '+ Create New User',
    lblEmail:          'Email',
    lblPwd:            'Password',
    lblConfirm:        'Confirm Password',
    phEmail:           'staff@example.com',
    phPwd:             'At least 6 characters',
    phConfirm:         'Re-enter password',
    formNote:          '⚠️ If Email Confirmation is disabled in Supabase, the system will auto sign-out after creating a user.',
    submitCreate:      'Create Account',
    cancelCreate:      'Cancel',
    colEmail:          'Email',
    colRole:           'Role',
    colCreated:        'Created At',
    colLastLogin:      'Last Login',
    never_login:       'Never',
    users_loading:     'Loading users...',
    users_empty:       'No user accounts found',
    creating:          'Creating...',
    errEmail:          'Please enter email',
    errPwdLen:         'Password must be at least 6 characters',
    errPwdMatch:       'Passwords do not match',
    youBadge:          'You',
    successCreate:     (e) => `Account ${e} created. Please check email for confirmation.`,
    noticeRelogin:     (e) => `Account ${e} created. Please log in again.`,
    migrationNote:     'Migration 005 not yet applied. Go to Supabase Dashboard → SQL Editor and run: supabase/migrations/005_add_profiles.sql',
  },
}

export function getLang() {
  return localStorage.getItem('classscan_lang') || 'th'
}

export function setLang(lang) {
  localStorage.setItem('classscan_lang', lang)
  document.documentElement.lang = lang
}

export function t(key, ...args) {
  const val = T[getLang()]?.[key] ?? T.th[key] ?? key
  return typeof val === 'function' ? val(...args) : val
}

// Apply translations to all [data-i18n] and [data-i18n-ph] elements
export function applyI18n() {
  document.documentElement.lang = getLang()
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n
    el.textContent = t(key)
  })
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh)
  })
}

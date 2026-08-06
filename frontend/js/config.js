/**
 * Public client configuration.
 * The Supabase publishable/anon key is intentionally used in the browser.
 * Protect write operations with Row Level Security policies in Supabase.
 */
window.APP_CONFIG = Object.freeze({
  SUPABASE_URL: "https://kdnuotszsmkhojvgptkw.supabase.co",
  SUPABASE_KEY: "sb_publishable_8vQ-AcoAnBVdTz-Cr5_Tdg_6F_5Ap4P",
  TABLE_NAME: "Employee",
  CACHE_KEY: "iubat_employee_directory_cache_v2",
  CACHE_MAX_AGE_MS: 24 * 60 * 60 * 1000,
  CONTACT: Object.freeze({
    email: "shawnazd@gmail.com",
    facebook: "https://facebook.com/shawnazd",
    whatsapp: "https://wa.me/8801873319733",
  }),
});

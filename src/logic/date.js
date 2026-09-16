// Yerel tarih yardımcıları (saat dilimi kaymasını önlemek için Date.toISOString yerine elle biçimlendirme).

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yearKey(d = new Date()) {
  return String(d.getFullYear());
}

export function weekday(d = new Date()) {
  return d.getDay(); // 0=Pazar ... 5=Cuma, 6=Cumartesi
}

// dateStr: 'YYYY-MM-DD', inclusive aralık kontrolü.
export function isWithinRange(dateStr, startStr, endStr) {
  if (!startStr || !endStr) return false;
  return dateStr >= startStr && dateStr <= endStr;
}

// str kesin olarak 'YYYY-MM-DD' biçiminde ve geçerli bir takvim günü mü?
// (`new Date(str)` ile doğrulama yapılmaz: örn. "10.07.2026" gibi Türkçe
// GG.AA.YYYY girişlerini JS motoru sessizce AA.GG.YYYY olarak yorumlayıp
// geçerli-ama-yanlış bir tarihe dönüştürebilir.)
export function isValidDateKey(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

// Yedek dosyası: oluşturma, doğrulama ve BİRLEŞTİRME.
//
// Eski yedekleme yalnızca panoya metin kopyalıyordu ve geri yükleme mevcut
// verinin ÜZERİNE YAZIYORDU. İki sorunu var:
//   1) pano metni kolay kayboluyor (bir yere yapıştırmayı unutmak yeterli),
//   2) eski bir yedeği geri yüklemek, o yedekten sonra işaretlenen günleri
//      silmek anlamına geliyordu.
// Bu yüzden artık dosya olarak kaydedilebiliyor ve geri yükleme BİRLEŞTİRME
// yapıyor: hiçbir mevcut işaret silinmez.

export const BACKUP_APP = 'ibadetlerim';
export const BACKUP_FORMAT = 1;

export function buildBackup(data) {
  return JSON.stringify({
    app: BACKUP_APP,
    version: BACKUP_FORMAT,
    exportedAt: new Date().toISOString(),
    data,
  });
}

export function backupFileName(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `ibadetlerim-yedek-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

// Metni doğrular. Hata varsa kullanıcıya gösterilecek bir mesaj DÖNDÜRÜR
// (atmaz), böylece çağıran taraf sade kalır.
// -> { data } | { error }
export function parseBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { error: 'Geçersiz JSON: metin/dosya doğru değil ya da eksik yapıştırılmış.' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { error: 'Tanınmayan yedek biçimi.' };
  }
  if (parsed.app && parsed.app !== BACKUP_APP) {
    return { error: 'Bu yedek başka bir uygulamaya ait.' };
  }
  const d = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
  const ok =
    (d.byDate && typeof d.byDate === 'object') ||
    (d.byYear && typeof d.byYear === 'object') ||
    (d.lifetime && typeof d.lifetime === 'object') ||
    Array.isArray(d.customItems);
  if (!ok) return { error: 'Yedekte tanınabilir bir veri bulunamadı.' };
  return {
    data: {
      byDate: d.byDate && typeof d.byDate === 'object' ? d.byDate : {},
      byYear: d.byYear && typeof d.byYear === 'object' ? d.byYear : {},
      lifetime: d.lifetime && typeof d.lifetime === 'object' ? d.lifetime : {},
      customItems: Array.isArray(d.customItems) ? d.customItems : [],
      settings: d.settings && typeof d.settings === 'object' ? d.settings : {},
    },
  };
}

// İşaret haritalarını birleştirir: bir işaret İKİ tarafın herhangi birinde
// varsa korunur. "İşaretlenmiş"i silmek geri yüklemenin işi değildir.
// Değerler true | 'na' (bana uygulanmıyor) | false olabilir; "yapıldı" her
// zaman "uygulanmıyor"dan üstündür, ikisi de boştan üstündür.
function statusRank(v) {
  if (v === true) return 2;
  if (v === 'na') return 1;
  return 0;
}
function mergeMarks(mine, theirs) {
  const out = { ...(mine || {}) };
  Object.keys(theirs || {}).forEach((k) => {
    const v = theirs[k];
    if (statusRank(v) > statusRank(out[k])) out[k] = v;
    else if (!(k in out)) out[k] = v || false;
  });
  return out;
}

function mergeDayMaps(mine, theirs) {
  const out = {};
  const keys = new Set([...Object.keys(mine || {}), ...Object.keys(theirs || {})]);
  keys.forEach((day) => {
    out[day] = mergeMarks((mine || {})[day], (theirs || {})[day]);
  });
  return out;
}

// -> { data, added: { days, marks, custom } }
export function mergeBackup(current, incoming) {
  const cur = current || {};
  const inc = incoming || {};
  const byDate = mergeDayMaps(cur.byDate, inc.byDate);
  const byYear = mergeDayMaps(cur.byYear, inc.byYear);
  const lifetime = mergeMarks(cur.lifetime, inc.lifetime);

  const haveIds = new Set((cur.customItems || []).map((i) => i.id));
  const custom = [...(cur.customItems || [])];
  (inc.customItems || []).forEach((i) => {
    if (i && i.id && !haveIds.has(i.id)) {
      custom.push(i);
      haveIds.add(i.id);
    }
  });

  const beforeDays = Object.keys(cur.byDate || {}).length;
  const beforeMarks = countMarks(cur.byDate);
  return {
    data: {
      byDate,
      byYear,
      lifetime,
      customItems: custom,
      // Ayarlar yedekteki hâliyle güncellenir ama mevcut ayarlar tamamen
      // silinmez (yedekte olmayan alan korunur).
      settings: { ...(cur.settings || {}), ...(inc.settings || {}) },
    },
    added: {
      days: Object.keys(byDate).length - beforeDays,
      marks: countMarks(byDate) - beforeMarks,
      custom: custom.length - (cur.customItems || []).length,
    },
  };
}

export function countMarks(byDate) {
  let n = 0;
  Object.keys(byDate || {}).forEach((d) => {
    const m = byDate[d] || {};
    Object.keys(m).forEach((id) => {
      if (m[id]) n += 1;
    });
  });
  return n;
}

// Kullanıcıya "ne kadar veri var" demek için.
export function backupStats(data) {
  const d = data || {};
  const days = Object.keys(d.byDate || {});
  const marked = days.filter((k) => Object.values(d.byDate[k] || {}).some(Boolean));
  marked.sort();
  return {
    days: marked.length,
    marks: countMarks(d.byDate),
    years: Object.keys(d.byYear || {}).length,
    lifetime: Object.keys(d.lifetime || {}).filter((k) => d.lifetime[k]).length,
    custom: (d.customItems || []).length,
    first: marked[0] || null,
    last: marked[marked.length - 1] || null,
  };
}

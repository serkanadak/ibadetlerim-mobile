// Geçmiş namaz (kaza) takibi: yalnızca farz ve vacip namazlar için, geçmiş
// günlerin kılınıp kılınmadığını izler. Sünnetler kaza kapsamında değildir.
// Cuma günleri öğle namazının yerine Cuma namazı geçtiği için o slot günün
// haftanın gününe göre değişir.

import { getById } from '../data/ibadetler';
import { todayKey, weekday, isValidDateKey } from './date';

// 'YYYY-MM-DD' anahtarını, ISO dize ayrıştırmasının saat dilimine/AA-GG
// sırasına bağlı belirsizliğine düşmeden yerel bir Date'e çevirir.
function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const SLOT_ITEM_IDS = {
  sabah: 'namaz-sabah-farz',
  ikindi: 'namaz-ikindi-farz',
  aksam: 'namaz-aksam-farz',
  yatsi: 'namaz-yatsi-farz',
  vitir: 'namaz-vitir',
};
export const KAZA_SLOT_META = {
  sabah: { label: 'S', name: 'Sabah' },
  ogle_cuma: { label: 'Ö', name: 'Öğle/Cuma' },
  ikindi: { label: 'İ', name: 'İkindi' },
  aksam: { label: 'A', name: 'Akşam' },
  yatsi: { label: 'Y', name: 'Yatsı' },
  vitir: { label: 'V', name: 'Vitir' },
};
export const KAZA_SLOTS = Object.keys(KAZA_SLOT_META);

// Verilen güne ait kaza kayıtlarını sırayla döner. Cuma günleri "ogle_cuma"
// slotu Cuma Namazı'na, diğer günler Öğle Namazı Farzı'na karşılık gelir.
export function getKazaItemsForDate(dateKey) {
  const isFriday = weekday(new Date(dateKey)) === 5;
  return KAZA_SLOTS.map((slot) => {
    const id = slot === 'ogle_cuma' ? (isFriday ? 'namaz-cuma-farz' : 'namaz-ogle-farz') : SLOT_ITEM_IDS[slot];
    const item = getById(id);
    return { ...item, slot, shortLabel: KAZA_SLOT_META[slot].label };
  });
}

// startKey'den endKey'e (ikisi de dahil) günleri en eskiden en yeniye
// (geçmişten bugüne) sıralar.
export function enumerateDates(startKey, endKey) {
  if (!isValidDateKey(startKey) || !isValidDateKey(endKey) || startKey > endKey) return [];
  const dates = [];
  const cur = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  while (cur <= end) {
    dates.push(todayKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

const TR_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

// 'YYYY-MM-DD' -> 'YYYY-MM'
export function monthKeyOf(dateKey) {
  return typeof dateKey === 'string' ? dateKey.slice(0, 7) : '';
}

// 'YYYY-MM' -> 'Temmuz 2026'
export function monthLabel(monthKeyStr) {
  const [y, m] = monthKeyStr.split('-').map(Number);
  return `${TR_MONTHS[m - 1]} ${y}`;
}

const TR_MONTHS_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

// m: 1-12 -> 'Oca'..'Ara'
export function monthShortLabel(m) {
  return TR_MONTHS_SHORT[m - 1];
}

// 'YYYY-MM' başlangıç ve bitiş ayları arasındaki tüm yılları artan sırada döner.
export function yearsInRange(startMonthKeyStr, endMonthKeyStr) {
  if (!startMonthKeyStr || !endMonthKeyStr) return [];
  const startYear = Number(startMonthKeyStr.slice(0, 4));
  const endYear = Number(endMonthKeyStr.slice(0, 4));
  const years = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);
  return years;
}

// year (sayı) ve month (1-12) verilip startMonthKeyStr/endMonthKeyStr aralığına
// sığdırılmış 'YYYY-MM' üretir (aralık dışına taşarsa en yakın uca kenetlenir).
export function buildMonthKey(year, month, startMonthKeyStr, endMonthKeyStr) {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  if (startMonthKeyStr && key < startMonthKeyStr) return startMonthKeyStr;
  if (endMonthKeyStr && key > endMonthKeyStr) return endMonthKeyStr;
  return key;
}

// Her gün için tamamlanma durumu + slot bazlı (Sabah/Öğle-Cuma/İkindi/Akşam/Yatsı/Vitir)
// borç özetini hesaplar. Öğle ve Cuma aynı "ogle_cuma" slotunda birleşir.
export function computeKazaSummary(byDate, dates) {
  const perSlotDebt = Object.fromEntries(KAZA_SLOTS.map((s) => [s, 0]));
  let totalDebt = 0;
  const days = dates.map((dateKey) => {
    const dayItems = getKazaItemsForDate(dateKey);
    const dayMap = byDate[dateKey] || {};
    let done = 0;
    for (const item of dayItems) {
      if (dayMap[item.id]) {
        done++;
      } else {
        perSlotDebt[item.slot]++;
        totalDebt++;
      }
    }
    return { dateKey, items: dayItems, done, total: dayItems.length, complete: done === dayItems.length };
  });
  return { totalDebt, perSlotDebt, days };
}

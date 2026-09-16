import { IBADETLER, FREQUENCY } from '../data/ibadetler';
import { weekday, isWithinRange } from './date';

// Cuma günü Cuma namazı (ilk sünnet + farz + son sünnet) öğle namazının
// (ilk sünnet + farz + son sünnet) yerine geçer; bu üçü Cuma günleri
// "Bugün" ve günlük seri/istatistik hesaplarından çıkarılır.
export const OGLE_DAILY_IDS = ['namaz-ogle-ilk-sunnet', 'namaz-ogle-farz', 'namaz-ogle-son-sunnet'];

// Düzenli bir takvim ritmi olan (günlük/haftalık, farz veya nafile) sıklıklar
// — istatistik ekranında ibadet bazında detay için kullanılır. Ramazan/bayram
// gibi mevsimsel veya ömürde bir/yılda bir kayıtlar hariçtir (ayrı bölümlerde
// zaten gösteriliyor).
export const RECURRING_FREQUENCIES = [
  FREQUENCY.DAILY,
  FREQUENCY.OPTIONAL_DAILY,
  FREQUENCY.WEEKLY_FRIDAY,
  FREQUENCY.OPTIONAL_WEEKLY_MON_THU,
  FREQUENCY.OPTIONAL_MONTHLY,
];

// Bugün için gösterilecek ibadetleri, "zorunlu" (farz/vacip/sünnet-i müekkede,
// bugüne bağlı) ve "opsiyonel" (nafile, kullanıcı ayarından açılan) olarak ayırır.
// extraItems: kullanıcının eklediği ilave ibadetler (TrackerContext.customItems).
export function getTodaySchedule({ dateKey, settings, extraItems = [] }) {
  const wd = weekday(new Date(dateKey));
  const required = [];
  const optional = [];
  const yearlyReminders = [];

  for (const item of [...IBADETLER, ...extraItems]) {
    switch (item.frequency) {
      case FREQUENCY.DAILY:
        if (wd === 5 && OGLE_DAILY_IDS.includes(item.id)) break;
        required.push(item);
        break;
      case FREQUENCY.OPTIONAL_DAILY:
        if (item.group) {
          // İlgili vaktin sünnetiyle aynı satırda gösterilecek nafile (ör. ikindi/yatsı ilk sünneti).
          if (settings.showNafile) required.push(item);
        } else if (settings.showNafile) {
          optional.push(item);
        }
        break;
      case FREQUENCY.WEEKLY_FRIDAY:
        if (wd === 5) required.push(item);
        break;
      case FREQUENCY.OPTIONAL_WEEKLY_MON_THU:
        if (settings.showNafile && (wd === 1 || wd === 4)) optional.push(item);
        break;
      case FREQUENCY.OPTIONAL_MONTHLY:
        if (settings.showNafile) optional.push(item);
        break;
      case FREQUENCY.YEARLY_RAMADAN:
        if (isWithinRange(dateKey, settings.ramadanStart, settings.ramadanEnd)) required.push(item);
        break;
      case FREQUENCY.YEARLY_EID_RAMADAN:
        if (isWithinRange(dateKey, settings.eidRamadanStart, settings.eidRamadanEnd)) required.push(item);
        break;
      case FREQUENCY.YEARLY_EID_KURBAN:
        if (isWithinRange(dateKey, settings.eidKurbanStart, settings.eidKurbanEnd)) {
          if (item.id === 'kurban-bayram' && !settings.kurbanEligible) break;
          required.push(item);
        }
        break;
      case FREQUENCY.YEARLY_ONCE:
        yearlyReminders.push(item);
        break;
      default:
        break; // LIFETIME, OCCASIONAL: Bugün listesinde gösterilmez.
    }
  }

  return { required: groupForDisplay(required), optional: sortByTimeOfDay(optional), yearlyReminders };
}

// Nafile (opsiyonel) listesini, ibadetin `timeOrder` alanına göre (günün
// erken vaktinden geç vaktine) sıralar. timeOrder tanımlı olmayan kayıtlar
// listenin en sonuna, kendi aralarında orijinal sırayla düşer.
function sortByTimeOfDay(items) {
  return [...items].sort((a, b) => {
    const orderA = a.timeOrder ?? Infinity;
    const orderB = b.timeOrder ?? Infinity;
    return orderA - orderB;
  });
}

// Aynı vakte ait (aynı `group` alanına sahip) birden fazla kayıt varsa
// (ör. sünnet + farz), bunları "Bugün" listesinde tek satırlık bir grup
// nesnesine indirger. Yalnızca bir kayıt varsa (ör. nafile kapalıyken tek
// başına ikindi farzı) olduğu gibi bırakılır.
export function groupForDisplay(items) {
  const result = [];
  const groupIndex = new Map();
  for (const item of items) {
    if (!item.group) {
      result.push(item);
      continue;
    }
    if (groupIndex.has(item.group)) {
      const idx = groupIndex.get(item.group);
      const existing = result[idx];
      if (existing.isGroup) {
        existing.items.push(item);
      } else {
        result[idx] = { isGroup: true, groupKey: item.group, items: [existing, item] };
      }
    } else {
      groupIndex.set(item.group, result.length);
      result.push(item);
    }
  }
  return result;
}

export function getLifetimeItems(extraItems = []) {
  return [...IBADETLER, ...extraItems].filter((i) => i.frequency === FREQUENCY.LIFETIME);
}

export function getYearlyOnceItems(extraItems = []) {
  return [...IBADETLER, ...extraItems].filter((i) => i.frequency === FREQUENCY.YEARLY_ONCE);
}

export function getOccasionalItems(extraItems = []) {
  return [...IBADETLER, ...extraItems].filter((i) => i.frequency === FREQUENCY.OCCASIONAL);
}

export function getRecurringTrackableItems(extraItems = []) {
  return [...IBADETLER, ...extraItems].filter((i) => RECURRING_FREQUENCIES.includes(i.frequency));
}

// Verilen tarihte fiilen zorunlu olan günlük (farz/vacip/sünnet-i müekkede)
// ibadet id'lerini döner: normal günlerde sabit DAILY listesi, Cuma günleri
// öğle namazı öğeleri yerine Cuma namazı öğeleri ile. Seri/istatistik
// hesaplarında güne özgü doğru kıyas için kullanılır.
export function getDailyRequiredIdsForDate(dateKey) {
  const dailyIds = IBADETLER.filter((i) => i.frequency === FREQUENCY.DAILY).map((i) => i.id);
  if (weekday(new Date(dateKey)) !== 5) return dailyIds;
  const cumaIds = IBADETLER.filter((i) => i.frequency === FREQUENCY.WEEKLY_FRIDAY).map((i) => i.id);
  return [...dailyIds.filter((id) => !OGLE_DAILY_IDS.includes(id)), ...cumaIds];
}

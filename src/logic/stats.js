import { IBADETLER, FREQUENCY } from '../data/ibadetler';
import { todayKey, weekday } from './date';
import { OGLE_DAILY_IDS } from './schedule';

export function getDailyRequiredIds() {
  return IBADETLER.filter((i) => i.frequency === FREQUENCY.DAILY).map((i) => i.id);
}

function dateKeyOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return todayKey(d);
}

// itemIds: sabit bir id dizisi veya (dateKey) => id dizisi döner bir fonksiyon
// olabilir (ör. Cuma günleri öğle yerine Cuma namazı öğelerinin gerekmesi
// gibi güne bağlı zorunlu listeler için).
function dayCompletionRatio(byDate, dateKey, itemIds) {
  const dayMap = byDate[dateKey] || {};
  const ids = typeof itemIds === 'function' ? itemIds(dateKey) : itemIds;
  if (ids.length === 0) return 0;
  const done = ids.filter((id) => dayMap[id]).length;
  return done / ids.length;
}

// Bugünden geriye doğru, tüm günlük zorunlu ibadetlerin (%100) tamamlandığı
// kesintisiz gün sayısı.
export function currentStreak(byDate, itemIds) {
  let streak = 0;
  for (let i = 0; i < 3650; i++) {
    const dk = dateKeyOffset(i);
    const ratio = dayCompletionRatio(byDate, dk, itemIds);
    if (ratio >= 1) streak++;
    else break;
  }
  return streak;
}

// Son `days` gün için ortalama tamamlanma yüzdesi (0-100).
export function averageCompletion(byDate, itemIds, days = 7) {
  let total = 0;
  for (let i = 0; i < days; i++) {
    total += dayCompletionRatio(byDate, dateKeyOffset(i), itemIds);
  }
  return Math.round((total / days) * 100);
}

// Son `days` gün için her gün ayrı tamamlanma yüzdesini döner (grafik/liste için, eskiden yeniye).
export function dailyHistory(byDate, itemIds, days = 7) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const dk = dateKeyOffset(i);
    out.push({ dateKey: dk, ratio: dayCompletionRatio(byDate, dk, itemIds) });
  }
  return out;
}

// Belirli bir ibadetin son `days` gün içinde kaç kez işaretlendiği.
export function itemCountInLastDays(byDate, itemId, days = 30) {
  let count = 0;
  for (let i = 0; i < days; i++) {
    if (byDate[dateKeyOffset(i)]?.[itemId]) count++;
  }
  return count;
}

function countWeekdayOccurrences(days, weekdays) {
  let count = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (weekdays.includes(weekday(d))) count++;
  }
  return count;
}

// item'ın son `days` gün içinde takvimce kaç kez "uygulanabilir" olduğunu
// (haftanın hangi günlerine denk geldiğine göre) hesaplar; ibadet bazında
// istatistikte "X/Y gün" oranının paydasıdır. Kamerî takvime bağlı
// (OPTIONAL_MONTHLY) sıklıklar için sabit hesaplanamaz, null döner.
export function expectedOccurrences(item, days) {
  switch (item.frequency) {
    case FREQUENCY.WEEKLY_FRIDAY:
      return countWeekdayOccurrences(days, [5]);
    case FREQUENCY.OPTIONAL_WEEKLY_MON_THU:
      return countWeekdayOccurrences(days, [1, 4]);
    case FREQUENCY.DAILY:
    case FREQUENCY.OPTIONAL_DAILY:
      // Öğle namazı öğeleri Cuma günleri Cuma namazıyla yer değiştirir,
      // o günlerde "uygulanabilir" değildir.
      if (OGLE_DAILY_IDS.includes(item.id)) return days - countWeekdayOccurrences(days, [5]);
      return days;
    default:
      return null;
  }
}

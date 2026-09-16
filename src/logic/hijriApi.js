// Ramazan / Ramazan Bayramı / Kurban Bayramı tarihlerini otomatik getirmek için
// AlAdhan API'sini kullanır (https://aladhan.com/islamic-calendar-api). Hicri
// takvim hesaplaması burada YAPILMAZ — hesaplamayı servis yapar, biz yalnızca
// sonucu okuruz. Hesaplama tablo bazlıdır; Diyanet'in görüşe dayalı resmî
// ilan ettiği tarihlerden ±1 gün farklı olabilir.

const BASE = 'https://api.aladhan.com/v1';
const RAMADAN_MONTH = 9;
const SHAWWAL_MONTH = 10;
const DHUL_HIJJAH_MONTH = 12;

async function fetchJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error('Ağ hatası: internete bağlanılamadı.');
  }
  if (!res.ok) {
    throw new Error(`Takvim servisi hata döndürdü (HTTP ${res.status}).`);
  }
  const json = await res.json();
  if (json?.code !== 200 || !json?.data) {
    throw new Error('Takvim servisi beklenmeyen bir yanıt verdi.');
  }
  return json.data;
}

function gregorianDdMmYyyyToIso(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('-');
  return `${yyyy}-${mm}-${dd}`;
}

function isoToDdMmYyyy(iso) {
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}-${mm}-${yyyy}`;
}

function addDaysIso(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

async function currentHijriYear(todayIso) {
  const data = await fetchJson(`${BASE}/gToH?date=${isoToDdMmYyyy(todayIso)}`);
  return Number(data.hijri.year);
}

async function gregorianForHijri(day, month, hijriYear) {
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const data = await fetchJson(`${BASE}/hToG?date=${dd}-${mm}-${hijriYear}`);
  return gregorianDdMmYyyyToIso(data.gregorian.date);
}

async function eventsForHijriYear(hijriYear) {
  const [ramadanStart, eidRamadanStart, eidKurbanStart] = await Promise.all([
    gregorianForHijri(1, RAMADAN_MONTH, hijriYear),
    gregorianForHijri(1, SHAWWAL_MONTH, hijriYear),
    gregorianForHijri(10, DHUL_HIJJAH_MONTH, hijriYear),
  ]);
  return {
    ramadan: { start: ramadanStart, end: addDaysIso(eidRamadanStart, -1) },
    // Ramazan Bayramı: 1-3 Şevval (3 gün).
    eidRamadan: { start: eidRamadanStart, end: addDaysIso(eidRamadanStart, 2) },
    // Kurban Bayramı: 10-13 Zilhicce (4 gün).
    eidKurban: { start: eidKurbanStart, end: addDaysIso(eidKurbanStart, 3) },
  };
}

// Bugüne göre güncel/yaklaşan Ramazan, Ramazan Bayramı ve Kurban Bayramı
// tarihlerini döner. Bu yılki bir olay çoktan geçtiyse otomatik olarak bir
// sonraki hicri yıla bakar.
export async function fetchIslamicCalendarDates(todayIso) {
  const y = await currentHijriYear(todayIso);
  const [thisYear, nextYear] = await Promise.all([eventsForHijriYear(y), eventsForHijriYear(y + 1)]);

  const pick = (key) => {
    const a = thisYear[key];
    const b = nextYear[key];
    return a.end >= todayIso ? a : b;
  };

  const ramadan = pick('ramadan');
  const eidRamadan = pick('eidRamadan');
  const eidKurban = pick('eidKurban');

  return {
    ramadanStart: ramadan.start,
    ramadanEnd: ramadan.end,
    eidRamadanStart: eidRamadan.start,
    eidRamadanEnd: eidRamadan.end,
    eidKurbanStart: eidKurban.start,
    eidKurbanEnd: eidKurban.end,
  };
}

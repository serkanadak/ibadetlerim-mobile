import { fetchIslamicCalendarDates } from '../hijriApi';

// Gerçek AlAdhan API'sini çağırmadan, hicri yıl seçim mantığını (bu yılki
// olay geçtiyse bir sonraki hicri yıla bakma) test etmek için fetch mock'lanır.
const HIJRI_EVENTS = {
  1447: { ramadanStart: '18-02-2026', shawwalStart: '20-03-2026', dhulHijjah10: '27-05-2026' },
  1448: { ramadanStart: '08-02-2027', shawwalStart: '09-03-2027', dhulHijjah10: '16-05-2027' },
};

function mockFetchImpl(url) {
  const u = new URL(url);
  if (u.pathname === '/v1/gToH') {
    return { code: 200, data: { hijri: { year: '1447' } } };
  }
  if (u.pathname === '/v1/hToG') {
    const [dd, mm, yyyy] = u.searchParams.get('date').split('-');
    const events = HIJRI_EVENTS[yyyy];
    let dateStr;
    if (mm === '09') dateStr = events.ramadanStart;
    else if (mm === '10') dateStr = events.shawwalStart;
    else if (mm === '12') dateStr = events.dhulHijjah10;
    return { code: 200, data: { gregorian: { date: dateStr } } };
  }
  throw new Error(`beklenmeyen istek: ${url}`);
}

beforeEach(() => {
  global.fetch = jest.fn(async (url) => ({
    ok: true,
    status: 200,
    json: async () => mockFetchImpl(url),
  }));
});

afterEach(() => {
  delete global.fetch;
});

describe('fetchIslamicCalendarDates', () => {
  test('bu yılki olaylar henüz geçmediyse mevcut hicri yılın tarihlerini kullanır', async () => {
    const result = await fetchIslamicCalendarDates('2026-01-01');
    expect(result.ramadanStart).toBe('2026-02-18');
    expect(result.eidRamadanStart).toBe('2026-03-20');
    expect(result.eidKurbanStart).toBe('2026-05-27');
  });

  test('ramazan bitişi, bayram başlangıcından bir gün öncesidir', async () => {
    const result = await fetchIslamicCalendarDates('2026-01-01');
    expect(result.ramadanEnd).toBe('2026-03-19');
  });

  test('ramazan bayramı 3 gün sürer (başlangıç + 2)', async () => {
    const result = await fetchIslamicCalendarDates('2026-01-01');
    expect(result.eidRamadanEnd).toBe('2026-03-22');
  });

  test('kurban bayramı 4 gün sürer (başlangıç + 3)', async () => {
    const result = await fetchIslamicCalendarDates('2026-01-01');
    expect(result.eidKurbanEnd).toBe('2026-05-30');
  });

  test('bu yılki tüm olaylar geçtiyse bir sonraki hicri yıla geçer', async () => {
    // 2026-07-08, 1447 yılının kurban bayramı bitişinden (2026-05-30) sonra.
    const result = await fetchIslamicCalendarDates('2026-07-08');
    expect(result.ramadanStart).toBe('2027-02-08');
    expect(result.eidRamadanStart).toBe('2027-03-09');
    expect(result.eidKurbanStart).toBe('2027-05-16');
  });

  test('yalnızca ramazan geçmişse yalnızca ramazan bir sonraki yıla geçer, bayramlar aynı kalır', async () => {
    // 2026-03-25: ramazan (bitiş 2026-03-19) geçti, ama ramazan bayramı (bitiş 2026-03-22) da geçti.
    // Daha kesin bir ara durum için ramazan bitmiş fakat kurban bayramı henüz gelmemiş bir tarih seçelim.
    const result = await fetchIslamicCalendarDates('2026-03-25');
    expect(result.ramadanStart).toBe('2027-02-08'); // ramazan geçti → gelecek yıl
    expect(result.eidKurbanStart).toBe('2026-05-27'); // kurban bayramı henüz gelmedi → bu yıl
  });

  test('ağ hatasında anlamlı bir hata fırlatır', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('network down');
    });
    await expect(fetchIslamicCalendarDates('2026-01-01')).rejects.toThrow('Ağ hatası');
  });

  test('HTTP hatasında anlamlı bir hata fırlatır', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 500 }));
    await expect(fetchIslamicCalendarDates('2026-01-01')).rejects.toThrow('HTTP 500');
  });
});

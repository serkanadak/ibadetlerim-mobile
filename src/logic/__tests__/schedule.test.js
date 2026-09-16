import { getTodaySchedule, groupForDisplay, getDailyRequiredIdsForDate, getRecurringTrackableItems } from '../schedule';
import { HUKUM, FREQUENCY, CATEGORY } from '../../data/ibadetler';

const baseSettings = {
  gender: 'male',
  showNafile: false,
  kurbanEligible: false,
  ramadanStart: '',
  ramadanEnd: '',
  eidRamadanStart: '',
  eidRamadanEnd: '',
  eidKurbanStart: '',
  eidKurbanEnd: '',
};

function flatIds(list) {
  const ids = [];
  for (const entry of list) {
    if (entry.isGroup) ids.push(...entry.items.map((i) => i.id));
    else ids.push(entry.id);
  }
  return ids;
}

describe('groupForDisplay', () => {
  test('aynı group alanına sahip 2+ kaydı tek grup nesnesine indirger', () => {
    const items = [
      { id: 'a', group: 'x' },
      { id: 'b', group: 'x' },
      { id: 'c', group: 'y' },
    ];
    const result = groupForDisplay(items);
    expect(result).toHaveLength(2);
    expect(result[0].isGroup).toBe(true);
    expect(result[0].items.map((i) => i.id)).toEqual(['a', 'b']);
    expect(result[1].isGroup).toBeUndefined();
    expect(result[1].id).toBe('c');
  });

  test('grupsuz kayıtları oldukları gibi bırakır', () => {
    const items = [{ id: 'a' }, { id: 'b' }];
    expect(groupForDisplay(items)).toEqual(items);
  });

  test('bir group içinde tek kayıt varsa grup nesnesine çevirmez', () => {
    const items = [{ id: 'a', group: 'solo' }];
    const result = groupForDisplay(items);
    expect(result).toEqual(items);
  });
});

describe('getTodaySchedule', () => {
  test('normal bir hafta içi günde 5 vakit + vitir grupları zorunlu listede olur', () => {
    // 2026-07-08 Çarşamba.
    const { required } = getTodaySchedule({ dateKey: '2026-07-08', settings: baseSettings });
    const ids = flatIds(required);
    expect(ids).toContain('namaz-sabah-farz');
    expect(ids).toContain('namaz-ogle-farz');
    expect(ids).toContain('namaz-ikindi-farz');
    expect(ids).toContain('namaz-aksam-farz');
    expect(ids).toContain('namaz-yatsi-farz');
    expect(ids).toContain('namaz-vitir');
    expect(ids).not.toContain('namaz-cuma-farz');
  });

  test('Cuma günü Cuma namazı (ilk sünnet + farz + son sünnet) zorunlu listeye eklenir, öğle namazı tamamen çıkarılır', () => {
    // 2026-07-10 Cuma.
    const { required } = getTodaySchedule({ dateKey: '2026-07-10', settings: baseSettings });
    const ids = flatIds(required);
    expect(ids).toContain('namaz-cuma-ilk-sunnet');
    expect(ids).toContain('namaz-cuma-farz');
    expect(ids).toContain('namaz-cuma-son-sunnet');
    expect(ids).not.toContain('namaz-ogle-ilk-sunnet');
    expect(ids).not.toContain('namaz-ogle-farz');
    expect(ids).not.toContain('namaz-ogle-son-sunnet');
  });

  test('Cuma günü öğle grubu (ogle groupKey) yalnızca Cuma öğelerinden oluşur', () => {
    const { required } = getTodaySchedule({ dateKey: '2026-07-10', settings: baseSettings });
    const ogleGroup = required.find((e) => e.isGroup && e.groupKey === 'ogle');
    expect(ogleGroup).toBeDefined();
    expect(ogleGroup.items.map((i) => i.id)).toEqual([
      'namaz-cuma-ilk-sunnet',
      'namaz-cuma-farz',
      'namaz-cuma-son-sunnet',
    ]);
  });

  test('hafta içi bir günde Cuma namazı öğeleri zorunlu listede olmaz', () => {
    // 2026-07-08 Çarşamba.
    const { required } = getTodaySchedule({ dateKey: '2026-07-08', settings: baseSettings });
    const ids = flatIds(required);
    expect(ids).not.toContain('namaz-cuma-ilk-sunnet');
    expect(ids).not.toContain('namaz-cuma-farz');
    expect(ids).not.toContain('namaz-cuma-son-sunnet');
  });

  test('showNafile kapalıyken nafile öğeler ne required ne optional listede olur', () => {
    const { required, optional } = getTodaySchedule({ dateKey: '2026-07-08', settings: baseSettings });
    expect(flatIds(required)).not.toContain('namaz-teheccud');
    expect(optional.map((i) => i.id)).not.toContain('namaz-teheccud');
  });

  test('showNafile açıkken grup alanlı nafile ilgili vaktin satırına eklenir', () => {
    const settings = { ...baseSettings, showNafile: true };
    const { required } = getTodaySchedule({ dateKey: '2026-07-08', settings });
    const ikindiGroup = required.find((e) => e.isGroup && e.groupKey === 'ikindi');
    expect(ikindiGroup).toBeDefined();
    expect(ikindiGroup.items.map((i) => i.id)).toEqual(['namaz-ikindi-sunnet', 'namaz-ikindi-farz']);
  });

  test('showNafile açıkken group alanı olmayan nafileler optional listede olur', () => {
    const settings = { ...baseSettings, showNafile: true };
    const { optional } = getTodaySchedule({ dateKey: '2026-07-08', settings });
    expect(optional.map((i) => i.id)).toContain('namaz-teheccud');
  });

  test('ramazan aralığındaki günde ramazan orucu ve teravih zorunlu listede olur', () => {
    const settings = { ...baseSettings, ramadanStart: '2026-03-01', ramadanEnd: '2026-03-29' };
    const { required } = getTodaySchedule({ dateKey: '2026-03-15', settings });
    const ids = flatIds(required);
    expect(ids).toContain('oruc-ramazan');
    expect(ids).toContain('namaz-teravih');
  });

  test('ramazan aralığı dışındaki günde ramazan orucu görünmez', () => {
    const settings = { ...baseSettings, ramadanStart: '2026-03-01', ramadanEnd: '2026-03-29' };
    const { required } = getTodaySchedule({ dateKey: '2026-07-08', settings });
    expect(flatIds(required)).not.toContain('oruc-ramazan');
  });

  test('kurbanEligible false iken bayram aralığında bile kurban zorunlu listeye girmez', () => {
    const settings = { ...baseSettings, eidKurbanStart: '2026-06-16', eidKurbanEnd: '2026-06-19', kurbanEligible: false };
    const { required } = getTodaySchedule({ dateKey: '2026-06-17', settings });
    expect(flatIds(required)).not.toContain('kurban-bayram');
  });

  test('kurbanEligible true iken bayram aralığında kurban zorunlu listeye girer', () => {
    const settings = { ...baseSettings, eidKurbanStart: '2026-06-16', eidKurbanEnd: '2026-06-19', kurbanEligible: true };
    const { required } = getTodaySchedule({ dateKey: '2026-06-17', settings });
    expect(flatIds(required)).toContain('kurban-bayram');
  });

  test('yearly_once ibadetler yearlyReminders listesine düşer, required içinde olmaz', () => {
    const { required, yearlyReminders } = getTodaySchedule({ dateKey: '2026-07-08', settings: baseSettings });
    expect(yearlyReminders.map((i) => i.id)).toContain('zekat-mal');
    expect(flatIds(required)).not.toContain('zekat-mal');
  });

  test('showNafile açıkken opsiyonel liste günün vaktine göre (timeOrder artan) sıralanır', () => {
    // 2026-07-08 Çarşamba.
    const settings = { ...baseSettings, showNafile: true };
    const { optional } = getTodaySchedule({ dateKey: '2026-07-08', settings });
    const orders = optional.map((i) => i.timeOrder ?? Infinity);
    const sortedOrders = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sortedOrders);

    const ids = optional.map((i) => i.id);
    expect(ids.indexOf('namaz-kusluk')).toBeLessThan(ids.indexOf('namaz-evvabin'));
    expect(ids.indexOf('namaz-evvabin')).toBeLessThan(ids.indexOf('zikir-mulk-suresi'));
    expect(ids.indexOf('zikir-mulk-suresi')).toBeLessThan(ids.indexOf('namaz-teheccud'));
    expect(ids.indexOf('namaz-teheccud')).toBeLessThan(ids.indexOf('zikir-istigfar'));
  });

  test('extraItems (ilave ibadetler) frequency=daily ise zorunlu listeye dahil olur', () => {
    const custom = {
      id: 'custom-1',
      title: 'Test',
      category: CATEGORY.DIGER,
      hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
      frequency: FREQUENCY.DAILY,
      custom: true,
    };
    const { required } = getTodaySchedule({ dateKey: '2026-07-08', settings: baseSettings, extraItems: [custom] });
    expect(flatIds(required)).toContain('custom-1');
  });
});

describe('getDailyRequiredIdsForDate', () => {
  test('hafta içi bir günde öğle öğelerini içerir, Cuma öğelerini içermez', () => {
    // 2026-07-08 Çarşamba.
    const ids = getDailyRequiredIdsForDate('2026-07-08');
    expect(ids).toContain('namaz-ogle-farz');
    expect(ids).not.toContain('namaz-cuma-farz');
  });

  test('Cuma günü Cuma öğelerini içerir, öğle öğelerini içermez', () => {
    // 2026-07-10 Cuma.
    const ids = getDailyRequiredIdsForDate('2026-07-10');
    expect(ids).toContain('namaz-cuma-ilk-sunnet');
    expect(ids).toContain('namaz-cuma-farz');
    expect(ids).toContain('namaz-cuma-son-sunnet');
    expect(ids).not.toContain('namaz-ogle-ilk-sunnet');
    expect(ids).not.toContain('namaz-ogle-farz');
    expect(ids).not.toContain('namaz-ogle-son-sunnet');
  });

  test('hafta içi ve Cuma günü listeleri aynı uzunlukta olur (öğle 3 öğe <-> Cuma 3 öğe)', () => {
    expect(getDailyRequiredIdsForDate('2026-07-08').length).toBe(getDailyRequiredIdsForDate('2026-07-10').length);
  });
});

describe('getRecurringTrackableItems', () => {
  test('farz/vacip/sünnet-i müekkede günlük öğeleri içerir', () => {
    const ids = getRecurringTrackableItems().map((i) => i.id);
    expect(ids).toContain('namaz-sabah-farz');
    expect(ids).toContain('namaz-cuma-farz');
  });

  test('nafile (opsiyonel günlük/haftalık/aylık) öğeleri içerir', () => {
    const ids = getRecurringTrackableItems().map((i) => i.id);
    expect(ids).toContain('namaz-teheccud');
    expect(ids).toContain('oruc-pazartesi-persembe');
    expect(ids).toContain('oruc-eyyam-i-biyz');
  });

  test('ömürde bir, yılda bir ve mevsimsel (ramazan/bayram) öğeleri içermez', () => {
    const ids = getRecurringTrackableItems().map((i) => i.id);
    expect(ids).not.toContain('hac-farz');
    expect(ids).not.toContain('zekat-mal');
    expect(ids).not.toContain('oruc-ramazan');
    expect(ids).not.toContain('namaz-cenaze');
  });

  test('extraItems (ilave ibadetler) uygun sıklıktaysa listeye dahil olur', () => {
    const custom = {
      id: 'custom-1',
      title: 'Test',
      category: CATEGORY.DIGER,
      hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
      frequency: FREQUENCY.OPTIONAL_DAILY,
      custom: true,
    };
    const ids = getRecurringTrackableItems([custom]).map((i) => i.id);
    expect(ids).toContain('custom-1');
  });
});

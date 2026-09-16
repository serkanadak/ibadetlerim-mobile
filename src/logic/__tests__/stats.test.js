import { getDailyRequiredIds, currentStreak, averageCompletion, dailyHistory, itemCountInLastDays, expectedOccurrences } from '../stats';
import { todayKey } from '../date';
import { FREQUENCY } from '../../data/ibadetler';

function keyFor(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return todayKey(d);
}

describe('getDailyRequiredIds', () => {
  test('en az 5 vakit farz + vitir içerir', () => {
    const ids = getDailyRequiredIds();
    expect(ids).toContain('namaz-sabah-farz');
    expect(ids).toContain('namaz-vitir');
    expect(ids.length).toBeGreaterThanOrEqual(11); // sünnet-i müekkedeler dahil
  });
});

describe('currentStreak', () => {
  const ids = ['a', 'b'];

  test('hiç işaretleme yoksa seri 0 olur', () => {
    expect(currentStreak({}, ids)).toBe(0);
  });

  test('bugün ve dün tam, önceki gün eksikse seri 2 olur', () => {
    const byDate = {
      [keyFor(0)]: { a: true, b: true },
      [keyFor(1)]: { a: true, b: true },
      [keyFor(2)]: { a: true, b: false },
    };
    expect(currentStreak(byDate, ids)).toBe(2);
  });

  test('bugün eksikse seri 0 olur (dün tam olsa bile)', () => {
    const byDate = {
      [keyFor(0)]: { a: true, b: false },
      [keyFor(1)]: { a: true, b: true },
    };
    expect(currentStreak(byDate, ids)).toBe(0);
  });

  test('itemIds bir fonksiyon olduğunda güne özgü gerekli id listesini kullanır', () => {
    // dün 'a' gerekiyordu ve işaretlenmedi, ama bugünün listesinde 'a' yok — seri kırılmamalı.
    const getIdsForDate = (dateKey) => (dateKey === keyFor(1) ? ['b'] : ['a', 'b']);
    const byDate = {
      [keyFor(0)]: { a: true, b: true },
      [keyFor(1)]: { b: true },
    };
    expect(currentStreak(byDate, getIdsForDate)).toBe(2);
  });
});

describe('averageCompletion', () => {
  test('son N günün ortalama yüzdesini hesaplar', () => {
    const ids = ['a', 'b'];
    const byDate = {
      [keyFor(0)]: { a: true, b: true }, // %100
      [keyFor(1)]: { a: true, b: false }, // %50
    };
    expect(averageCompletion(byDate, ids, 2)).toBe(75);
  });

  test('boş veriyle 0 döner', () => {
    expect(averageCompletion({}, ['a', 'b'], 3)).toBe(0);
  });
});

describe('dailyHistory', () => {
  test('eskiden yeniye sıralı, istenen uzunlukta dizi döner', () => {
    const history = dailyHistory({}, ['a'], 5);
    expect(history).toHaveLength(5);
    expect(history[4].dateKey).toBe(keyFor(0));
    expect(history[0].dateKey).toBe(keyFor(4));
  });
});

describe('itemCountInLastDays', () => {
  test('son N gün içinde işaretli olduğu gün sayısını döner', () => {
    const byDate = {
      [keyFor(0)]: { a: true },
      [keyFor(1)]: { a: false },
      [keyFor(2)]: { a: true },
    };
    expect(itemCountInLastDays(byDate, 'a', 3)).toBe(2);
  });
});

describe('expectedOccurrences', () => {
  test('DAILY (öğle grubu dışında) her gün uygulanabilir sayılır', () => {
    expect(expectedOccurrences({ id: 'namaz-sabah-farz', frequency: FREQUENCY.DAILY }, 30)).toBe(30);
  });

  test('öğle namazı öğeleri herhangi 7 günlük pencerede 1 Cuma günü hariç tutulur (6/7)', () => {
    // Her 7 günlük pencere haftanın her gününden tam bir kez içerir.
    expect(expectedOccurrences({ id: 'namaz-ogle-farz', frequency: FREQUENCY.DAILY }, 7)).toBe(6);
  });

  test('WEEKLY_FRIDAY herhangi 7 günlük pencerede tam olarak 1 kez uygulanabilir', () => {
    expect(expectedOccurrences({ id: 'namaz-cuma-farz', frequency: FREQUENCY.WEEKLY_FRIDAY }, 7)).toBe(1);
  });

  test('OPTIONAL_WEEKLY_MON_THU herhangi 7 günlük pencerede tam olarak 2 kez uygulanabilir', () => {
    expect(
      expectedOccurrences({ id: 'oruc-pazartesi-persembe', frequency: FREQUENCY.OPTIONAL_WEEKLY_MON_THU }, 7)
    ).toBe(2);
  });

  test('OPTIONAL_MONTHLY (kamerî takvime bağlı) için sabit hesaplanamaz, null döner', () => {
    expect(expectedOccurrences({ id: 'oruc-eyyam-i-biyz', frequency: FREQUENCY.OPTIONAL_MONTHLY }, 30)).toBeNull();
  });
});

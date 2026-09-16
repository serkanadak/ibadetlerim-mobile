import { buildBackup, parseBackup, mergeBackup, backupStats, countMarks } from '../backup';

const veri = () => ({
  byDate: {
    '2026-08-01': { sabah: true, aksam: true },
    '2026-08-02': { sabah: true, ogle: false },
  },
  byYear: { 2026: { zekat: true } },
  lifetime: { hac: true },
  customItems: [{ id: 'c1', title: 'Tesbih' }],
  settings: { gender: 'male', showNafile: true },
});

describe('yedek oluşturma / okuma', () => {
  test('oluşturulan yedek geri okunabilir', () => {
    const p = parseBackup(buildBackup(veri()));
    expect(p.error).toBeUndefined();
    expect(p.data.byDate['2026-08-01'].sabah).toBe(true);
    expect(p.data.customItems).toHaveLength(1);
    expect(p.data.settings.showNafile).toBe(true);
  });

  test('bozuk metin anlaşılır hata verir', () => {
    expect(parseBackup('bu json değil').error).toMatch(/Geçersiz JSON/);
    expect(parseBackup('[]').error).toMatch(/Tanınmayan/);
    expect(parseBackup('{"app":"baska"}').error).toMatch(/başka bir uygulamaya/);
    expect(parseBackup('{"foo":1}').error).toMatch(/tanınabilir bir veri/);
  });

  test('eski biçim (data sarmalayıcısı olmayan) yedek de okunur', () => {
    const p = parseBackup(JSON.stringify(veri()));
    expect(p.error).toBeUndefined();
    expect(p.data.byYear['2026'].zekat).toBe(true);
  });
});

describe('birleştirme — HİÇBİR işaret silinmez', () => {
  test('yedekteki eksik günler eklenir, mevcut işaretler korunur', () => {
    const mevcut = {
      byDate: { '2026-08-05': { sabah: true } },
      byYear: {},
      lifetime: {},
      customItems: [],
      settings: {},
    };
    const yedek = veri();
    const { data, added } = mergeBackup(mevcut, yedek);
    // mevcut gün duruyor
    expect(data.byDate['2026-08-05'].sabah).toBe(true);
    // yedekteki günler geldi
    expect(data.byDate['2026-08-01'].sabah).toBe(true);
    expect(data.byDate['2026-08-02'].sabah).toBe(true);
    expect(added.days).toBe(2);
    expect(added.marks).toBe(3);
  });

  test('eski bir yedek, sonradan eklenen işaretleri SİLMEZ', () => {
    // Kullanıcı yedek aldıktan sonra yeni günler işaretledi.
    const yedek = { byDate: { '2026-08-01': { sabah: true } }, customItems: [] };
    const mevcut = {
      byDate: { '2026-08-01': { sabah: true }, '2026-08-09': { sabah: true, aksam: true } },
      byYear: {},
      lifetime: {},
      customItems: [],
      settings: {},
    };
    const { data } = mergeBackup(mevcut, yedek);
    expect(data.byDate['2026-08-09']).toEqual({ sabah: true, aksam: true });
    expect(countMarks(data.byDate)).toBe(3);
  });

  test('bir tarafta true diğerinde false ise true kazanır', () => {
    const a = { byDate: { g: { x: true } } };
    const b = { byDate: { g: { x: false } } };
    expect(mergeBackup(a, b).data.byDate.g.x).toBe(true);
    expect(mergeBackup(b, a).data.byDate.g.x).toBe(true);
  });

  test('aynı kimlikli ilave ibadet çiftlenmez', () => {
    const a = { customItems: [{ id: 'c1', title: 'Tesbih' }] };
    const b = { customItems: [{ id: 'c1', title: 'Tesbih' }, { id: 'c2', title: 'Kuran' }] };
    const { data, added } = mergeBackup(a, b);
    expect(data.customItems.map((i) => i.id)).toEqual(['c1', 'c2']);
    expect(added.custom).toBe(1);
  });

  test('ayarlar birleşir: yedekte olmayan ayar korunur', () => {
    const a = { settings: { gender: 'female', kazaStartDate: '2020-01-01' } };
    const b = { settings: { gender: 'male' } };
    const { data } = mergeBackup(a, b);
    expect(data.settings.gender).toBe('male'); // yedekteki geçerli
    expect(data.settings.kazaStartDate).toBe('2020-01-01'); // mevcut korundu
  });

  test('boş yedek mevcut veriyi bozmaz', () => {
    const mevcut = veri();
    const { data } = mergeBackup(mevcut, {});
    expect(countMarks(data.byDate)).toBe(countMarks(mevcut.byDate));
    expect(data.customItems).toHaveLength(1);
    expect(data.lifetime.hac).toBe(true);
  });

  test('aynı yedeği iki kez yüklemek bir şey değiştirmez', () => {
    const bir = mergeBackup(veri(), veri()).data;
    const iki = mergeBackup(bir, veri()).data;
    expect(iki).toEqual(bir);
  });
});

describe('istatistik', () => {
  test('işaretli gün, işaret ve aralık doğru sayılır', () => {
    const s = backupStats(veri());
    expect(s.days).toBe(2); // ikisinde de en az bir true var
    expect(s.marks).toBe(3);
    expect(s.custom).toBe(1);
    expect(s.lifetime).toBe(1);
    expect(s.first).toBe('2026-08-01');
    expect(s.last).toBe('2026-08-02');
  });

  test('hiç işaret yoksa gün sayılmaz', () => {
    const s = backupStats({ byDate: { '2026-08-01': { sabah: false } } });
    expect(s.days).toBe(0);
    expect(s.marks).toBe(0);
    expect(s.first).toBeNull();
  });
});

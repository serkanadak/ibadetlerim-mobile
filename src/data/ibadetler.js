// Sünni itikat (Hanefi fıkhı esaslı) ibadet veri modeli.
// Kaynak: ../../../docs/ibadetler-farz-vacip-sunnet.md

export const HUKUM = {
  FARZ_AYN: 'farz_ayn',
  FARZ_KIFAYE: 'farz_kifaye',
  VACIP: 'vacip',
  SUNNET_MUEKKEDE: 'sunnet_muekkede',
  SUNNET_GAYRIMUEKKEDE: 'sunnet_gayrimuekkede',
};

export const HUKUM_META = {
  [HUKUM.FARZ_AYN]: { label: 'Farz', short: 'F', order: 0 },
  [HUKUM.FARZ_KIFAYE]: { label: 'Farz-ı Kifaye', short: 'FK', order: 1 },
  [HUKUM.VACIP]: { label: 'Vacip', short: 'V', order: 2 },
  [HUKUM.SUNNET_MUEKKEDE]: { label: 'Sünnet (Müekkede)', short: 'S', order: 3 },
  [HUKUM.SUNNET_GAYRIMUEKKEDE]: { label: 'Sünnet (Nafile)', short: 'N', order: 4 },
};

export const CATEGORY = {
  NAMAZ: 'namaz',
  ORUC: 'oruc',
  ZEKAT: 'zekat',
  HAC: 'hac',
  KURBAN: 'kurban',
  ZIKIR: 'zikir',
  DIGER: 'diger',
};

export const CATEGORY_META = {
  [CATEGORY.NAMAZ]: { label: 'Namaz', icon: '🕌' },
  [CATEGORY.ORUC]: { label: 'Oruç', icon: '🌙' },
  [CATEGORY.ZEKAT]: { label: 'Zekât', icon: '🤲' },
  [CATEGORY.HAC]: { label: 'Hac & Umre', icon: '🕋' },
  [CATEGORY.KURBAN]: { label: 'Kurban', icon: '🐑' },
  [CATEGORY.ZIKIR]: { label: 'Zikir & Dua', icon: '📿' },
  [CATEGORY.DIGER]: { label: 'Diğer (İlave)', icon: '➕' },
};

// Aynı vakte ait farz + sünnet kayıtlarını "Bugün" listesinde tek satırda
// göstermek için kullanılan vakit grubu etiketleri.
export const NAMAZ_GROUP_LABELS = {
  sabah: 'Sabah Namazı',
  ogle: 'Öğle Namazı',
  ikindi: 'İkindi Namazı',
  aksam: 'Akşam Namazı',
  yatsi: 'Yatsı Namazı',
};

// frequency: takvimde ne zaman "bugün yapılacaklar" listesine düşeceğini belirler.
export const FREQUENCY = {
  DAILY: 'daily', // her gün
  OPTIONAL_DAILY: 'optional_daily', // her gün, ama varsayılan gizli/opsiyonel nafile
  WEEKLY_FRIDAY: 'weekly_friday', // yalnızca Cuma günü
  OPTIONAL_WEEKLY_MON_THU: 'optional_weekly_mon_thu', // pazartesi & perşembe, opsiyonel
  OPTIONAL_MONTHLY: 'optional_monthly', // ayda birkaç gün (kameri, kullanıcı kendi takip eder)
  YEARLY_RAMADAN: 'yearly_ramadan', // Ayarlar'da girilen Ramazan tarih aralığında her gün
  YEARLY_EID_RAMADAN: 'yearly_eid_ramadan', // Ayarlar'da girilen Ramazan Bayramı günü/aralığı
  YEARLY_EID_KURBAN: 'yearly_eid_kurban', // Ayarlar'da girilen Kurban Bayramı günü/aralığı
  YEARLY_ONCE: 'yearly_once', // yılda bir kez, kullanıcı manuel işaretler (takvime bağlı değil)
  LIFETIME: 'lifetime', // ömürde bir kez, manuel işaretlenir
  OCCASIONAL: 'occasional', // duruma bağlı (örn. cenaze namazı), günlük listeye girmez, yalnızca bilgi amaçlı
};

// gender: 'all' | 'male' | 'female' | 'male_farz_female_nafile'
// summary: ibadetin anlamı (neden yapıldığı) ve genel hatlarıyla nasıl yapıldığına
// dair kısa bir özet — Kategoriler ekranından ibadet detayına girildiğinde gösterilir.
export const IBADETLER = [
  // ---- NAMAZ ----
  {
    id: 'namaz-sabah-sunnet',
    title: 'Sabah Namazı Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.DAILY,
    rekat: 2,
    gender: 'all',
    group: 'sabah',
    description: 'Sabah farzından önce kılınır. Terki mekruh sayılan sünnet-i müekkededir.',
    summary:
      'Sabah namazının vaktine girerken kılınan, Hz. Peygamber\'in hiç terk etmediği rivayet edilen bir sünnettir. Sabah farzından önce, tek başına ve kıraati içinden okuyarak 2 rekât olarak kılınır.',
  },
  {
    id: 'namaz-sabah-farz',
    title: 'Sabah Namazı Farzı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.DAILY,
    rekat: 2,
    gender: 'all',
    group: 'sabah',
    description: 'Günün 5 vakit farz namazından ilkidir.',
    summary:
      'Günün ilk farz namazı olup Allah\'a kulluğun günün başında tazelenmesini ifade eder. Niyet edilip iftitah tekbiriyle başlanır, her rekâtta Fatiha ve bir sûre okunarak rükû-secde ile 2 rekât kılınıp selamla bitirilir.',
  },
  {
    id: 'namaz-kusluk',
    title: 'Kuşluk (Duhâ) Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    rekat: 2,
    gender: 'all',
    timingLabel: 'Güneş Doğduktan Sonra',
    timeOrder: 1,
    description:
      'Güneş bir mızrak boyu yükseldikten (yaklaşık gün doğumundan 45-50 dakika sonra) öğle vaktine kadar kılınabilen, en az 2 rekât sünnet-i gayr-i müekkede (nafile) namaz.',
    summary:
      'Günün bereketi ve şükrü için tavsiye edilen, bir rivayete göre vücuttaki her eklemin sadakası yerine geçtiği bildirilen bir nafiledir. Güneş doğup bir mızrak boyu yükseldikten öğle vaktine yaklaşana kadar, en az 2, dilenirse 4 veya 8 rekâta kadar, ikişer rekâtlık selamlarla kılınır.',
  },
  {
    id: 'namaz-ogle-ilk-sunnet',
    title: 'Öğle Namazı İlk Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.DAILY,
    rekat: 4,
    gender: 'all',
    group: 'ogle',
    description: 'Öğle farzından önce kılınan 4 rekât sünnet-i müekkede.',
    summary:
      'Öğle vaktine girerken nafile ibadetle Allah\'a yönelişi pekiştiren sünnet-i müekkededir. Farzdan önce, tek başına, kıraati içinden okuyarak 4 rekât (iki selamla) kılınır.',
  },
  {
    id: 'namaz-ogle-farz',
    title: 'Öğle Namazı Farzı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.DAILY,
    rekat: 4,
    gender: 'all',
    group: 'ogle',
    description: '5 vakit farz namazdan biri.',
    summary:
      'Günün ortasında, dünya işlerinin arasında kulu Rabbine yeniden bağlayan farz namazdır. Cemaatle veya tek başına, kıraati içinden okuyarak 4 rekât olarak kılınır.',
  },
  {
    id: 'namaz-ogle-son-sunnet',
    title: 'Öğle Namazı Son Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.DAILY,
    rekat: 2,
    gender: 'all',
    group: 'ogle',
    description: 'Öğle farzından sonra kılınan 2 rekât sünnet-i müekkede.',
    summary:
      'Öğle farzının hemen ardından kılınıp o vaktin sünnetini tamamlayan sünnet-i müekkededir. Farzdan sonra, içinden okuyarak, 2 rekât olarak kılınır.',
  },
  {
    id: 'namaz-ikindi-sunnet',
    title: 'İkindi Namazı Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    rekat: 4,
    gender: 'all',
    group: 'ikindi',
    timingLabel: 'İkindiden Önce',
    timeOrder: 2,
    description: 'İkindi farzından önce kılınan 4 rekât, sünnet-i gayr-i müekkede (nafile).',
    summary:
      'Hz. Peygamber\'in ara sıra kıldığı, terkinde günah olmayan fakat sevabı büyük olan bir nafiledir. İkindi farzından önce, içinden okuyarak, 4 rekât (iki selamla) kılınır.',
  },
  {
    id: 'namaz-ikindi-farz',
    title: 'İkindi Namazı Farzı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.DAILY,
    rekat: 4,
    gender: 'all',
    group: 'ikindi',
    description: '5 vakit farz namazdan biri.',
    summary:
      'Kur\'an\'da "orta namaz" olarak özellikle vurgulanan, günün en meşgul saatinde bile ihmal edilmemesi öğütlenen farz namazdır. İçinden okuyarak 4 rekât olarak kılınır.',
  },
  {
    id: 'namaz-aksam-farz',
    title: 'Akşam Namazı Farzı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.DAILY,
    rekat: 3,
    gender: 'all',
    group: 'aksam',
    description: '5 vakit farz namazdan biri.',
    summary:
      'Gündüzün bitip gecenin başladığı anda kılınan, günün şükrünü ifade eden farz namazdır. İlk iki rekâtı açıktan (cemaatle kılınırken), üçüncü rekâtı içinden okunarak kılınır.',
  },
  {
    id: 'namaz-aksam-sunnet',
    title: 'Akşam Namazı Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.DAILY,
    rekat: 2,
    gender: 'all',
    group: 'aksam',
    description: 'Akşam farzından sonra kılınan 2 rekât sünnet-i müekkede.',
    summary:
      'Akşam farzının hemen peşinden kılınıp günün namazını nafile ile taçlandıran sünnet-i müekkededir. Farzdan sonra içinden okuyarak 2 rekât kılınır.',
  },
  {
    id: 'namaz-evvabin',
    title: 'Evvâbin Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    rekat: 6,
    gender: 'all',
    timingLabel: 'Akşamdan Sonra',
    timeOrder: 3,
    description: 'Akşam namazının sünnetinden sonra kılınan nafile (2\'şer veya 4+2 rekât).',
    summary:
      '"Evvâbîn" (Allah\'a sürekli dönenler) adıyla anılan, akşamla yatsı arasındaki vakti değerlendiren faziletli bir nafiledir. Akşam sünnetinden sonra, ikişer rekâtlık selamlarla toplam 6 rekât olarak kılınır.',
  },
  {
    id: 'namaz-yatsi-ilk-sunnet',
    title: 'Yatsı Namazı İlk Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    rekat: 4,
    gender: 'all',
    group: 'yatsi',
    timingLabel: 'Yatsıdan Önce',
    timeOrder: 4,
    description: 'Yatsı farzından önce kılınan 4 rekât, sünnet-i gayr-i müekkede (nafile).',
    summary:
      'Yatsı vaktine girerken kılınan, terkinde sakınca olmayan fakat fazileti yüksek bir nafiledir. Yatsı farzından önce, içinden okuyarak, 4 rekât kılınır.',
  },
  {
    id: 'namaz-yatsi-farz',
    title: 'Yatsı Namazı Farzı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.DAILY,
    rekat: 4,
    gender: 'all',
    group: 'yatsi',
    description: '5 vakit farz namazdan sonuncusu.',
    summary:
      'Günün son farz namazı olup uykuya geçmeden önce Allah\'a son bir yönelişi ifade eder. İçinden okuyarak 4 rekât olarak kılınır.',
  },
  {
    id: 'namaz-yatsi-sunnet',
    title: 'Yatsı Namazı Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.DAILY,
    rekat: 2,
    gender: 'all',
    group: 'yatsi',
    description: 'Yatsı farzından sonra kılınan 2 rekât sünnet-i müekkede.',
    summary:
      'Yatsı farzının ardından kılınan, günün namaz sünnetlerini tamamlayan sünnet-i müekkededir. Farzdan sonra içinden okuyarak 2 rekât kılınır.',
  },
  {
    id: 'namaz-vitir',
    title: 'Vitir Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.VACIP,
    frequency: FREQUENCY.DAILY,
    rekat: 3,
    gender: 'all',
    description:
      'Yatsıdan sonra kılınan 3 rekât, son rekâtta kunut duası okunur. Hanefi mezhebinde vaciptir (diğer 3 mezhepte sünnettir).',
    summary:
      '"Vitir" tek sayı demektir; günün namazını tek bir rekâtla kapatıp güne dua ile son verir. Yatsıdan sonra 3 rekât kılınır; üçüncü rekâtta rükûdan önce eller kaldırılıp kunut duası okunur.',
  },
  {
    id: 'namaz-teheccud',
    title: 'Teheccüd (Gece Namazı)',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    rekat: 2,
    gender: 'all',
    timingLabel: 'Gecenin Son Üçte Biri',
    timeOrder: 7,
    description: 'Gecenin son üçte biri gibi kılınan, çokça tavsiye edilen nafile namaz.',
    summary:
      'Gecenin sessizliğinde kılınan, Kur\'an\'da övülen ve Hz. Peygamber\'in özenle devam ettiği en faziletli nafile namazlardandır. Uyanıp gecenin son üçte biri gibi bir vakitte, dilenen sayıda 2\'şer rekât olarak kılınır.',
  },
  {
    id: 'namaz-cuma-ilk-sunnet',
    title: 'Cuma Namazı İlk Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.WEEKLY_FRIDAY,
    rekat: 4,
    gender: 'all',
    group: 'ogle',
    description: 'Cuma farzından önce kılınan 4 rekât sünnet-i müekkede.',
    summary:
      'Cuma namazına hazırlığı ifade eden, o güne özgü bir sünnettir. Cuma farzından önce, camide, içinden okuyarak 4 rekât kılınır.',
  },
  {
    id: 'namaz-cuma-farz',
    title: 'Cuma Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.WEEKLY_FRIDAY,
    rekat: 2,
    gender: 'male_farz_female_nafile',
    group: 'ogle',
    description:
      'Cuma günü öğle namazının yerine geçer. Mukim ve mükellef erkeklere farz-ı ayndır; kadınlar için farz değildir, kılarlarsa nafile yerine geçer ve öğle namazı yerine sayılır.',
    summary:
      'Haftanın en faziletli günü olan Cuma\'da Müslümanların topluca Allah\'a yönelmesini sağlayan, öğle namazının yerine geçen farz namazdır. İki hutbe dinlendikten sonra imam eşliğinde, açıktan okunarak 2 rekât cemaatle kılınır.',
  },
  {
    id: 'namaz-cuma-son-sunnet',
    title: 'Cuma Namazı Son Sünneti',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.WEEKLY_FRIDAY,
    rekat: 4,
    gender: 'all',
    group: 'ogle',
    description: 'Cuma farzından sonra kılınan 4 rekât sünnet-i müekkede.',
    summary:
      'Cuma farzının ardından kılınıp o günün namazını tamamlayan sünnettir. Farzdan sonra içinden okuyarak 4 rekât kılınır.',
  },
  {
    id: 'namaz-teravih',
    title: 'Teravih Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.SUNNET_MUEKKEDE,
    frequency: FREQUENCY.YEARLY_RAMADAN,
    rekat: 20,
    gender: 'all',
    description: 'Ramazan gecelerine mahsus, Hanefi mezhebinde 20 rekât kılınan sünnet-i müekkede.',
    summary:
      'Ramazan gecelerine özgü, Kur\'an\'ın topluca hatmedilmesine de vesile olan, cemaatle kılınması teşvik edilen sünnet-i müekkededir. Yatsı farzından sonra, vitirden önce, genelde ikişer veya dörder rekâtlık bölümler halinde toplam 20 rekât kılınır.',
  },
  {
    id: 'namaz-bayram-ramazan',
    title: 'Ramazan Bayramı Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.VACIP,
    frequency: FREQUENCY.YEARLY_EID_RAMADAN,
    rekat: 2,
    gender: 'male_farz_female_nafile',
    description: 'Bayram sabahı kılınır, her rekâtta 3 ilave tekbir alınır. Hanefi\'de vaciptir.',
    summary:
      'Bir aylık orucun tamamlanmasının sevincini topluca Allah\'a şükrederek ifade eden bayram namazıdır. Bayram sabahı, namazdan sonra hutbe okunmak üzere, her rekâtta 3\'er ilave tekbirle 2 rekât kılınır.',
  },
  {
    id: 'namaz-bayram-kurban',
    title: 'Kurban Bayramı Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.VACIP,
    frequency: FREQUENCY.YEARLY_EID_KURBAN,
    rekat: 2,
    gender: 'male_farz_female_nafile',
    description: 'Bayram sabahı kılınır, her rekâtta 3 ilave tekbir alınır. Hanefi\'de vaciptir.',
    summary:
      'Hz. İbrahim\'in teslimiyetini anan Kurban Bayramı\'nın topluca kutlanmasını sağlayan namazdır. Bayram sabahı, namazdan sonra hutbe okunmak üzere, her rekâtta 3\'er ilave tekbirle 2 rekât kılınır.',
  },
  {
    id: 'namaz-cenaze',
    title: 'Cenaze Namazı',
    category: CATEGORY.NAMAZ,
    hukum: HUKUM.FARZ_KIFAYE,
    frequency: FREQUENCY.OCCASIONAL,
    gender: 'all',
    description: 'Bir cenaze olduğunda kılınır; topluluktan bir kısmı kılarsa diğerlerinden sorumluluk düşer.',
    summary:
      'Ölen bir Müslümana son bir dua ve şefaat vesilesi olan, rükû-secde içermeyen özel bir namazdır. Ayakta dört tekbirle kılınır: ilk tekbirde Sübhaneke, ikincide salevat, üçüncüde cenaze duası okunur, dördüncü tekbirin ardından selam verilir.',
  },

  // ---- ORUÇ ----
  {
    id: 'oruc-ramazan',
    title: 'Ramazan Orucu',
    category: CATEGORY.ORUC,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.YEARLY_RAMADAN,
    gender: 'all',
    description: 'Ramazan ayının 29 veya 30 günü boyunca tutulan farz oruç.',
    summary:
      'Nefsi terbiye eden, takvayı artıran ve Kur\'an\'ın indiği ayı ihya eden, İslam\'ın beş şartından biridir. İmsak vaktinden (fecrin doğuşundan) güneşin batışına kadar niyet edilip yeme, içme ve orucu bozan şeylerden sakınılarak tutulur.',
  },
  {
    id: 'oruc-arefe',
    title: 'Arefe Günü Orucu',
    category: CATEGORY.ORUC,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.YEARLY_ONCE,
    gender: 'all',
    description: 'Kurban Bayramı arefesinde tutulan müstehap oruç (hacca gidenler için tutulmaz).',
    summary:
      'Kurban Bayramı arefesinde tutulan, önceki ve sonraki yılın küçük günahlarına kefaret olacağı umulan faziletli bir oruçtur. Hacılar güçlü kalabilsin diye hacca gidenlere tutulması tavsiye edilmez; diğerleri niyet edip gün boyu yeme-içmeden sakınarak tutar.',
  },
  {
    id: 'oruc-asure',
    title: 'Aşûre Günü Orucu',
    category: CATEGORY.ORUC,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.YEARLY_ONCE,
    gender: 'all',
    description: '10 Muharrem günü, tercihen 9 veya 11. günle birlikte tutulan müstehap oruç.',
    summary:
      'Muharrem ayının 10. günü olan Aşûre\'de, Hz. Musa ve kavminin kurtuluşunu anarak tutulan köklü bir müstehap oruçtur. Yalnızca 10. güne özgü kılınmaması için tercihen 9. veya 11. günle birlikte iki gün tutulması tavsiye edilir.',
  },
  {
    id: 'oruc-sevval',
    title: 'Şevval Ayı 6 Günü',
    category: CATEGORY.ORUC,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.YEARLY_ONCE,
    gender: 'all',
    description: 'Ramazan Bayramı\'ndan sonra Şevval ayı içinde tutulan 6 günlük müstehap oruç.',
    summary:
      '"Ramazan\'ı tutup ardından Şevval\'den altı gün ekleyen, sanki bütün yılı oruçlu geçirmiş gibi olur" hadisine dayanan faziletli bir oruçtur. Ramazan Bayramı\'ndan sonra Şevval ayı içinde, art arda veya aralıklı olarak 6 gün tutulur.',
  },
  {
    id: 'oruc-pazartesi-persembe',
    title: 'Pazartesi - Perşembe Orucu',
    category: CATEGORY.ORUC,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_WEEKLY_MON_THU,
    gender: 'all',
    timeOrder: 0,
    description: 'Hz. Peygamber\'in düzenli tuttuğu haftalık müstehap oruç günleri.',
    summary:
      'Amellerin Allah\'a arz edildiği günler olduğu rivayet edilen Pazartesi ve Perşembe günlerinde, Hz. Peygamber\'in düzenli olarak tuttuğu bir sünnettir. Haftanın bu iki gününde, diğer nafile oruçlar gibi niyet edilerek tutulur.',
  },
  {
    id: 'oruc-eyyam-i-biyz',
    title: 'Eyyâm-ı Bîz Orucu',
    category: CATEGORY.ORUC,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_MONTHLY,
    gender: 'all',
    timeOrder: 0,
    description: 'Her kamerî ayın 13-14-15. günlerinde tutulan müstehap oruç.',
    summary:
      '"Beyaz/aydınlık günler" anlamına gelen, ayın dolunay haline yaklaştığı günlerde tutulan, sevabı bütün ayı oruçlu geçirmiş gibi yazılan bir sünnettir. Her kamerî ayın 13, 14 ve 15. günlerinde tutulur.',
  },
  {
    id: 'oruc-adak',
    title: 'Adak (Nezir) Orucu',
    category: CATEGORY.ORUC,
    hukum: HUKUM.VACIP,
    frequency: FREQUENCY.YEARLY_ONCE,
    gender: 'all',
    description: 'Kişinin kendi üzerine adakla vacip kıldığı oruç; ayrıca bozulan nafile orucun kazası ve keffaret oruçları da vaciptir.',
    summary:
      'Kişinin "şu işim gerçekleşirse şu kadar gün oruç tutacağım" gibi kendi üzerine adakla (nezirle) vacip kıldığı oruçtur; herkese değil, yalnızca adak adayana ve adanan şart gerçekleşince gereklidir. Adanan gün sayısı kadar, niyet edilip normal oruç gibi tutulur.',
  },

  // ---- ZEKÂT ----
  {
    id: 'zekat-mal',
    title: 'Zekât',
    category: CATEGORY.ZEKAT,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.YEARLY_ONCE,
    gender: 'all',
    description:
      'Nisap miktarına ulaşan ve üzerinden bir kamerî yıl geçen mal üzerinden ödenir (nakit/ticaret malında %2,5).',
    summary:
      'Malın zekâtını vermek, servetteki fakirin hakkını ona ulaştırıp malı hem manen hem toplumsal olarak temizleyen (arındıran) bir ibadettir. Nisap miktarına ulaşan ve üzerinden bir kamerî yıl geçen nakit/ticaret malının %2,5\'i (kırkta biri) hesaplanıp muhtaç kişilere verilir.',
  },
  {
    id: 'zekat-fitre',
    title: 'Sadaka-i Fıtır (Fitre)',
    category: CATEGORY.ZEKAT,
    hukum: HUKUM.VACIP,
    frequency: FREQUENCY.YEARLY_EID_RAMADAN,
    gender: 'all',
    description: 'Ramazan Bayramı namazından önce, ihtiyaç fazlası malı olan her Müslümanın kendisi ve bakmakla yükümlü olduğu kişiler için ödemesi.',
    summary:
      'Orucun küçük kusurlarını telafi eden ve bayram sevincine yoksulları da ortak eden bir mali ibadettir. Ramazan Bayramı namazından önce, temel ihtiyaç fazlası malı olan herkesin kendisi ve bakmakla yükümlü olduğu kişiler için belirlenen miktarı ödemesiyle yerine getirilir.',
  },
  {
    id: 'zekat-akika',
    title: 'Akika Kurbanı',
    category: CATEGORY.ZEKAT,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.LIFETIME,
    gender: 'all',
    description: 'Yeni doğan çocuk için kesilen, cumhura göre sünnet/müstehap kurban.',
    summary:
      'Yeni doğan çocuk için şükür ifadesi olarak kesilen, çocuğun sağlığına ve bereketine vesile olacağı umulan bir kurbandır. Doğumdan sonra (tercihen yedinci günde), erkek çocuk için iki, kız çocuk için bir koyun/keçi kesilip eti dağıtılarak yerine getirilir.',
  },

  // ---- HAC & UMRE ----
  {
    id: 'hac-farz',
    title: 'Hac',
    category: CATEGORY.HAC,
    hukum: HUKUM.FARZ_AYN,
    frequency: FREQUENCY.LIFETIME,
    gender: 'all',
    description: 'İstitâat (bedenen ve mâlen güç yetirebilme) şartını taşıyan her mükellefe ömürde bir kez farzdır.',
    summary:
      'İslam\'ın beş şartından biri olup dünyanın dört bir yanından Müslümanları Kâbe etrafında eşit kıyafetlerle bir araya getiren, hayatta bir kez yapılan büyük bir ibadettir. İhrama girilir, Arafat\'ta vakfe yapılır, Kâbe tavaf edilir, Safa ile Merve arasında sa\'y yapılır ve belirlenen menasik sırasıyla tamamlanır.',
  },
  {
    id: 'hac-umre',
    title: 'Umre',
    category: CATEGORY.HAC,
    hukum: HUKUM.VACIP,
    frequency: FREQUENCY.LIFETIME,
    gender: 'all',
    description: 'Hanefi mezhebinde ömürde bir kez vaciptir (Şafii mezhebinde farzdır).',
    summary:
      'Haccın küçüğü sayılan, yılın her mevsiminde yapılabilen bir ziyaret ve ibadettir. İhrama girilir, Kâbe tavaf edilir, Safa ile Merve arasında sa\'y yapılır ve tıraş olunarak ihramdan çıkılır.',
  },

  // ---- KURBAN ----
  {
    id: 'kurban-bayram',
    title: 'Kurban Bayramı Kurbanı',
    category: CATEGORY.KURBAN,
    hukum: HUKUM.VACIP,
    frequency: FREQUENCY.YEARLY_EID_KURBAN,
    gender: 'all',
    description:
      'Nisap miktarına sahip, akıllı, bâliğ, mukim her Müslümana Kurban Bayramı günlerinde Hanefi mezhebinde vaciptir (diğer 3 mezhepte sünnet-i müekkededir).',
    summary:
      'Hz. İbrahim\'in oğlunu Allah için kurban etmeye hazır oluşunu anan, malını Allah rızası için paylaşmayı öğreten bir ibadettir. Kurban Bayramı\'nın ilk üç günü içinde, nisap sahibi her Müslüman uygun bir hayvan kestirip etini kendisi, akrabaları ve muhtaçlar arasında paylaştırır.',
  },

  // ---- ZİKİR & DUA ----
  // "Tesbihat" (namaz sonrası 33-33-33) hariç, kullanıcı onayıyla eklenen
  // sayı/vakit belirlenen tavsiye edilen zikir ve dualar. arabic/transliteration/
  // translation alanları ItemDetailScreen'de "Arapça Metni, Okunuşu ve Meali"
  // bölümünde gösterilir. Metinler AI tarafından derlenmiştir; namazda/ibadette
  // esas alınmadan önce bir mushaf veya güvenilir bir kaynakla karşılaştırılması
  // tavsiye edilir.
  {
    id: 'zikir-mulk-suresi',
    title: 'Mülk Suresi',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timingLabel: 'Yatsıdan Sonra',
    timeOrder: 5,
    description: 'Her gece, tercihen yatsıdan sonra/yatmadan önce okunması tavsiye edilen, 30 ayetlik Mülk (Tebâreke) suresi.',
    summary:
      'Kabir azabından koruduğu ve okuyana kıyamet günü şefaat edeceği bildirilen (Tirmizî, Hâkim), her gece okunması tavsiye edilen bir suredir. Yatsı namazından sonra, yatmadan önce baştan sona okunur.',
    arabic: `تَبَارَكَ الَّذِى بِيَدِهِ الْمُلْكُ وَهُوَ عَلٰى كُلِّ شَئٍ قَدِيرٌ (1)
اَلَّذِى خَلَقَ الْمَوْتَ وَالْحَيٰوةَ لِيَبْلُوَكُمْ اَيُّكُمْ اَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ (2)
اَلَّذِى خَلَقَ سَبْعَ سَمٰوَاتٍ طِبَاقًا مَا تَرٰى فِى خَلْقِ الرَّحْمٰنِ مِنْ تَفَاوُتٍ فَارْجِعِ الْبَصَرَ هَلْ تَرٰى مِنْ فُطُورٍ (3)
ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنْقَلِبْ اِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ (4)
وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِلشَّيَاطِينِ وَاَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ (5)
وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ وَبِئْسَ الْمَصِيرُ (6)
اِذَآ اُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِىَ تَفُورُ (7)
تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ كُلَّمَآ اُلْقِىَ فِيهَا فَوْجٌ سَاَلَهُمْ خَزَنَتُهَآ اَلَمْ يَاْتِكُمْ نَذِيرٌ (8)
قَالُوا بَلٰى قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِنْ شَئٍ اِنْ اَنْتُمْ اِلَّا فِى ضَلَالٍ كَبِيرٍ (9)
وَقَالُوا لَوْ كُنَّا نَسْمَعُ اَوْ نَعْقِلُ مَا كُنَّا فِى اَصْحَابِ السَّعِيرِ (10)
فَاعْتَرَفُوا بِذَنْبِهِمْ فَسُحْقًا لِاَصْحَابِ السَّعِيرِ (11)
اِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُمْ بِالْغَيْبِ لَهُمْ مَغْفِرَةٌ وَاَجْرٌ كَبِيرٌ (12)
وَاَسِرُّوا قَوْلَكُمْ اَوِ اجْهَرُوا بِهِ اِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ (13)
اَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ (14)
هُوَ الَّذِى جَعَلَ لَكُمُ الْاَرْضَ ذَلُولًا فَامْشُوا فِى مَنَاكِبِهَا وَكُلُوا مِنْ رِزْقِهِ وَاِلَيْهِ النُّشُورُ (15)
ءَاَمِنْتُمْ مَنْ فِى السَّمَاءِ اَنْ يَخْسِفَ بِكُمُ الْاَرْضَ فَاِذَا هِىَ تَمُورُ (16)
اَمْ اَمِنْتُمْ مَنْ فِى السَّمَاءِ اَنْ يُرْسِلَ عَلَيْكُمْ حَاصِبًا فَسَتَعْلَمُونَ كَيْفَ نَذِيرِ (17)
وَلَقَدْ كَذَّبَ الَّذِينَ مِنْ قَبْلِهِمْ فَكَيْفَ كَانَ نَكِيرِ (18)
اَوَلَمْ يَرَوْا اِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ مَا يُمْسِكُهُنَّ اِلَّا الرَّحْمٰنُ اِنَّهُ بِكُلِّ شَئٍ بَصِيرٌ (19)
اَمَّنْ هٰذَا الَّذِى هُوَ جُنْدٌ لَكُمْ يَنْصُرُكُمْ مِنْ دُونِ الرَّحْمٰنِ اِنِ الْكَافِرُونَ اِلَّا فِى غُرُورٍ (20)
اَمَّنْ هٰذَا الَّذِى يَرْزُقُكُمْ اِنْ اَمْسَكَ رِزْقَهُ بَلْ لَجُّوا فِى عُتُوٍّ وَنُفُورٍ (21)
اَفَمَنْ يَمْشِى مُكِبًّا عَلٰى وَجْهِهِ اَهْدٰى اَمَّنْ يَمْشِى سَوِيًّا عَلٰى صِرَاطٍ مُسْتَقِيمٍ (22)
قُلْ هُوَ الَّذِى اَنْشَاَكُمْ وَجَعَلَ لَكُمُ السَّمْعَ وَالْاَبْصَارَ وَالْاَفْئِدَةَ قَلِيلًا مَا تَشْكُرُونَ (23)
قُلْ هُوَ الَّذِى ذَرَاَكُمْ فِى الْاَرْضِ وَاِلَيْهِ تُحْشَرُونَ (24)
وَيَقُولُونَ مَتٰى هٰذَا الْوَعْدُ اِنْ كُنْتُمْ صَادِقِينَ (25)
قُلْ اِنَّمَا الْعِلْمُ عِنْدَ اللَّهِ وَاِنَّمَآ اَنَا نَذِيرٌ مُبِينٌ (26)
فَلَمَّا رَاَوْهُ زُلْفَةً سِيئَتْ وُجُوهُ الَّذِينَ كَفَرُوا وَقِيلَ هٰذَا الَّذِى كُنْتُمْ بِهِ تَدَّعُونَ (27)
قُلْ اَرَاَيْتُمْ اِنْ اَهْلَكَنِىَ اللَّهُ وَمَنْ مَعِىَ اَوْ رَحِمَنَا فَمَنْ يُجِيرُ الْكَافِرِينَ مِنْ عَذَابٍ اَلِيمٍ (28)
قُلْ هُوَ الرَّحْمٰنُ اٰمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا فَسَتَعْلَمُونَ مَنْ هُوَ فِى ضَلَالٍ مُبِينٍ (29)
قُلْ اَرَاَيْتُمْ اِنْ اَصْبَحَ مَاؤُكُمْ غَوْرًا فَمَنْ يَاْتِيكُمْ بِمَاءٍ مَعِينٍ (30)`,
    transliteration: `1. Tebârakellezî bi yedihi'l-mülkü ve hüve alâ külli şey'in kadîr.
2. Ellezî halakal mevte vel hayâte li yeblüveküm eyyüküm ahsenü amelâ, ve huvel azîzul gafûr.
3. Ellezî halaka seb'a semâvâtin tibâkâ, mâ terâ fî halkır rahmâni min tefâvüt, ferci'il basara hel terâ min futûr.
4. Sümmerci'il basara kerrateyni yenkalib ileykel basaru hâsian ve huve hasîr.
5. Ve lekad zeyyennes semâed dünyâ bi mesâbîha ve cealnâhâ rucûmen liş şeyâtîni ve a'tednâ lehüm azâbes seaîr.
6. Ve lillezîne keferû bi rabbihim azâbü cehennem, ve bi'sel masîr.
7. İzâ ulkû fîhâ semiû lehâ şehîkan ve hiye tefûr.
8. Tekâdü temeyyezü minel gayz, küllemâ ulkıye fîhâ fevcun seelehüm hazenetühâ e lem ye'tiküm nezîr.
9. Kâlû belâ kad câenâ nezîrun fe kezzebnâ ve kulnâ mâ nezzelallâhu min şey'in in entüm illâ fî dalâlin kebîr.
10. Ve kâlû lev künnâ nesmeu ev na'kılu mâ künnâ fî ashâbis seaîr.
11. Fa'terafû bi zenbihim, fe suhkan li ashâbis seaîr.
12. İnnellezîne yahşevne rabbehüm bil gaybi lehüm magfiratün ve ecrun kebîr.
13. Ve esirrû kavleküm evicherû bih, innehû alîmün bi zâtis sudûr.
14. E lâ ya'lemü men halâk, ve huvel latîful habîr.
15. Huvellezî ceale lekümül arda zelûlen femşû fî menâkibihâ ve külû min rızkıh, ve ileyhin nüşûr.
16. E emintüm men fîs semâi ey yahsife bikümül arda fe izâ hiye temûr.
17. Em emintüm men fîs semâi ey yursile aleyküm hâsıben fe se ta'lemûne keyfe nezîr.
18. Ve lekad kezzebellezîne min kablihim fe keyfe kâne nekîr.
19. E ve lem yerav ilet tayri fevkahüm sâffâtin ve yakbıdn, mâ yümsikühünne illerrahmân, innehû bi külli şey'in basîr.
20. Emmen hâzellezî hüve cündün leküm yansuruküm min dûnirrahmân, inil kâfirûne illâ fî gurûr.
21. Emmen hâzellezî yerzukuküm in emseke rızkah, bel leccû fî utüvvin ve nufûr.
22. E fe men yemşî mükibben alâ vechihî ehdâ emmen yemşî seviyyen alâ sırâtın müstakîm.
23. Kul huvellezî enşeeküm ve ceale lekümüs sem'a vel ebsâra vel ef'ideh, kalîlen mâ teşkurûn.
24. Kul huvellezî zeraeküm fîl erdı ve ileyhi tuhşerûn.
25. Ve yekûlûne metâ hâzel va'dü in küntüm sâdikîn.
26. Kul innemel ilmu indallâhi ve innemâ ene nezîrun mübîn.
27. Fe lemmâ raevhu zülfeten sîet vucûhüllezîne keferû ve kîle hâzellezî küntüm bihî tedde'ûn.
28. Kul e raeytüm in ehlekeniyallâhu ve men maiye ev rahımenâ fe men yücîrul kâfirîne min azâbin elîm.
29. Kul huver rahmânü âmennâ bihî ve aleyhi tevekkelnâ, fe se ta'lemûne men hüve fî dalâlin mübîn.
30. Kul e raeytüm in asbeha mâüküm gavran fe men ye'tîküm bi mâin main.`,
    translation: `1. Mülk elinde bulunan Allah, yücedir. O, her şeye hakkıyla gücü yetendir.
2. O, hanginizin daha güzel amel edeceğini sınamak için ölümü ve hayatı yaratandır. O, mutlak güç sahibidir, çok bağışlayandır.
3. O, yedi göğü tabaka tabaka yaratandır. Rahmân'ın yaratışında hiçbir uyumsuzluk göremezsin. Bir kere daha gözünü çevir de bak, bir bozukluk görebiliyor musun?
4. Sonra gözünü tekrar tekrar çevir bak; göz (aradığı bozukluğu bulmaktan) âciz ve bitkin hâlde sana dönecektir.
5. Andolsun, biz en yakın göğü kandillerle donattık. Onları şeytanlara atılan taşlar yaptık ve onlara alevli ateş azabını hazırladık.
6. Rablerini inkâr edenler için cehennem azabı vardır. Ne kötü varış yeridir orası!
7. Oraya atıldıklarında, onun kaynarken çıkardığı uğultuyu işitirler.
8. Cehennem, öfkesinin şiddetinden neredeyse çatlayacak gibi olur. Her bir grup içine atıldıkça, cehennemin bekçileri onlara sorar: "Size bir uyarıcı gelmedi mi?"
9. Onlar şöyle derler: "Evet, doğrusu bize bir uyarıcı gelmişti. Fakat biz yalanladık ve 'Allah hiçbir şey indirmedi, siz ancak büyük bir sapıklık içindesiniz' demiştik."
10. Yine şöyle derler: "Eğer kulak vermiş veya aklımızı kullanmış olsaydık, şu alevli ateştekilerden olmazdık."
11. Böylece günahlarını itiraf ederler. Artık (Allah'ın rahmetinden) uzak olsun, o alevli ateştekiler!
12. Görmedikleri hâlde Rablerinden için için korkanlar var ya, onlar için bir bağışlanma ve büyük bir mükâfat vardır.
13. Sözünüzü ister gizleyin, ister açığa vurun; bilin ki O, göğüslerin özünü hakkıyla bilendir.
14. Hiç yaratan bilmez mi? O, en gizli şeyleri bilir, her şeyden hakkıyla haberdardır.
15. O, yeryüzünü size boyun eğdirendir. Öyleyse onun omuzlarında dolaşın ve Allah'ın rızkından yiyin. Dönüş ancak O'nadır.
16. Göktekinin, sizi yere batırıvermeyeceğinden emin mi oldunuz? O zaman yeryüzü ansızın çalkalanmaya başlar.
17. Yahut göktekinin, üzerinize taş yağdıran bir fırtına göndermeyeceğinden emin mi oldunuz? İşte uyarımın nasıl olduğunu bileceksiniz!
18. Andolsun, onlardan öncekiler de yalanlamışlardı. Ama benim inkârım (onları cezalandırmam) nasıl olmuştu!
19. Üstlerinde kanatlarını aça-kapata uçan kuşları görmüyorlar mı? Onları havada Rahmân'dan başkası tutmuyor. Şüphesiz O, her şeyi hakkıyla görendir.
20. Rahmân'dan başka size yardım edecek askerleriniz kimdir, kimmiş? İnkârcılar ancak derin bir gaflet içindedirler.
21. Allah rızkını tutacak olsa, size rızık verebilecek kimdir? Hayır, onlar azgınlık ve nefretle direnip durmaktadırlar.
22. Şimdi, yüzükoyun kapanarak yürüyen mi daha doğru gider, yoksa dosdoğru bir yol üzerinde dimdik yürüyen mi?
23. De ki: "O, sizi yaratan ve size kulaklar, gözler ve kalpler verendir. Ne kadar da az şükrediyorsunuz!"
24. De ki: "O, sizi yeryüzünde yaratıp türeten ve döndürülüp huzurunda toplanacağınız Allah'tır."
25. Onlar, "Eğer doğru söyleyenler iseniz, bu tehdit ne zaman gerçekleşecek?" diyorlar.
26. De ki: "O bilgi ancak Allah katındadır. Ben ancak apaçık bir uyarıcıyım."
27. Onu (azabı) yakında görünce, inkâr edenlerin yüzleri kararacak ve kendilerine "İşte bu, isteyip durduğunuz şeydir" denecek.
28. De ki: "Ne dersiniz? Allah beni ve benimle beraber olanları yok etse, yahut bize merhamet etse, inkârcıları elem dolu bir azaptan kim kurtarır?"
29. De ki: "O, Rahmân'dır. O'na iman ettik ve yalnızca O'na tevekkül ettik. Kimin apaçık bir sapıklık içinde olduğunu yakında bileceksiniz!"
30. De ki: "Suyunuz çekiliverse, söyleyin bakalım, size kim bir akarsu getirebilir?"`,
  },
  {
    id: 'zikir-amenerrasulu',
    title: 'Bakara Suresi Son 2 Ayeti (Âmenerrasûlü)',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timingLabel: 'Gece',
    timeOrder: 6,
    description: 'Bakara suresinin 285-286. ayetleri; her gece, tercihen yatmadan önce okunması tavsiye edilir.',
    summary:
      '"Kim geceleyin bu iki ayeti okursa, o gece için ona yeter" hadisine dayanan (Buhârî, Müslim), iman esaslarını ve tevekkülü özetleyen bir dua-ayet çiftidir. Gece, tercihen yatmadan önce okunur.',
    arabic: `آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ (285)
لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ (286)`,
    transliteration: `285. Âmener resûlü bimâ ünzile ileyhi mir rabbihî vel mü'minûn, küllün âmene billâhi ve melâiketihî ve kütübihî ve rusülih, lâ nüferriku beyne ehadin mir rusülih, ve kâlû semi'nâ ve eta'nâ gufrâneke rabbenâ ve ileykel masîr.
286. Lâ yükellifullâhu nefsen illâ vüs'ahâ, lehâ mâ kesebet ve aleyhâ mektesebet, rabbenâ lâ tüâhıznâ in nesînâ ev ahta'nâ, rabbenâ ve lâ tahmil aleynâ ısran kemâ hameltehû alellezîne min kablinâ, rabbenâ ve lâ tuhammilnâ mâ lâ tâkate lenâ bih, va'fu annâ, vagfirlenâ, verhamnâ, ente mevlânâ fensurnâ alel kavmil kâfirîn.`,
    translation: `285. Peygamber, Rabbinden kendisine indirilene iman etti, müminler de iman ettiler. Her biri Allah'a, meleklerine, kitaplarına ve peygamberlerine iman ettiler ve şöyle dediler: "Onun peygamberlerinden hiçbirini ayırt etmeyiz." Şöyle de dediler: "İşittik ve itaat ettik. Ey Rabbimiz! Senden bağışlama dileriz. Sonunda dönüş yalnız sanadır."
286. Allah, bir kimseyi ancak gücünün yettiği şeyle yükümlü kılar. Onun kazandığı iyilik kendi yararına, kötülük de kendi zararınadır. "Ey Rabbimiz! Unutur ya da yanılırsak bizi sorumlu tutma! Ey Rabbimiz! Bize, bizden öncekilere yüklediğin gibi ağır yük yükleme. Ey Rabbimiz! Bize gücümüzün yetmediği şeyleri yükleme! Bizi affet, bizi bağışla, bize acı! Sen bizim Mevlâmızsın. Kâfirler topluluğuna karşı bize yardım et."`,
  },
  {
    id: 'zikir-yatarken-tesbihi',
    title: 'Yatarken Tesbihi (Fâtıma Tesbihi)',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timingLabel: 'Yatmadan Önce',
    timeOrder: 6,
    description: 'Yatmadan önce 33 Sübhânallah, 33 Elhamdülillah, 34 Allâhu ekber şeklinde çekilen tesbih.',
    summary:
      'Hz. Peygamber\'in, hizmetçi isteyen kızı Fâtıma ile Hz. Ali\'ye hizmetçi yerine öğrettiği, "bu sizin için ondan daha hayırlıdır" buyurduğu bir tesbihtir (Buhârî, Müslim). Yatağa girip yatmadan önce sırasıyla 33 Sübhânallah, 33 Elhamdülillah, 34 Allâhu ekber denilerek çekilir.',
    arabic: `سُبْحَانَ اللَّهِ (٣٣) — الْحَمْدُ لِلَّهِ (٣٣) — اللَّهُ أَكْبَرُ (٣٤)`,
    transliteration: `Sübhânallah (33 kere), Elhamdülillâh (33 kere), Allâhu ekber (34 kere).`,
    translation: `Allah her türlü eksiklikten uzaktır (33 kere). Hamd (övgü) Allah'a mahsustur (33 kere). Allah en büyüktür (34 kere).`,
  },
  {
    id: 'zikir-hasr-son-ayetler',
    title: 'Haşr Suresi Son 3 Ayeti',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timingLabel: 'Sabah',
    timeOrder: 1,
    description: `Haşr suresinin 22-24. ayetleri; sabah, "Eûzü billâhi's-semîi'l-alîm" ile başlanarak okunur.`,
    summary:
      '"Kim sabahleyin üç kere Eûzü billâhis-semîil-alîm min-eş-şeytânir-racîm diyerek Haşr suresinin sonundaki üç ayeti okursa, Allah ona akşama kadar dua eden 70.000 melek görevlendirir; o gün ölürse şehit olarak ölür" hadisine dayanır (Tirmizî). Sabah namazından sonra, önce istiaze çekilip ardından üç ayet okunur.',
    arabic: `أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ
هُوَ اللّٰهُ الَّذِى لَآ اِلٰهَ اِلَّا هُوَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ هُوَ الرَّحْمٰنُ الرَّحِيمُ (22)
هُوَ اللّٰهُ الَّذِى لَآ اِلٰهَ اِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ سُبْحَانَ اللّٰهِ عَمَّا يُشْرِكُونَ (23)
هُوَ اللّٰهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ لَهُ الْاَسْمَاءُ الْحُسْنٰى يُسَبِّحُ لَهُ مَا فِى السَّمٰوَاتِ وَالْاَرْضِ وَهُوَ الْعَزِيزُ الْحَكِيمُ (24)`,
    transliteration: `Eûzü billâhis-semîil-alîmi mineş-şeytânir-racîm.
22. Hüvellâhüllezî lâ ilâhe illâ hû, âlimül gaybi veş şehâdeh, hüver rahmânür rahîm.
23. Hüvellâhüllezî lâ ilâhe illâ hû, elmelikül kuddûsüs selâmül mü'minül müheyminül azîzül cebbârul mütekebbir, sübhânallâhi ammâ yüşrikûn.
24. Hüvellâhül hâlikul bâriül müsavviru lehül esmâül hüsnâ, yüsebbihu lehû mâ fis semâvâti vel ard, ve hüvel azîzül hakîm.`,
    translation: `Duyan, bilen Allah'a; kovulmuş şeytandan sığınırım.
22. O, kendisinden başka hiçbir ilâh bulunmayan Allah'tır. Görülmeyeni ve görüleni bilendir. O, Rahmân'dır, Rahîm'dir.
23. O, kendisinden başka hiçbir ilâh bulunmayan Allah'tır. O; mülkün gerçek sahibi, eksiklikten münezzeh, selâmet veren, güvenlik veren, gözetip koruyan, mutlak güç sahibi, dilediğini yaptıran ve büyüklükte eşsiz olandır. Allah, onların ortak koştuklarından uzaktır.
24. O; yaratan, var eden, şekil veren Allah'tır. Güzel isimler O'nundur. Göklerdeki ve yerdeki her şey O'nu tesbih eder. O, mutlak güç sahibidir, hüküm ve hikmet sahibidir.`,
  },
  {
    id: 'zikir-ihlas-felak-nas',
    title: 'İhlas, Felak ve Nâs Sureleri (3\'er Kere)',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timingLabel: 'Sabah ve Akşam',
    timeOrder: 1,
    description: 'Sabah ve akşam üçer kere okunması tavsiye edilen İhlas, Felak ve Nâs sureleri (Muavvizeteyn + İhlas).',
    summary:
      '"Sabah ve akşam bu üç sureyi üçer kere okuyan kişiye, her şeye karşı yeterli gelir" hadisine dayanır (Tirmizî, Ebû Dâvûd). Sabah namazından sonra ve akşam/yatmadan önce, her biri üçer kez okunur.',
    arabic: `قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (İhlas — 3 kere)

قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ * وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ (Felak — 3 kere)

قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَٰهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ (Nâs — 3 kere)`,
    transliteration: `İhlas (3 kere): Kul hüvallâhü ehad. Allâhüs samed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.

Felak (3 kere): Kul eûzü birabbil felak. Min şerri mâ halâk. Ve min şerri gâsikın izâ vekab. Ve min şerrin neffâsâti fil ukad. Ve min şerri hâsidin izâ hased.

Nâs (3 kere): Kul eûzü birabbin nâs. Melikin nâs. İlâhin nâs. Min şerril vesvâsil hannâs. Ellezî yüvesvisü fî sudûrin nâs. Minel cinneti ven nâs.`,
    translation: `İhlas: De ki: "O, Allah'tır, bir tektir. Allah Samed'dir (her şey O'na muhtaçtır, O hiçbir şeye muhtaç değildir). O'ndan çocuk olmamıştır, kendisi de doğmamıştır. Hiçbir şey O'na denk ve benzer değildir."

Felak: De ki: "Yarattığı şeylerin kötülüğünden, karanlığı çöktüğü zaman gecenin kötülüğünden, düğümlere üfleyenlerin kötülüğünden ve haset ettiği zaman hasetçinin kötülüğünden, sabahın Rabbine sığınırım."

Nâs: De ki: "Cinlerden ve insanlardan; insanların kalplerine vesvese veren sinsi vesvesecinin kötülüğünden, insanların Rabbine, insanların Melik'ine, insanların İlâh'ına sığınırım."`,
  },
  {
    id: 'zikir-ayetel-kursi',
    title: 'Âyet-el Kürsî',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timingLabel: 'Her Farz Namazdan Sonra',
    timeOrder: 8,
    description: 'Bakara suresi 255. ayet; her gün, tercihen her farz namazdan sonra okunması tavsiye edilir.',
    summary:
      '"Her farz namazdan sonra Ayet-el Kürsî\'yi okuyan kimsenin cennete girmesine ölümden başka engel kalmaz" hadisine dayanır (Nesâî). Kur\'an\'ın en faziletli ayeti kabul edilir; günün herhangi bir vaktinde, özellikle farz namazların ardından okunur.',
    arabic: `اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ`,
    transliteration: `Allâhü lâ ilâhe illâ hüvel hayyül kayyûm, lâ te'huzühû sinetün ve lâ nevm, lehû mâ fis semâvâti ve mâ fil ard, men zellezî yeşfeu indehû illâ bi iznih, ya'lemü mâ beyne eydîhim ve mâ halfehüm ve lâ yühîtûne bi şey'im min ilmihî illâ bimâ şâ, vesia kürsiyyühüs semâvâti vel ard, ve lâ yeûdühû hıfzuhümâ ve hüvel aliyyül azîm.`,
    translation: `Allah, kendisinden başka hiçbir ilâh olmayandır. Diridir, kayyûmdur. O'nu ne bir uyuklama tutabilir, ne de bir uyku. Göklerdeki her şey, yerdeki her şey O'nundur. İzni olmaksızın O'nun katında şefaat edecek kimdir? O, kulların önlerindekileri ve arkalarındakileri bilir. O'nun ilminden, kendisinin dilediği kadarından başka hiçbir şeyi kavrayamazlar. O'nun kürsüsü, bütün gökleri ve yeri kaplayıp kuşatmıştır. Gökleri ve yeri koruyup gözetmek O'na güç gelmez. O, yücedir, büyüktür.`,
  },
  {
    id: 'zikir-gunluk-kuran-okuma',
    title: 'Günlük Kur\'an Okuma',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timeOrder: 9,
    description:
      'Sabit bir sureye/ayete bağlı olmayan, günün herhangi bir vaktinde kendi seçtiğin bir bölümü (bir sayfa, birkaç ayet veya bir cüz) okuyarak yerine getirilen günlük Kur\'an okuma alışkanlığı.',
    summary:
      '"Kur\'an okuyunuz; çünkü o, kıyamet günü kendisini okuyanlara şefaatçi olarak gelecektir" hadisine dayanan (Müslim), düzenli okumayı teşvik eden bir nafiledir. Sabit bir metni yoktur; günün herhangi bir vaktinde, kendi belirlediğin bir miktar (ör. bir sayfa, birkaç ayet veya bir cüz) okunarak yerine getirilir; zamanla hatim tamamlamak için de bir alışkanlık oluşturur.',
  },
  {
    id: 'zikir-istigfar',
    title: 'İstiğfar (100 Kere)',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timeOrder: 9,
    description: 'Günde 100 kere "Estağfirullah" denilerek yapılan istiğfar.',
    summary:
      '"Vallahi ben günde 100 kereden fazla Allah\'a istiğfar eder, tövbe ederim" hadisine dayanır (Buhârî). Günün herhangi bir vaktinde, 100 kere "Estağfirullah" denilerek çekilir.',
    arabic: `أَسْتَغْفِرُ اللَّهَ (١٠٠)`,
    transliteration: `Estağfirullah (100 kere).`,
    translation: `Allah'tan bağışlanma dilerim.`,
  },
  {
    id: 'zikir-sübhanallahi-ve-bihamdihi',
    title: 'Sübhânallahi ve Bihamdihî (100 Kere)',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timeOrder: 9,
    description: 'Günde 100 kere "Sübhânallahi ve bihamdihî" denilerek yapılan tesbih.',
    summary:
      '"Kim günde 100 kere Sübhânallahi ve bihamdihî derse, günahları deniz köpüğü kadar çok olsa bile bağışlanır" hadisine dayanır (Buhârî, Müslim). Günün herhangi bir vaktinde 100 kere çekilir.',
    arabic: `سُبْحَانَ اللَّهِ وَبِحَمْدِهِ (١٠٠)`,
    transliteration: `Sübhânallâhi ve bihamdihî (100 kere).`,
    translation: `Allah'ı hamd ile tesbih ederim (Allah'ı her türlü noksanlıktan uzak tutarak överim).`,
  },
  {
    id: 'zikir-kelime-i-tevhid',
    title: 'Kelime-i Tevhid (100 Kere)',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timeOrder: 9,
    description: 'Günde 100 kere "Lâ ilâhe illallâhu vahdehû lâ şerîke leh..." denilerek yapılan tehlil.',
    summary:
      '"Kim günde 100 kere bunu söylerse, kendisi için 10 köle azat etmiş gibi sevap yazılır, 100 iyilik yazılır, 100 günahı silinir ve o gün akşama kadar şeytandan korunmuş olur" hadisine dayanır (Buhârî, Müslim). Günün herhangi bir vaktinde 100 kere çekilir.',
    arabic: `لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (١٠٠)`,
    transliteration: `Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehül mülkü ve lehül hamdü ve hüve alâ külli şey'in kadîr (100 kere).`,
    translation: `Allah'tan başka ilah yoktur, O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır. O, her şeye hakkıyla gücü yetendir.`,
  },
  {
    id: 'zikir-salavat-i-serife',
    title: 'Salavat-ı Şerife (Salli-Bârik Duası)',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timeOrder: 9,
    description: 'Namazın son oturuşunda okunan Salli-Bârik duasının, namaz dışında da çokça tekrar edilmesi tavsiye edilen salavat metni.',
    summary:
      'Hz. Peygamber\'e salavat getirmenin Kur\'an\'da emredildiği (Ahzâb, 33/56) ve özellikle Cuma günleri çokça tekrarının tavsiye edildiği bir duadır. Namazın son oturuşunda okunduğu gibi, günün herhangi bir vaktinde de tekrarlanabilir.',
    arabic: `اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ
اللَّهُمَّ بَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ`,
    transliteration: `Allâhümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed, kemâ salleyte alâ seyyidinâ İbrâhîme ve alâ âli seyyidinâ İbrâhîm, inneke hamîdün mecîd.
Allâhümme bârik alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed, kemâ bârekte alâ seyyidinâ İbrâhîme ve alâ âli seyyidinâ İbrâhîm, inneke hamîdün mecîd.`,
    translation: `Allah'ım! İbrahim'e ve âline salât ettiğin gibi Muhammed'e ve âline de salât et; şüphesiz sen övülmeye layıksın, şanı yücesin.
Allah'ım! İbrahim'e ve âline bereket verdiğin gibi Muhammed'e ve âline de bereket ver; şüphesiz sen övülmeye layıksın, şanı yücesin.`,
  },
  {
    id: 'zikir-salat-i-ummiye',
    title: 'Salât-ı Ümmiyye',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timeOrder: 9,
    description: 'Anadolu\'da yaygın olarak bilinen, kısa ve öz bir salavat; günün herhangi bir vaktinde tekrar edilir.',
    summary:
      'Hz. Peygamber\'in "ümmî" (okuma-yazma öğrenmemiş, bilgisi doğrudan vahiyle gelen) nübüvvet vasfını anan, Anadolu\'da rızık ve bereket niyetiyle de okunması yaygınlaşmış, kısa ve öz bir salavat şeklidir. Diğer salavatlar gibi günün herhangi bir vaktinde tekrar edilir; belirli bir hadis kaynağına dayanmaz, halk arasında yerleşmiş bir dua şeklidir.',
    arabic: `اَللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ نِ النَّبِيِّ الْاُمِّيِّ وَعَلٰى آلِهِ وَصَحْبِهِ وَسَلِّمْ`,
    transliteration: `Allâhümme salli alâ seyyidinâ Muhammedinin-nebiyyil ümmiyyi ve alâ âlihî ve sahbihî ve sellim.`,
    translation: `Allah'ım! Ümmî peygamber olan Efendimiz Muhammed'e, onun âline (ailesine) ve ashâbına salât ve selam eyle.`,
  },
  {
    id: 'zikir-tesrik-tekbiri',
    title: 'Teşrik Tekbiri',
    category: CATEGORY.ZIKIR,
    hukum: HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: FREQUENCY.OPTIONAL_DAILY,
    gender: 'all',
    timeOrder: 9,
    description:
      'Arefe günü sabah namazından Kurban Bayramı\'nın 4. günü ikindi namazına kadar, her farz namazın hemen ardından okunması Hanefi mezhebinde vaciptir; bu dönem dışında da nafile bir tekbir/zikir olarak günlük çekilebilir.',
    summary:
      'Zilhicce\'nin 9\'u (Arefe) sabah namazından başlayıp bayramın 4. günü ikindi namazına kadar, aralıksız 23 vakit farz namazın hemen ardından okunması Hanefi mezhebinde vaciptir. Bu özel dönemin dışında da, sadece bir tekbir/zikir olarak günün herhangi bir vaktinde nafile niyetiyle çekilebilir.',
    arabic: `اَللّٰهُ اَكْبَرُ اَللّٰهُ اَكْبَرُ لَا اِلٰهَ اِلَّا اللّٰهُ وَاللّٰهُ اَكْبَرُ اَللّٰهُ اَكْبَرُ وَلِلّٰهِ الْحَمْدُ`,
    transliteration: `Allâhü ekber Allâhü ekber, lâ ilâhe illallâhü vallâhü ekber. Allâhü ekber ve lillâhi'l-hamd.`,
    translation: `Allah en büyüktür, Allah en büyüktür. Allah'tan başka ilah yoktur. Allah en büyüktür, Allah en büyüktür. Hamd yalnızca Allah'adır.`,
  },
];

export function getById(id) {
  return IBADETLER.find((i) => i.id === id);
}

export function getByCategory(category) {
  return IBADETLER.filter((i) => i.category === category);
}

// İlave (kullanıcı tanımlı) ibadet oluşturmak için kullanılan seçenekler ve fabrika fonksiyonu.
export const CUSTOM_FREQUENCY_OPTIONS = [
  { value: FREQUENCY.DAILY, label: 'Her gün (zorunlu listede)' },
  { value: FREQUENCY.OPTIONAL_DAILY, label: 'Her gün (nafile listesinde)' },
  { value: FREQUENCY.YEARLY_ONCE, label: 'Yılda bir (takvime bağlı değil)' },
  { value: FREQUENCY.LIFETIME, label: 'Ömürde bir' },
];

export const CUSTOM_HUKUM_OPTIONS = Object.values(HUKUM);

export function createCustomItem({ title, category, hukum, frequency, rekat, description }) {
  return {
    id: `custom-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    title: title.trim(),
    category: category || CATEGORY.DIGER,
    hukum: hukum || HUKUM.SUNNET_GAYRIMUEKKEDE,
    frequency: frequency || FREQUENCY.OPTIONAL_DAILY,
    rekat: rekat ? Number(rekat) : undefined,
    gender: 'all',
    description: description?.trim() || 'Kullanıcı tarafından eklenen ilave ibadet.',
    custom: true,
  };
}

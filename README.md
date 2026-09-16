# İbadetlerim 🕌✅

Sünni itikat (Hanefi fıkhı esaslı) ibadetlerin **farz / vacip / sünnet**
sınıflandırmasına göre günlük, haftalık ve yıllık takibini yapan bir
checklist uygulaması. İçerik temeli: [`../docs/ibadetler-farz-vacip-sunnet.md`](../docs/ibadetler-farz-vacip-sunnet.md).

Cross-platform: **Expo / React Native** → iOS, Android ve web.

---

## Özellikler

- **Bugün** sekmesi: günlük farz namazlar, vacip (vitir, gerektiğinde bayram
  namazı/kurban), sünnet-i müekkede namazlar tek listede; işaretledikçe
  kesintisiz seri (streak) ve günlük tamamlanma yüzdesi hesaplanır.
- **Kategoriler**: Namaz, Oruç, Zekât, Hac & Umre, Kurban başlıkları altında
  tüm ibadetlerin farz/vacip/sünnet etiketli tam listesi ve detay açıklaması
  (mezhep notlarıyla birlikte).
- **İstatistik**: seri, son 7/30 gün tamamlanma oranı, son 14 günün grafiği,
  "ömürde bir" (hac, umre) ve "bu yıl" (zekât, fitre vb.) ibadetlerin durumu.
- **Geçmiş**: geçmişe dönük **kaza** takibi — yalnızca namazın farz ve vacip
  vakitleri (Sabah, Öğle/Cuma, İkindi, Akşam, Yatsı, Vitir) için, seçilen bir
  başlangıç tarihinden bugüne kadar gün gün kılındı/kılınmadı işaretlenir;
  toplam ve vakit bazlı borç özeti, günlük/aralıklı toplu işaretleme
  araçlarıyla birlikte. Cuma günleri "Öğle" slotu otomatik olarak Cuma
  namazına döner. Diğer ibadetler geçmişe gitmez, yalnızca bugünden devam
  eder.
- **İlave İbadet Ekle**: Kategoriler ekranından kullanıcı kendi ibadetini
  (başlık, kategori, hüküm, sıklık, rekât, açıklama) tanımlayıp
  Bugün/Kategoriler/İstatistik listelerine dahil edebilir, silebilir.
- **Ayarlar**: cinsiyet (Cuma/bayram namazı hükmünü etkiler), nafile
  ibadetleri gösterme anahtarı, kurban yükümlülüğü anahtarı, Ramazan ve
  bayram tarihleri — **AlAdhan takvim servisinden "Otomatik Getir"** ile
  doldurulabilir veya elle girilebilir (kamerî takvim yıldan yıla kaydığı ve
  hesaplama yöntemi Diyanet'in resmî ilanından ±1 gün farklı olabildiği için
  her zaman elle düzeltme imkânı bırakılmıştır).
- **Yedekle / Geri Yükle**: tüm veriler (işaretlemeler, ilave ibadetler,
  ayarlar) panoya kopyalanabilir bir JSON metni olarak dışa/içe aktarılabilir
  — cihaz değişiminde veri kaybını önler.
- Tüm veriler cihazda **AsyncStorage** ile kalıcı saklanır; internet yalnızca
  "Otomatik Getir" özelliği için kullanılır, uygulamanın geri kalanı
  tamamen çevrimdışı çalışır.

## Kurulum ve çalıştırma

```bash
cd ibadet-takip
npm install
npm start          # Expo geliştirici aracı
npm run android
npm run ios
npm run web
npm run gen:assets # ikon / splash / favicon görsellerini üret
npm test           # Jest ile mantık katmanı (schedule/kaza/stats/hijriApi) testleri
```

## Proje yapısı

```
App.js
app.json
src/
  data/ibadetler.js        # farz/vacip/sünnet ibadet veri modeli + ilave ibadet fabrikası
  state/TrackerContext.js  # günlük/yıllık/ömürlük işaretleme + ilave ibadetler + yedekleme + kalıcı saklama
  logic/schedule.js        # "bugün" listesini sıklık/gün/ayar bazlı üretir
  logic/kaza.js            # geçmiş namaz (kaza) günlük slot çözümü + borç özeti
  logic/stats.js           # seri ve tamamlanma istatistikleri
  logic/date.js            # yerel tarih yardımcıları
  logic/hijriApi.js        # AlAdhan servisinden Ramazan/bayram tarihlerini çeker (hicri hesaplama yapmaz)
  logic/__tests__/         # Jest testleri (schedule/kaza/stats/date/hijriApi)
  components/common.js     # HukumBadge, CheckRow, Card, PrimaryButton, DateField, ConfirmModal
  screens/                 # Bugün, Geçmiş, Kategoriler, İbadet Detayı, İlave İbadet Ekle,
                            # İstatistik, Ayarlar, Yedekle/Geri Yükle
  navigation/RootNavigator.js
scripts/gen-assets.js      # ikon/splash/favicon üretimi (harici bağımlılık yok)
```

## Fıkhi kapsam notu

Hüküm sınıflandırması Hanefi mezhebi esas alınarak yapılmıştır (Vacip,
yalnızca Hanefi fıkhında ayrı bir kategori olarak vardır). Diğer üç Sünni
mezhep arasındaki temel farklar `docs/ibadetler-farz-vacip-sunnet.md`
içindeki karşılaştırma tablosunda özetlenmiştir. Uygulama genel bir ilmihal
niteliğindedir, bağlayıcı fetva yerine geçmez.

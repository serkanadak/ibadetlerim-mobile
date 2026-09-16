// YEDEK HATIRLATICISI.
//
// Tarayıcı verisi kalıcı değilse silinebiliyor (iOS Safari, siteye 7 gün
// girilmezse script ile yazılmış her şeyi temizler). Tek gerçek güvence,
// verinin cihazda bir DOSYA olarak da durması. Bu yüzden yedek almak
// "Yedekle" ekranının içinde beklemek yerine ana ekranda tek dokunuşla
// erişilebilir ve gerektiğinde kendisi hatırlatır.
//
// Hatırlatma koşulu (birinden biri):
//   * hiç yedek alınmamış,
//   * son yedekten bu yana 3 günden fazla geçmiş,
//   * son yedekten bu yana 10+ yeni işaret eklenmiş.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useTracker } from '../state/TrackerContext';
import { buildBackup, backupFileName, backupStats } from '../logic/backup';
import { canShareFiles, shareBackup, downloadBackup } from '../logic/backupFile';
import { isStoragePersisted, requestPersistentStorage } from '../logic/storage';
import { colors, ON_ACCENT, DANGER } from '../theme';

const DAY = 86400000;
const REMIND_AFTER = 3 * DAY;
const REMIND_AFTER_MARKS = 10;

export function shouldRemind(settings, stats) {
  const last = Number(settings?.lastBackupAt) || 0;
  if (!last) return true;
  if (Date.now() - last > REMIND_AFTER) return true;
  const before = settings?.lastBackupStats || {};
  return stats.marks - (before.marks || 0) >= REMIND_AFTER_MARKS;
}

export default function BackupReminder({ navigation }) {
  const { byDate, byYear, lifetime, customItems, settings, updateSettings, readFailed, writeFailed } = useTracker();
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const [persisted, setPersisted] = useState(undefined);

  useEffect(() => {
    let alive = true;
    isStoragePersisted().then((v) => alive && setPersisted(v));
    return () => {
      alive = false;
    };
  }, []);

  const data = { byDate, byYear, lifetime, customItems, settings };
  const stats = backupStats(data);
  if (Platform.OS !== 'web') return null;

  // KRİTİK DURUM: veri okunamadıysa hiçbir değişiklik kaydedilmiyor, ya da
  // yazma başarısız oluyor. Bu, "Yedekle" ekranının içinde kalmayacak kadar
  // önemli; ana ekranda gösterilir ve kapatılamaz.
  if (readFailed || writeFailed) {
    return (
      <View style={[styles.card, styles.alarm]}>
        <Text style={styles.alarmTitle}>{readFailed ? '⛔ Veriler okunamadı' : '⛔ Kaydedilemedi'}</Text>
        <Text style={styles.text}>
          {readFailed
            ? 'Kayıtlı veriler bu oturumda okunamadı. Üzerine yazılmasını engelledim: şu an yaptığınız işaretlemeler KAYDEDİLMİYOR. Uygulamayı kapatıp tekrar açın; sürmesi hâlinde “Yedekle” ekranından cihazı tarayın.'
            : 'Son değişiklikler cihaza kaydedilemedi (depolama dolu ya da tarayıcı engelliyor olabilir). Bir yedek dosyası alın.'}
        </Text>
        <View style={styles.actions}>
          {navigation ? (
            <Pressable onPress={() => navigation.navigate('Backup')} style={styles.btn}>
              <Text style={styles.btnText}>Yedekle ekranını aç</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  if (!stats.marks && !stats.custom) return null; // henüz kaydedilecek bir şey yok
  if (hidden) return null;
  // `done` varken kart açık kalır ki kullanıcı onayı görebilsin.
  if (!done && !shouldRemind(settings, stats)) return null;

  const takeBackup = async () => {
    setBusy(true);
    setDone('');
    try {
      const text = buildBackup(data);
      const name = backupFileName();
      const ok = canShareFiles() ? await shareBackup(text, name) : downloadBackup(text, name);
      if (ok) {
        updateSettings({ lastBackupAt: Date.now(), lastBackupStats: stats });
        setDone('✓ Yedek dosyası hazır. Kaybolmayacak bir yere kaydet.');
      } else {
        setDone('Dosya kaydedilemedi. “Yedekle” ekranından tekrar dene.');
      }
    } catch (e) {
      setDone('Dosya kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  const askPersist = async () => {
    const r = await requestPersistentStorage();
    setPersisted(r.supported ? r.persisted : null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>💾 Verilerini yedekle</Text>
        <Pressable onPress={() => setHidden(true)} hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.text}>
        {stats.days} gün · {stats.marks} işaret · {stats.custom} ilave ibadet yalnızca bu tarayıcıda duruyor. Tek
        dosyaya kaydet: telefonu değiştirsen ya da tarayıcı verini silse bile geri yükleyebilirsin.
      </Text>
      {persisted === false ? (
        <Text style={styles.warn}>⚠️ Kalıcı depolama kapalı: tarayıcı bu verileri kendiliğinden silebilir.</Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable onPress={takeBackup} disabled={busy} style={styles.btn}>
          <Text style={styles.btnText}>{busy ? 'Hazırlanıyor…' : '💾 Yedek al'}</Text>
        </Pressable>
        {persisted === false ? (
          <Pressable onPress={askPersist} hitSlop={6}>
            <Text style={styles.link}>🔒 Kalıcı depolama izni ver</Text>
          </Pressable>
        ) : null}
        {navigation ? (
          <Pressable onPress={() => navigation.navigate('Backup')} hitSlop={6}>
            <Text style={styles.link}>Yedekle ekranı →</Text>
          </Pressable>
        ) : null}
      </View>
      {done ? <Text style={styles.done}>{done}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { color: colors.text, fontSize: 14, fontWeight: '800', flex: 1 },
  close: { color: colors.textMuted, fontSize: 14, fontWeight: '800' },
  text: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  warn: { color: DANGER, fontSize: 12, lineHeight: 17, marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  btnText: { color: ON_ACCENT, fontSize: 13, fontWeight: '800' },
  link: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  done: { color: colors.success, fontSize: 12, lineHeight: 17, marginTop: 10 },
  alarm: { borderColor: DANGER },
  alarmTitle: { color: DANGER, fontSize: 14, fontWeight: '800' },
});

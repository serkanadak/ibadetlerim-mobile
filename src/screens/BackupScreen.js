import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useTracker } from '../state/TrackerContext';
import { buildBackup, backupFileName, parseBackup, mergeBackup, backupStats } from '../logic/backup';
import { canShareFiles, shareBackup, downloadBackup, pickBackupFile } from '../logic/backupFile';
import {
  scanSources,
  readSource,
  reportText,
  isStoragePersisted,
  requestPersistentStorage,
  storageEstimate,
} from '../logic/storage';
import { colors, DANGER } from '../theme';
import { Card, SectionHeader, PrimaryButton, ConfirmModal } from '../components/common';

const fmtBytes = (n) => (n == null ? '?' : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);

export default function BackupScreen({ navigation }) {
  const {
    byDate,
    byYear,
    lifetime,
    customItems,
    settings,
    exportSnapshot,
    importSnapshot,
    replaceAll,
    readFailed,
    writeFailed,
    blockedLoss,
    updateSettings,
  } = useTracker();

  const data = { byDate, byYear, lifetime, customItems, settings };
  const stats = backupStats(data);

  const [copyStatus, setCopyStatus] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importNote, setImportNote] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [fileBusy, setFileBusy] = useState('');
  const [fileNote, setFileNote] = useState('');

  // --- depolama durumu ---
  const [persisted, setPersisted] = useState(undefined);
  const [estimate, setEstimate] = useState(undefined);
  useEffect(() => {
    let alive = true;
    isStoragePersisted().then((v) => alive && setPersisted(v));
    storageEstimate().then((v) => alive && setEstimate(v));
    return () => {
      alive = false;
    };
  }, []);
  const askPersist = async () => {
    const r = await requestPersistentStorage();
    setPersisted(r.supported ? r.persisted : null);
  };

  // --- kurtarma ---
  const [scan, setScan] = useState(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [pendingRecover, setPendingRecover] = useState(null);
  const [recoverNote, setRecoverNote] = useState('');
  const doScan = async () => {
    setScanBusy(true);
    setRecoverNote('');
    try {
      setScan(await scanSources());
    } catch (e) {
      setScan({ sources: [], errors: [e.message || 'tarama başarısız'], estimate: null, persisted: null, standalone: false });
    } finally {
      setScanBusy(false);
    }
  };
  const useSource = async (src) => {
    setRecoverNote('');
    try {
      const payload = await readSource(src);
      const d = payload && payload.data && typeof payload.data === 'object' ? payload.data : payload;
      if (!d || typeof d !== 'object') {
        setRecoverNote('Bu kayıt okunamadı.');
        return;
      }
      const merged = mergeBackup(data, {
        byDate: d.byDate || {},
        byYear: d.byYear || {},
        lifetime: d.lifetime || {},
        customItems: d.customItems || [],
        settings: d.settings || {},
      });
      setPendingRecover({ src, merged });
    } catch (e) {
      setRecoverNote('Bu kayıt okunamadı.');
    }
  };
  const confirmRecover = () => {
    if (!pendingRecover) return;
    replaceAll(pendingRecover.merged.data);
    const a = pendingRecover.merged.added;
    setRecoverNote(`✓ Birleştirildi: ${a.days} yeni gün, ${a.marks} yeni işaret, ${a.custom} ilave ibadet eklendi.`);
    setPendingRecover(null);
    setScan(null);
  };
  const copyReport = async () => {
    if (!scan) return;
    try {
      await Clipboard.setStringAsync(reportText(scan));
      setRecoverNote('Rapor panoya kopyalandı ✓');
    } catch (e) {
      setRecoverNote('Rapor kopyalanamadı.');
    }
  };

  // --- pano ile yedek (eski yol, korundu) ---
  const copyBackup = async () => {
    try {
      await Clipboard.setStringAsync(exportSnapshot());
      updateSettings({ lastBackupAt: Date.now(), lastBackupStats: stats });
      setCopyStatus('Panoya kopyalandı ✓');
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (e) {
      setCopyStatus('Kopyalama başarısız oldu.');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      setImportText(text);
      setImportError('');
    } catch (e) {
      setImportError('Panodan okunamadı.');
    }
  };

  // --- dosya ile yedek (yeni) ---
  const saveFile = async (share) => {
    setFileNote('');
    setFileBusy(share ? 'share' : 'save');
    try {
      const text = buildBackup(data);
      const name = backupFileName();
      const ok = share ? await shareBackup(text, name) : downloadBackup(text, name);
      if (ok) {
        updateSettings({ lastBackupAt: Date.now(), lastBackupStats: stats });
        setFileNote(`✓ Yedek dosyası hazır (${fmtBytes(text.length)}). Kaybolmayacak bir yere kaydet.`);
      } else {
        setFileNote('Dosya kaydedilemedi. Safari sekmesinden ya da "Paylaş" ile dene.');
      }
    } catch (e) {
      setFileNote('Dosya kaydedilemedi.');
    } finally {
      setFileBusy('');
    }
  };

  const loadFile = async () => {
    setImportError('');
    setImportNote('');
    setFileBusy('pick');
    try {
      const text = await pickBackupFile();
      if (!text) return;
      setImportText(text);
      const parsed = parseBackup(text);
      if (parsed.error) setImportError(parsed.error);
      else setConfirmVisible(true);
    } catch (e) {
      setImportError('Dosya okunamadı.');
    } finally {
      setFileBusy('');
    }
  };

  const doImport = () => {
    const res = importSnapshot(importText);
    setConfirmVisible(false);
    if (res && res.error) {
      setImportError(res.error);
      return;
    }
    setImportError('');
    const a = (res && res.added) || { days: 0, marks: 0, custom: 0 };
    setImportNote(`✓ Birleştirildi: ${a.days} yeni gün, ${a.marks} yeni işaret, ${a.custom} ilave ibadet eklendi.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {readFailed ? (
          <Card style={styles.alarm}>
            <Text style={styles.alarmText}>
              ⛔ Kayıtlı veriler OKUNAMADI. Verinizin üzerine yazılmasını engelledim: bu oturumda hiçbir değişiklik
              kaydedilmeyecek. Aşağıdaki “Veri kurtarma”dan cihazı tarayın.
            </Text>
          </Card>
        ) : null}
        {writeFailed ? (
          <Card style={styles.alarm}>
            <Text style={styles.alarmText}>
              ⛔ Son değişiklikler cihaza KAYDEDİLEMEDİ (depolama dolu ya da tarayıcı engelliyor olabilir). Aşağıdan bir
              yedek dosyası alın.
            </Text>
          </Card>
        ) : null}
        {blockedLoss ? (
          <Card style={styles.alarm}>
            <Text style={styles.alarmText}>
              ⛔ Bir kaydetme DURDURULDU: cihazdaki kayıtta {blockedLoss.days} gün / {blockedLoss.marks} işaret varken
              uygulamada görünmüyor. Üzerine yazılmasını engelledim; “Veri kurtarma”yı kullanın.
            </Text>
          </Card>
        ) : null}

        <SectionHeader
          title="Dosya olarak yedekle"
          subtitle="En güvenli yol: tüm işaretlemeler, ilave ibadetler ve ayarlar tek dosyaya kaydedilir"
        />
        <Card>
          <Text style={styles.stat}>
            Bu cihazda: {stats.days} gün · {stats.marks} işaret · {stats.custom} ilave ibadet
            {stats.first ? ` · ${stats.first} – ${stats.last}` : ''}
          </Text>
          {canShareFiles() ? (
            <PrimaryButton
              title={fileBusy === 'share' ? 'Hazırlanıyor…' : '📤 Yedeği paylaş (Dosyalara Kaydet)'}
              onPress={() => saveFile(true)}
              disabled={!!fileBusy}
            />
          ) : null}
          <View style={{ height: 8 }} />
          <PrimaryButton
            title={fileBusy === 'save' ? 'Hazırlanıyor…' : '💾 Yedek dosyasını indir'}
            onPress={() => saveFile(false)}
            disabled={!!fileBusy}
          />
          <View style={{ height: 8 }} />
          <PrimaryButton
            title={fileBusy === 'pick' ? 'Okunuyor…' : '📥 Yedek dosyasından geri yükle'}
            onPress={loadFile}
            disabled={!!fileBusy}
          />
          {fileNote ? <Text style={styles.status}>{fileNote}</Text> : null}
          <Text style={styles.hint}>
            Geri yükleme BİRLEŞTİRİR: yedekte olan işaretler eklenir, cihazdaki mevcut işaretlerin hiçbiri silinmez.
          </Text>
        </Card>

        <SectionHeader title="Depolama durumu" subtitle="Tarayıcı verinizi silebilir mi?" />
        <Card>
          {persisted === true ? (
            <Text style={styles.ok}>✅ Kalıcı depolama açık: tarayıcı verilerinizi kendiliğinden silmez.</Text>
          ) : persisted === false ? (
            <>
              <Text style={styles.warn}>
                ⚠️ Kalıcı depolama KAPALI. Tarayıcı, yer daralınca ya da siteye uzun süre girilmezse (iOS Safari’de 7
                gün) verilerinizi silebilir.
              </Text>
              <View style={{ height: 8 }} />
              <PrimaryButton title="🔒 Kalıcı depolama izni ver" onPress={askPersist} />
              <Text style={styles.hint}>
                İzin verilmezse en kesin çözüm siteyi ana ekrana eklemektir (Safari’de Paylaş → Ana Ekrana Ekle).
              </Text>
            </>
          ) : (
            <Text style={styles.hint}>Bu tarayıcı kalıcılık bilgisini vermiyor.</Text>
          )}
          {estimate && estimate.quota ? (
            <Text style={styles.hint}>
              Kullanılan alan: {fmtBytes(estimate.usage)} / {fmtBytes(estimate.quota)}
            </Text>
          ) : null}
          <Text style={styles.hint}>
            Veriler artık iki yere birden yazılıyor (tarayıcı belleği + IndexedDB); biri silinse diğeri kurtarır.
          </Text>
        </Card>

        <SectionHeader title="🔧 Veri kurtarma" subtitle="Verileriniz eksik görünüyorsa cihazdaki tüm kayıt yerlerini tarar" />
        <Card>
          <PrimaryButton title={scanBusy ? 'Taranıyor…' : '🔍 Cihazı tara'} onPress={doScan} disabled={scanBusy} />
          {scan ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.hint}>
                {scan.standalone ? 'Ana ekran uygulaması' : 'Tarayıcı sekmesi'} · kullanılan alan:{' '}
                {scan.estimate ? fmtBytes(scan.estimate.usage) : '?'}
              </Text>
              {scan.sources.filter((s) => s.counts).length ? (
                scan.sources
                  .filter((s) => s.counts)
                  .map((s) => (
                    <View key={s.place + (s.db || '') + s.key} style={styles.row}>
                      <Text style={styles.rowLabel}>{s.label}</Text>
                      <Text style={styles.rowMeta}>
                        {s.counts.days} gün · {s.counts.marks} işaret · {s.counts.custom} ilave · {fmtBytes(s.bytes)}
                        {s.rev != null ? ` · rev ${s.rev}` : ''}
                      </Text>
                      <Pressable onPress={() => useSource(s)} hitSlop={6}>
                        <Text style={styles.rowBtn}>→ Bunu kullan (birleştir)</Text>
                      </Pressable>
                    </View>
                  ))
              ) : (
                <Text style={styles.warn}>
                  ⚠️ Bu depolama alanında veri içeren hiçbir kayıt bulunamadı. Yukarıdaki “kullanılan alan” birkaç
                  KB’ın üzerindeyse veri başka bir yerde olabilir; ~0 ise tarayıcı silmiş demektir.
                </Text>
              )}
              <Pressable onPress={copyReport} hitSlop={6}>
                <Text style={styles.rowBtn}>📋 Raporu kopyala</Text>
              </Pressable>
              <Text style={styles.report} selectable>
                {reportText(scan)}
              </Text>
            </View>
          ) : null}
          {recoverNote ? <Text style={styles.status}>{recoverNote}</Text> : null}
        </Card>

        <SectionHeader title="Panoya yedekle" subtitle="Dosya kullanmak istemezsen metin olarak da alabilirsin" />
        <Card>
          <PrimaryButton title="Yedeği Panoya Kopyala" onPress={copyBackup} />
          {copyStatus ? <Text style={styles.status}>{copyStatus}</Text> : null}
          <Text style={styles.hint}>
            Kopyaladıktan sonra bir notlar/mesaj uygulamasına yapıştırıp saklayabilirsin. Dosya yedeği daha güvenlidir.
          </Text>
        </Card>

        <SectionHeader title="Metinden geri yükle" subtitle="Daha önce kopyaladığın yedek metnini buraya yapıştır" />
        <Card>
          <TextInput
            style={styles.textArea}
            value={importText}
            onChangeText={(v) => {
              setImportText(v);
              setImportError('');
            }}
            placeholder="Yedek JSON metnini buraya yapıştır..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Pressable style={styles.pasteBtn} onPress={pasteFromClipboard}>
            <Text style={styles.pasteText}>Panodan Yapıştır</Text>
          </Pressable>
          {importError ? <Text style={styles.error}>{importError}</Text> : null}
          {importNote ? <Text style={styles.status}>{importNote}</Text> : null}
          <PrimaryButton title="Geri Yükle" onPress={() => setConfirmVisible(true)} disabled={!importText.trim()} />
          <Text style={styles.hint}>
            Geri yükleme birleştirir: mevcut işaretlerin silinmez, yedekteki eksik olanlar eklenir.
          </Text>
        </Card>
      </ScrollView>

      <ConfirmModal
        visible={confirmVisible}
        title="Yedek birleştirilsin mi?"
        message="Yedekteki işaretler mevcut verilerinizin üzerine EKLENİR. Cihazdaki hiçbir işaret silinmez."
        confirmLabel="Birleştir"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={doImport}
      />
      <ConfirmModal
        visible={!!pendingRecover}
        title="Bu kayıt kullanılsın mı?"
        message={
          pendingRecover
            ? `${pendingRecover.src.label}\n\n${pendingRecover.merged.added.days} yeni gün, ${pendingRecover.merged.added.marks} yeni işaret eklenecek. Mevcut işaretleriniz silinmez.`
            : ''
        }
        confirmLabel="Birleştir"
        onCancel={() => setPendingRecover(null)}
        onConfirm={confirmRecover}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  status: { color: colors.success, fontWeight: '700', marginTop: 10, fontSize: 12, lineHeight: 17 },
  ok: { color: colors.success, fontSize: 12, lineHeight: 17 },
  warn: { color: DANGER, fontSize: 12, lineHeight: 17 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 10, lineHeight: 17 },
  stat: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  alarm: { borderWidth: 1, borderColor: DANGER },
  alarmText: { color: DANGER, fontSize: 12, lineHeight: 18 },
  row: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
  rowLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  rowMeta: { color: colors.textMuted, fontSize: 11, marginTop: 3, lineHeight: 16 },
  rowBtn: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 6 },
  report: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  textArea: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  pasteBtn: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pasteText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  error: { color: DANGER, fontSize: 12, marginTop: 8 },
});

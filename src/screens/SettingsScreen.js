import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTracker } from '../state/TrackerContext';
import { fetchIslamicCalendarDates } from '../logic/hijriApi';
import { colors, ON_ACCENT, DANGER } from '../theme';
import { Card, SectionHeader, DateField, ConfirmModal, PrimaryButton } from '../components/common';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, reset, todayKey } = useTracker();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchedAt, setFetchedAt] = useState('');

  const autoFetchDates = async () => {
    setFetching(true);
    setFetchError('');
    try {
      const dates = await fetchIslamicCalendarDates(todayKey);
      updateSettings(dates);
      setFetchedAt(todayKey);
    } catch (e) {
      setFetchError(e.message || 'Tarihler getirilemedi.');
    } finally {
      setFetching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Ayarlar</Text>

        <SectionHeader title="Cinsiyet" subtitle="Cuma namazı ve bayram namazı hükmünü etkiler (Hanefi mezhebi)" />
        <Card>
          <View style={styles.genderRow}>
            {['male', 'female'].map((g) => (
              <Pressable
                key={g}
                onPress={() => updateSettings({ gender: g })}
                style={[styles.genderBtn, settings.gender === g && styles.genderBtnActive]}
              >
                <Text style={[styles.genderText, settings.gender === g && styles.genderTextActive]}>
                  {g === 'male' ? 'Erkek' : 'Kadın'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <SectionHeader title="Nafile İbadetler" />
        <Card>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Nafile/ek sünnetleri "Bugün" listesinde göster</Text>
            <Switch
              value={settings.showNafile}
              onValueChange={(v) => updateSettings({ showNafile: v })}
              trackColor={{ true: colors.success, false: colors.border }}
            />
          </View>
        </Card>

        <SectionHeader title="Kurban" subtitle="Kurban Bayramı'nda vacip kurban hatırlatması için" />
        <Card>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Kurban kesmekle yükümlüyüm (nisap sahibiyim)</Text>
            <Switch
              value={settings.kurbanEligible}
              onValueChange={(v) => updateSettings({ kurbanEligible: v })}
              trackColor={{ true: colors.success, false: colors.border }}
            />
          </View>
        </Card>

        <SectionHeader
          title="Kamerî Takvim Tarihleri"
          subtitle="Ramazan ve bayram tarihlerini otomatik getir, gerekirse elle düzelt (YYYY-AA-GG)"
        />
        <Card>
          {fetching ? (
            <View style={styles.fetchingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.fetchingText}>Tarihler getiriliyor...</Text>
            </View>
          ) : (
            <PrimaryButton title="Otomatik Getir" onPress={autoFetchDates} />
          )}
          {fetchError ? <Text style={styles.error}>{fetchError}</Text> : null}
          {fetchedAt ? <Text style={styles.fetchedNote}>✓ {fetchedAt} tarihinde güncellendi</Text> : null}
          <Text style={styles.hint}>
            Tarihler AlAdhan takvim servisinden hesaplama yöntemiyle getirilir; Diyanet'in görüşe dayalı ilan
            ettiği resmî tarihlerden ±1 gün farklı olabilir. Emin olmak için aşağıdan elle kontrol/düzelt.
          </Text>
          <DateField label="Ramazan başlangıcı" value={settings.ramadanStart} onChange={(v) => updateSettings({ ramadanStart: v })} />
          <DateField label="Ramazan bitişi" value={settings.ramadanEnd} onChange={(v) => updateSettings({ ramadanEnd: v })} />
          <DateField
            label="Ramazan Bayramı başlangıcı"
            value={settings.eidRamadanStart}
            onChange={(v) => updateSettings({ eidRamadanStart: v })}
          />
          <DateField
            label="Ramazan Bayramı bitişi"
            value={settings.eidRamadanEnd}
            onChange={(v) => updateSettings({ eidRamadanEnd: v })}
          />
          <DateField
            label="Kurban Bayramı başlangıcı"
            value={settings.eidKurbanStart}
            onChange={(v) => updateSettings({ eidKurbanStart: v })}
          />
          <DateField
            label="Kurban Bayramı bitişi"
            value={settings.eidKurbanEnd}
            onChange={(v) => updateSettings({ eidKurbanEnd: v })}
          />
        </Card>

        <SectionHeader title="Veri" />
        <PrimaryButton title="Yedekle / Geri Yükle" onPress={() => navigation.navigate('Backup')} />
        <Pressable style={styles.resetBtn} onPress={() => setConfirmVisible(true)}>
          <Text style={styles.resetText}>Tüm verileri sıfırla</Text>
        </Pressable>

        <Text style={styles.footnote}>
          Bu uygulama Hanefi fıkhı esas alınarak hazırlanmıştır ve genel bir ilmihal niteliğindedir; bağlayıcı fetva
          yerine geçmez.
        </Text>
      </ScrollView>

      <ConfirmModal
        visible={confirmVisible}
        title="Tüm veriler silinsin mi?"
        message="İşaretlemeler, ilave ibadetler ve ayarlar sıfırlanacak. Bu işlem geri alınamaz."
        confirmLabel="Sıfırla"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          reset();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { color: colors.textMuted, fontWeight: '700' },
  genderTextActive: { color: ON_ACCENT },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: colors.text, fontSize: 14, flex: 1, marginRight: 12, lineHeight: 19 },
  resetBtn: {
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DANGER,
  },
  resetText: { color: DANGER, fontWeight: '700' },
  footnote: { color: colors.textMuted, fontSize: 11, marginHorizontal: 16, marginTop: 16, lineHeight: 16 },
  fetchingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  fetchingText: { color: colors.textMuted, fontSize: 13 },
  error: { color: DANGER, fontSize: 12, marginTop: 8, textAlign: 'center' },
  fetchedNote: { color: colors.success, fontSize: 12, marginTop: 8, textAlign: 'center' },
  hint: { color: colors.textMuted, fontSize: 11, marginTop: 10, marginBottom: 6, lineHeight: 16 },
});

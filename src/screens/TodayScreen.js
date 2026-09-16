import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTracker } from '../state/TrackerContext';
import { getTodaySchedule, getDailyRequiredIdsForDate } from '../logic/schedule';
import { currentStreak } from '../logic/stats';
import { NAMAZ_GROUP_LABELS } from '../data/ibadetler';
import { colors } from '../theme';
import BackupReminder from '../components/BackupReminder';
import { CheckRow, SectionHeader, Card } from '../components/common';

const REKAT_LABEL = {
  farz_ayn: 'Farz',
  farz_kifaye: 'Farz',
  vacip: 'Vacip',
  sunnet_muekkede: 'Sünnet',
  sunnet_gayrimuekkede: 'Nafile',
};

function flattenIds(list) {
  const ids = [];
  for (const entry of list) {
    if (entry.isGroup) ids.push(...entry.items.map((i) => i.id));
    else ids.push(entry.id);
  }
  return ids;
}

export default function TodayScreen({ navigation }) {
  const {
    settings,
    todayKey,
    isCheckedToday,
    toggleToday,
    setCheckedToday,
    isCheckedYearly,
    toggleYearly,
    isNotApplicableYearly,
    toggleYearlyNotApplicable,
    byDate,
    customItems,
  } = useTracker();

  const { required, optional, yearlyReminders } = useMemo(
    () => getTodaySchedule({ dateKey: todayKey, settings, extraItems: customItems }),
    [todayKey, settings, customItems]
  );

  const streak = useMemo(() => currentStreak(byDate, getDailyRequiredIdsForDate), [byDate]);

  const requiredIds = flattenIds(required);
  const doneCount = requiredIds.filter((id) => isCheckedToday(id)).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <BackupReminder navigation={navigation} />
        <View style={styles.header}>
          <Text style={styles.title}>Bugün</Text>
          <Text style={styles.dateText}>{todayKey}</Text>
        </View>

        <Card style={styles.streakCard}>
          <Text style={styles.streakNumber}>🔥 {streak} gün</Text>
          <Text style={styles.streakLabel}>kesintisiz tam ibadet serisi</Text>
          <Text style={styles.progressText}>
            Bugün: {doneCount}/{requiredIds.length} tamamlandı
          </Text>
        </Card>

        <SectionHeader title="Farz, Vacip ve Sünnet-i Müekkede" subtitle="Bugüne ait zorunlu/müekked ibadetler" />
        {required.map((entry) => {
          if (entry.isGroup) {
            const allChecked = entry.items.every((i) => isCheckedToday(i.id));
            const hukumList = [...new Set(entry.items.map((i) => i.hukum))];
            const rekatText = entry.items.map((i) => `${REKAT_LABEL[i.hukum]} ${i.rekat}`).join(' + ');
            const detailTarget = entry.items.find((i) => i.hukum === 'farz_ayn') || entry.items[0];
            const isCumaGroup = entry.items.some((i) => i.id === 'namaz-cuma-farz');
            const groupTitle = isCumaGroup ? 'Cuma Namazı' : NAMAZ_GROUP_LABELS[entry.groupKey] || entry.items[0].title;
            return (
              <CheckRow
                key={entry.groupKey}
                title={groupTitle}
                hukumList={hukumList}
                rekatText={rekatText}
                checked={allChecked}
                onPress={() => entry.items.forEach((i) => setCheckedToday(i.id, !allChecked))}
                onLongPress={() => navigation.navigate('ItemDetail', { id: detailTarget.id })}
              />
            );
          }
          return (
            <CheckRow
              key={entry.id}
              title={entry.title}
              hukum={entry.hukum}
              rekat={entry.rekat}
              checked={isCheckedToday(entry.id)}
              onPress={() => toggleToday(entry.id)}
              onLongPress={() => navigation.navigate('ItemDetail', { id: entry.id })}
            />
          );
        })}

        {yearlyReminders.filter((i) => !isCheckedYearly(i.id) && !isNotApplicableYearly(i.id)).length > 0 && (
          <>
            <SectionHeader
              title="Bu Yıl İçin Hatırlatma"
              subtitle="Takvime bağlı olmayan, yılda bir işaretlenen ibadetler"
            />
            {yearlyReminders
              .filter((i) => !isCheckedYearly(i.id) && !isNotApplicableYearly(i.id))
              .map((item) => (
                <CheckRow
                  key={item.id}
                  title={item.title}
                  hukum={item.hukum}
                  checked={isCheckedYearly(item.id)}
                  onPress={() => toggleYearly(item.id)}
                  onLongPress={() => navigation.navigate('ItemDetail', { id: item.id })}
                  secondaryLabel="Bana uygulanmıyor"
                  onSecondaryPress={() => toggleYearlyNotApplicable(item.id)}
                />
              ))}
          </>
        )}

        {settings.showNafile && optional.length > 0 && (
          <>
            <SectionHeader title="Nafile (Opsiyonel)" subtitle="Ayarlar'dan açtığınız ek sünnet/nafile ibadetler" />
            {optional.map((item) => (
              <CheckRow
                key={item.id}
                title={item.timingLabel ? `${item.title} (${item.timingLabel})` : item.title}
                hukum={item.hukum}
                rekat={item.rekat}
                checked={isCheckedToday(item.id)}
                onPress={() => toggleToday(item.id)}
                onLongPress={() => navigation.navigate('ItemDetail', { id: item.id })}
              />
            ))}
          </>
        )}

        {!settings.showNafile && (
          <Text style={styles.hint}>
            İpucu: Nafile/ek sünnetleri de takip etmek için Ayarlar'dan "Nafile ibadetleri göster"i açabilirsin.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  dateText: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  streakCard: { alignItems: 'center', marginTop: 12 },
  streakNumber: { color: colors.primary, fontSize: 22, fontWeight: '800' },
  streakLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  progressText: { color: colors.text, fontSize: 13, marginTop: 8, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 12, marginHorizontal: 16, marginTop: 12, lineHeight: 18 },
});

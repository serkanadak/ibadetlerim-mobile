import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTracker } from '../state/TrackerContext';
import { currentStreak, averageCompletion, dailyHistory, itemCountInLastDays, expectedOccurrences } from '../logic/stats';
import { getLifetimeItems, getYearlyOnceItems, getDailyRequiredIdsForDate, getRecurringTrackableItems } from '../logic/schedule';
import { FREQUENCY } from '../data/ibadetler';
import { colors } from '../theme';
import { Card, SectionHeader, HukumBadge } from '../components/common';

const REQUIRED_RECURRING_FREQS = [FREQUENCY.DAILY, FREQUENCY.WEEKLY_FRIDAY];
const NAFILE_RECURRING_FREQS = [FREQUENCY.OPTIONAL_DAILY, FREQUENCY.OPTIONAL_WEEKLY_MON_THU, FREQUENCY.OPTIONAL_MONTHLY];
const STAT_WINDOW_DAYS = 30;

export default function StatsScreen({ navigation }) {
  const {
    byDate,
    isCheckedLifetime,
    isNotApplicableLifetime,
    isCheckedYearly,
    isNotApplicableYearly,
    yearKeyStr,
    customItems,
  } = useTracker();

  const streak = useMemo(() => currentStreak(byDate, getDailyRequiredIdsForDate), [byDate]);
  const avg7 = useMemo(() => averageCompletion(byDate, getDailyRequiredIdsForDate, 7), [byDate]);
  const avg30 = useMemo(() => averageCompletion(byDate, getDailyRequiredIdsForDate, 30), [byDate]);
  const history = useMemo(() => dailyHistory(byDate, getDailyRequiredIdsForDate, 14), [byDate]);

  const lifetimeItems = useMemo(() => getLifetimeItems(customItems), [customItems]);
  const yearlyItems = useMemo(() => getYearlyOnceItems(customItems), [customItems]);

  const recurringStats = useMemo(() => {
    return getRecurringTrackableItems(customItems).map((item) => ({
      item,
      count: itemCountInLastDays(byDate, item.id, STAT_WINDOW_DAYS),
      expected: expectedOccurrences(item, STAT_WINDOW_DAYS),
    }));
  }, [customItems, byDate]);

  const requiredStats = recurringStats.filter((s) => REQUIRED_RECURRING_FREQS.includes(s.item.frequency));
  const nafileStats = recurringStats.filter((s) => NAFILE_RECURRING_FREQS.includes(s.item.frequency));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>İstatistik</Text>

        <Card>
          <View style={styles.statsRow}>
            <Stat label="Seri" value={`${streak} gün`} />
            <Stat label="Son 7 gün" value={`%${avg7}`} />
            <Stat label="Son 30 gün" value={`%${avg30}`} />
          </View>
        </Card>

        <SectionHeader title="Son 14 Gün" subtitle="Günlük farz/vacip/sünnet-i müekkede tamamlanma oranı" />
        <Card>
          <View style={styles.barsRow}>
            {history.map((h) => (
              <View key={h.dateKey} style={styles.barWrap}>
                <View style={[styles.bar, { height: Math.max(4, h.ratio * 60) }]} />
              </View>
            ))}
          </View>
          <Text style={styles.barCaption}>eskiden bugüne →</Text>
        </Card>

        <SectionHeader
          title="Farz/Vacip/Sünnet-i Müekkede — İbadet Bazında"
          subtitle="Son 30 günde uygulanabildiği gün sayısına göre kaç kez kılındı/tutuldu"
        />
        {requiredStats.map(({ item, count, expected }) => (
          <ItemStatRow key={item.id} item={item} count={count} expected={expected} onPress={() => navigation.navigate('ItemDetail', { id: item.id })} />
        ))}

        <SectionHeader
          title="Nafile İbadetler — İbadet Bazında"
          subtitle="Son 30 günde kaç kez işaretlendi (Ayarlar'dan gösterilmesi gerekmez)"
        />
        {nafileStats.map(({ item, count, expected }) => (
          <ItemStatRow key={item.id} item={item} count={count} expected={expected} onPress={() => navigation.navigate('ItemDetail', { id: item.id })} />
        ))}

        <SectionHeader title="Ömürde Bir" subtitle="Hac, umre gibi bir kez yapılan ibadetler" />
        {lifetimeItems.map((item) => (
          <Pressable key={item.id} style={styles.simpleRow} onPress={() => navigation.navigate('ItemDetail', { id: item.id })}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text
              style={[
                styles.status,
                isCheckedLifetime(item.id) && styles.statusDone,
                isNotApplicableLifetime(item.id) && styles.statusNA,
              ]}
            >
              {isCheckedLifetime(item.id) ? '✓ Yapıldı' : isNotApplicableLifetime(item.id) ? 'Uygulanmıyor' : 'Bekliyor'}
            </Text>
          </Pressable>
        ))}

        <SectionHeader title={`Bu Yıl (${yearKeyStr})`} subtitle="Takvime bağlı olmayan yıllık ibadetler" />
        {yearlyItems.map((item) => (
          <Pressable key={item.id} style={styles.simpleRow} onPress={() => navigation.navigate('ItemDetail', { id: item.id })}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text
              style={[
                styles.status,
                isCheckedYearly(item.id) && styles.statusDone,
                isNotApplicableYearly(item.id) && styles.statusNA,
              ]}
            >
              {isCheckedYearly(item.id) ? '✓ Yapıldı' : isNotApplicableYearly(item.id) ? 'Uygulanmıyor' : 'Bekliyor'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ItemStatRow({ item, count, expected, onPress }) {
  return (
    <Pressable style={styles.simpleRow} onPress={onPress}>
      <Text style={styles.rowTitle}>{item.title}</Text>
      <View style={styles.itemStatRight}>
        <HukumBadge hukum={item.hukum} />
        <Text style={styles.itemStatValue}>{expected != null ? `${count}/${expected}` : `${count}×`}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8, marginBottom: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBlock: { alignItems: 'center' },
  statValue: { color: colors.primary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 64, justifyContent: 'space-between' },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 64 },
  bar: { width: 8, backgroundColor: colors.success, borderRadius: 4 },
  barCaption: { color: colors.textMuted, fontSize: 11, textAlign: 'right', marginTop: 6 },
  simpleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  status: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  statusDone: { color: colors.success },
  statusNA: { color: colors.textMuted, fontStyle: 'italic' },
  itemStatRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemStatValue: { color: colors.text, fontSize: 13, fontWeight: '800' },
});

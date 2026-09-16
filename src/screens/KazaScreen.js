import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTracker } from '../state/TrackerContext';
import {
  enumerateDates,
  computeKazaSummary,
  getKazaItemsForDate,
  yesterdayKey,
  KAZA_SLOT_META,
  monthKeyOf,
  monthLabel,
  monthShortLabel,
  yearsInRange,
  buildMonthKey,
} from '../logic/kaza';
import { todayKey, isValidDateKey } from '../logic/date';
import { colors, ON_ACCENT } from '../theme';
import { Card, DateField, PrimaryButton, ConfirmModal } from '../components/common';

function daysAgoKey(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
}

function DayRow({ day, byDate, onToggle, onMarkAll }) {
  const dayMap = byDate[day.dateKey] || {};
  return (
    <View style={[styles.dayRow, day.complete && styles.dayRowComplete]}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayDate}>{day.dateKey}</Text>
        <Text style={[styles.dayProgress, day.complete && styles.dayProgressComplete]}>
          {day.done}/{day.total}
        </Text>
      </View>
      <View style={styles.chipRow}>
        {day.items.map((item) => {
          const checked = !!dayMap[item.id];
          return (
            <Pressable
              key={item.slot}
              onPress={() => onToggle(day.dateKey, item.id)}
              style={[styles.chip, checked && styles.chipChecked]}
            >
              <Text style={[styles.chipText, checked && styles.chipTextChecked]}>{item.shortLabel}</Text>
            </Pressable>
          );
        })}
        <Pressable style={styles.markAllChip} onPress={() => onMarkAll(day)}>
          <Text style={styles.markAllText}>{day.complete ? 'Temizle' : 'Tümü'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function KazaScreen() {
  const { settings, updateSettings, byDate, toggleOnDate, bulkSetChecked } = useTracker();
  const [onlyIncomplete, setOnlyIncomplete] = useState(true);
  const [editingStart, setEditingStart] = useState(false);
  const [draftStart, setDraftStart] = useState(settings.kazaStartDate);
  const [rangeToolOpen, setRangeToolOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeConfirm, setRangeConfirm] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState(null); // null = tüm dönem, aksi halde 'YYYY-MM'
  const [pickerMonth, setPickerMonth] = useState(null); // seçici içindeki geçici gezinme ayı

  const endKey = yesterdayKey();
  const dates = useMemo(
    () => enumerateDates(settings.kazaStartDate, endKey),
    [settings.kazaStartDate, endKey]
  );

  const summary = useMemo(() => computeKazaSummary(byDate, dates), [byDate, dates]);

  const startMonthKey = monthKeyOf(settings.kazaStartDate);
  const endMonthKey = monthKeyOf(endKey);
  const years = useMemo(() => yearsInRange(startMonthKey, endMonthKey), [startMonthKey, endMonthKey]);
  const [pickerYear, pickerMonthNum] = pickerMonth ? pickerMonth.split('-').map(Number) : [null, null];

  const visibleDays = useMemo(() => {
    let days = summary.days;
    if (monthFilter) days = days.filter((d) => monthKeyOf(d.dateKey) === monthFilter);
    if (onlyIncomplete) days = days.filter((d) => !d.complete);
    return days;
  }, [summary.days, monthFilter, onlyIncomplete]);

  const applyPreset = (n) => {
    const start = daysAgoKey(n);
    updateSettings({ kazaStartDate: start });
    setDraftStart(start);
    setEditingStart(false);
  };

  const draftStartValid = isValidDateKey(draftStart);

  const saveDraft = () => {
    if (draftStartValid) {
      updateSettings({ kazaStartDate: draftStart });
      setEditingStart(false);
    }
  };

  const markAllForDay = (day) => {
    const targetValue = !day.complete;
    bulkSetChecked(
      day.items.map((item) => ({ dateKey: day.dateKey, itemId: item.id })),
      targetValue
    );
  };

  const applyRangeMark = () => {
    const rangeDates = enumerateDates(rangeStart, rangeEnd);
    const pairs = rangeDates.flatMap((dk) => getKazaItemsForDate(dk).map((item) => ({ dateKey: dk, itemId: item.id })));
    bulkSetChecked(pairs, true);
    setRangeConfirm(false);
    setRangeToolOpen(false);
  };

  if (!isValidDateKey(settings.kazaStartDate) || editingStart) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ paddingBottom: 32 }}>
          <Text style={styles.title}>Geçmiş Namazlar</Text>
          <Text style={styles.subtitle}>
            Kılınmamış farz ve vacip namazları (kaza borcunu) gün gün takip etmek için hangi tarihten itibaren
            başlayacağını belirt.
          </Text>
          <Card>
            <View style={styles.presetRow}>
              {[7, 30, 90, 365].map((n) => (
                <Pressable key={n} style={styles.presetBtn} onPress={() => applyPreset(n)}>
                  <Text style={styles.presetText}>{n < 365 ? `Son ${n} gün` : 'Son 1 yıl'}</Text>
                </Pressable>
              ))}
            </View>
            <DateField
              label="Başlangıç tarihi (elle gir)"
              value={draftStart}
              onChange={setDraftStart}
              error={draftStart && !draftStartValid ? 'Geçersiz tarih — YYYY-AA-GG biçiminde gir, örn: 2026-07-10' : ''}
            />
            <PrimaryButton title="Kaydet" onPress={saveDraft} disabled={!draftStartValid} />
            {settings.kazaStartDate ? (
              <Pressable style={{ marginTop: 10 }} onPress={() => setEditingStart(false)}>
                <Text style={styles.cancelText}>Vazgeç</Text>
              </Pressable>
            ) : null}
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visibleDays}
        keyExtractor={(d) => d.dateKey}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Geçmiş Namazlar</Text>
            <Text style={styles.subtitle}>
              {settings.kazaStartDate} → {endKey} arası, farz ve vacip namazlar (Cuma günleri Öğle yerine Cuma
              namazı sayılır){monthFilter ? ` — şu an yalnızca ${monthLabel(monthFilter)} gösteriliyor` : ''}
            </Text>

            <Card>
              <Text style={styles.debtNumber}>{summary.totalDebt} vakit kaza borcu</Text>
              <View style={styles.perItemRow}>
                {Object.entries(KAZA_SLOT_META).map(([slot, meta]) => (
                  <Text key={slot} style={styles.perItemText}>
                    {meta.label}: {summary.perSlotDebt[slot]}
                  </Text>
                ))}
              </View>
              <View style={styles.toolRow}>
                <Pressable
                  style={[styles.filterBtn, onlyIncomplete && styles.filterBtnActive]}
                  onPress={() => setOnlyIncomplete(!onlyIncomplete)}
                >
                  <Text style={[styles.filterText, onlyIncomplete && styles.filterTextActive]}>
                    {onlyIncomplete ? 'Sadece eksik günler' : 'Tüm günler'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.filterBtn}
                  onPress={() => {
                    setDraftStart(settings.kazaStartDate);
                    setEditingStart(true);
                  }}
                >
                  <Text style={styles.filterText}>Başlangıcı değiştir</Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.rangeToggle}
                onPress={() => {
                  setPickerMonth(monthFilter || endMonthKey);
                  setMonthPickerOpen(!monthPickerOpen);
                }}
              >
                <Text style={styles.rangeToggleText}>
                  {monthPickerOpen
                    ? '▾ Ay/yıl seçmeyi kapat'
                    : `▸ Ay/yıl seç${monthFilter ? ` (${monthLabel(monthFilter)} gösteriliyor)` : ''}`}
                </Text>
              </Pressable>
              {monthPickerOpen && (
                <View style={styles.monthPickerBox}>
                  <Text style={styles.monthPickerLabel}>{pickerMonth ? monthLabel(pickerMonth) : ''}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearRow}>
                    {years.map((y) => {
                      const active = pickerYear === y;
                      return (
                        <Pressable
                          key={y}
                          style={[styles.yearChip, active && styles.yearChipActive]}
                          onPress={() => setPickerMonth(buildMonthKey(y, pickerMonthNum, startMonthKey, endMonthKey))}
                        >
                          <Text style={[styles.yearChipText, active && styles.yearChipTextActive]}>{y}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                  <View style={styles.monthGrid}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                      const key = `${pickerYear}-${String(m).padStart(2, '0')}`;
                      const disabled = key < startMonthKey || key > endMonthKey;
                      const active = pickerMonthNum === m && !disabled;
                      return (
                        <Pressable
                          key={m}
                          disabled={disabled}
                          style={[styles.monthChip, active && styles.monthChipActive, disabled && styles.monthChipDisabled]}
                          onPress={() => setPickerMonth(buildMonthKey(pickerYear, m, startMonthKey, endMonthKey))}
                        >
                          <Text
                            style={[
                              styles.monthChipText,
                              active && styles.monthChipTextActive,
                              disabled && styles.monthChipTextDisabled,
                            ]}
                          >
                            {monthShortLabel(m)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <PrimaryButton
                    title="Bu Ayı Göster"
                    onPress={() => {
                      setMonthFilter(pickerMonth);
                      setMonthPickerOpen(false);
                    }}
                  />
                  {monthFilter && (
                    <Pressable
                      style={{ marginTop: 10 }}
                      onPress={() => {
                        setMonthFilter(null);
                        setMonthPickerOpen(false);
                      }}
                    >
                      <Text style={styles.cancelText}>Tüm dönemi göster</Text>
                    </Pressable>
                  )}
                </View>
              )}
              <Pressable style={styles.rangeToggle} onPress={() => setRangeToolOpen(!rangeToolOpen)}>
                <Text style={styles.rangeToggleText}>{rangeToolOpen ? '▾ Toplu işaretlemeyi kapat' : '▸ Bir aralığı toplu kıldım işaretle'}</Text>
              </Pressable>
              {rangeToolOpen && (
                <View style={styles.rangeBox}>
                  <DateField
                    label="Aralık başlangıcı"
                    value={rangeStart}
                    onChange={setRangeStart}
                    error={rangeStart && !isValidDateKey(rangeStart) ? 'Geçersiz tarih — YYYY-AA-GG' : ''}
                  />
                  <DateField
                    label="Aralık bitişi"
                    value={rangeEnd}
                    onChange={setRangeEnd}
                    error={rangeEnd && !isValidDateKey(rangeEnd) ? 'Geçersiz tarih — YYYY-AA-GG' : ''}
                  />
                  <PrimaryButton
                    title="Aralığı Kıldım İşaretle"
                    onPress={() => setRangeConfirm(true)}
                    disabled={!isValidDateKey(rangeStart) || !isValidDateKey(rangeEnd) || rangeStart > rangeEnd}
                  />
                </View>
              )}
            </Card>

            {visibleDays.length === 0 && (
              <Text style={styles.emptyText}>
                {onlyIncomplete
                  ? monthFilter
                    ? `${monthLabel(monthFilter)} için eksik gün yok 🎉`
                    : 'Eksik gün yok — borç kalmadı 🎉'
                  : 'Görüntülenecek gün yok.'}
              </Text>
            )}
          </View>
        }
        renderItem={({ item: day }) => (
          <DayRow day={day} byDate={byDate} onToggle={toggleOnDate} onMarkAll={markAllForDay} />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        initialNumToRender={20}
        windowSize={7}
      />

      <ConfirmModal
        visible={rangeConfirm}
        title="Aralık toplu işaretlensin mi?"
        message={`${rangeStart} → ${rangeEnd} arasındaki tüm günler, tüm vakitler için "kılındı" olarak işaretlenecek.`}
        confirmLabel="İşaretle"
        onCancel={() => setRangeConfirm(false)}
        onConfirm={applyRangeMark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 12, paddingHorizontal: 16, marginTop: 4, marginBottom: 4, lineHeight: 17 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  presetText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  cancelText: { color: colors.textMuted, textAlign: 'center', fontSize: 13 },
  debtNumber: { color: colors.primary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  perItemRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 8 },
  perItemText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  toolRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: colors.success + '33', borderColor: colors.success },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: colors.success },
  rangeToggle: { marginTop: 12, alignItems: 'center' },
  rangeToggleText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  rangeBox: { marginTop: 10 },
  monthPickerBox: { marginTop: 10 },
  monthPickerLabel: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  yearRow: { marginBottom: 10 },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    marginRight: 8,
  },
  yearChipActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  yearChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  yearChipTextActive: { color: colors.primary },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  monthChip: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  monthChipActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  monthChipDisabled: { opacity: 0.3 },
  monthChipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  monthChipTextActive: { color: colors.primary },
  monthChipTextDisabled: { color: colors.textMuted },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 16, fontSize: 13 },
  dayRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayRowComplete: { borderColor: colors.success },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayDate: { color: colors.text, fontSize: 13, fontWeight: '700' },
  dayProgress: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  dayProgressComplete: { color: colors.success },
  chipRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipChecked: { backgroundColor: colors.success, borderColor: colors.success },
  chipText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  chipTextChecked: { color: ON_ACCENT },
  markAllChip: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginLeft: 4,
  },
  markAllText: { color: colors.primary, fontWeight: '700', fontSize: 11 },
});

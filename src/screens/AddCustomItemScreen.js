import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CATEGORY,
  CATEGORY_META,
  HUKUM_META,
  CUSTOM_HUKUM_OPTIONS,
  CUSTOM_FREQUENCY_OPTIONS,
  createCustomItem,
} from '../data/ibadetler';
import { useTracker } from '../state/TrackerContext';
import { colors, ON_ACCENT } from '../theme';
import { Card, SectionHeader, PrimaryButton } from '../components/common';

function ChipPicker({ options, value, onChange, renderLabel }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{renderLabel(opt)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AddCustomItemScreen({ navigation }) {
  const { addCustomItem } = useTracker();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY.DIGER);
  const [hukum, setHukum] = useState(CUSTOM_HUKUM_OPTIONS[3]);
  const [frequency, setFrequency] = useState(CUSTOM_FREQUENCY_OPTIONS[1].value);
  const [rekat, setRekat] = useState('');
  const [description, setDescription] = useState('');

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    addCustomItem(createCustomItem({ title, category, hukum, frequency, rekat, description }));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title="İlave İbadet" subtitle="Uygulamanın listesinde olmayan bir ibadeti kendin ekle" />
        <Card>
          <Text style={styles.label}>Başlık</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="ör. Kur'an-ı Kerim okuma"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Kategori</Text>
          <ChipPicker
            options={Object.keys(CATEGORY_META)}
            value={category}
            onChange={setCategory}
            renderLabel={(c) => `${CATEGORY_META[c].icon} ${CATEGORY_META[c].label}`}
          />

          <Text style={styles.label}>Hüküm</Text>
          <ChipPicker
            options={CUSTOM_HUKUM_OPTIONS}
            value={hukum}
            onChange={setHukum}
            renderLabel={(h) => HUKUM_META[h].label}
          />

          <Text style={styles.label}>Sıklık</Text>
          <ChipPicker
            options={CUSTOM_FREQUENCY_OPTIONS.map((o) => o.value)}
            value={frequency}
            onChange={setFrequency}
            renderLabel={(f) => CUSTOM_FREQUENCY_OPTIONS.find((o) => o.value === f).label}
          />

          <Text style={styles.label}>Rekât (opsiyonel)</Text>
          <TextInput
            style={styles.input}
            value={rekat}
            onChangeText={setRekat}
            placeholder="ör. 2"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Açıklama (opsiyonel)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Kısa bir not..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </Card>

        <PrimaryButton title="İlave İbadeti Kaydet" onPress={save} disabled={!canSave} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextSelected: { color: ON_ACCENT },
});

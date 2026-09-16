import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_META, HUKUM_META, getByCategory } from '../data/ibadetler';
import { useTracker } from '../state/TrackerContext';
import { colors } from '../theme';
import { HukumBadge, PrimaryButton } from '../components/common';

export default function CategoriesScreen({ navigation }) {
  const { customItems } = useTracker();
  const [expanded, setExpanded] = useState(() => Object.fromEntries(Object.keys(CATEGORY_META).map((k) => [k, true])));

  const toggle = (cat) => setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const itemsByCategory = useMemo(() => {
    const map = {};
    for (const catKey of Object.keys(CATEGORY_META)) {
      map[catKey] = [...getByCategory(catKey), ...customItems.filter((i) => i.category === catKey)];
    }
    return map;
  }, [customItems]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Kategoriler</Text>
        <Text style={styles.subtitle}>
          Sünni itikat (Hanefi fıkhı) esasına göre farz, vacip ve sünnet ibadetlerin tam listesi. Bir ibadete
          dokunarak anlamını ve nasıl yapıldığını okuyabilirsin.
        </Text>

        <PrimaryButton title="+ İlave İbadet Ekle" onPress={() => navigation.navigate('AddCustomItem')} />

        {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
          const items = itemsByCategory[catKey];
          if (items.length === 0) return null;
          return (
            <View key={catKey} style={styles.categoryBlock}>
              <Pressable style={styles.categoryHeader} onPress={() => toggle(catKey)}>
                <Text style={styles.categoryIcon}>{meta.icon}</Text>
                <Text style={styles.categoryTitle}>{meta.label}</Text>
                <Text style={styles.categoryCount}>{items.length}</Text>
                <Text style={styles.chevron}>{expanded[catKey] ? '▾' : '▸'}</Text>
              </Pressable>
              {expanded[catKey] &&
                items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.itemRow}
                    onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
                  >
                    <Text style={styles.itemTitle}>
                      {item.title}
                      {item.timingLabel ? ` (${item.timingLabel})` : ''}
                      {item.custom ? ' 🔖' : ''}
                    </Text>
                    <HukumBadge hukum={item.hukum} />
                  </Pressable>
                ))}
            </View>
          );
        })}

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Hüküm Anahtarı</Text>
          {Object.entries(HUKUM_META).map(([key, meta]) => (
            <Text key={key} style={styles.legendItem}>
              • {meta.label}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 13, paddingHorizontal: 16, marginTop: 4, marginBottom: 8, lineHeight: 18 },
  categoryBlock: { marginTop: 12 },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  categoryIcon: { fontSize: 18, marginRight: 8 },
  categoryTitle: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  categoryCount: { color: colors.textMuted, fontSize: 13, marginRight: 8 },
  chevron: { color: colors.textMuted, fontSize: 14 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemTitle: { color: colors.text, fontSize: 14, flex: 1 },
  legend: { marginTop: 24, marginHorizontal: 16, marginBottom: 8 },
  legendTitle: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  legendItem: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
});

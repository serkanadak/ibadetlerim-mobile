import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getById, CATEGORY_META, FREQUENCY } from '../data/ibadetler';
import { useTracker } from '../state/TrackerContext';
import { colors, DANGER } from '../theme';
import { HukumBadge, Card, SectionHeader, PrimaryButton, ConfirmModal } from '../components/common';

const GENDER_NOTE = {
  male_farz_female_nafile:
    'Mukim ve mükellef erkeklere farz-ı ayndır. Kadınlar için farz değildir; kılarlarsa nafile olur.',
};

export default function ItemDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const {
    isCheckedToday,
    toggleToday,
    isCheckedYearly,
    toggleYearly,
    isNotApplicableYearly,
    toggleYearlyNotApplicable,
    isCheckedLifetime,
    toggleLifetime,
    isNotApplicableLifetime,
    toggleLifetimeNotApplicable,
    yearKeyStr,
    customItems,
    removeCustomItem,
  } = useTracker();
  const item = getById(id) || customItems.find((i) => i.id === id);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>İbadet bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  const catMeta = CATEGORY_META[item.category];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Text style={styles.category}>
            {catMeta?.icon} {catMeta?.label}
          </Text>
          <Text style={styles.title}>{item.title}</Text>
          <View style={{ marginTop: 8 }}>
            <HukumBadge hukum={item.hukum} />
          </View>
        </View>

        {item.summary && (
          <>
            <SectionHeader title="Anlamı ve Yapılışı" />
            <Card>
              <Text style={styles.summaryText}>{item.summary}</Text>
            </Card>
          </>
        )}

        {item.arabic && (
          <>
            <SectionHeader title="Arapça Metni, Okunuşu ve Meali" />
            <Card>
              <Pressable onPress={() => setTextExpanded(!textExpanded)}>
                <Text style={styles.textToggle}>{textExpanded ? '▾ Metni gizle' : '▸ Metni göster'}</Text>
              </Pressable>
              {textExpanded && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.textLabel}>Arapça</Text>
                  <Text style={styles.arabicText}>{item.arabic}</Text>

                  <Text style={[styles.textLabel, styles.textLabelSpaced]}>Okunuşu</Text>
                  <Text style={styles.transliterationText}>{item.transliteration}</Text>

                  <Text style={[styles.textLabel, styles.textLabelSpaced]}>Meali</Text>
                  <Text style={styles.translationText}>{item.translation}</Text>
                </View>
              )}
            </Card>
          </>
        )}

        <SectionHeader title="Hüküm ve Detaylar" />
        <Card>
          {item.rekat ? <Text style={styles.meta}>Rekât: {item.rekat}</Text> : null}
          <Text style={styles.description}>{item.description}</Text>
          {GENDER_NOTE[item.gender] ? <Text style={styles.genderNote}>ℹ️ {GENDER_NOTE[item.gender]}</Text> : null}
        </Card>

        {item.frequency === FREQUENCY.OCCASIONAL && (
          <Text style={styles.hint}>Bu ibadet duruma bağlıdır; günlük/yıllık takip listesine girmez.</Text>
        )}

        {item.frequency === FREQUENCY.LIFETIME && (
          <>
            <PrimaryButton
              title={isCheckedLifetime(item.id) ? '✓ Yaptım' : 'Yaptım olarak işaretle'}
              onPress={() => toggleLifetime(item.id)}
            />
            <Pressable style={styles.naBtn} onPress={() => toggleLifetimeNotApplicable(item.id)}>
              <Text style={[styles.naText, isNotApplicableLifetime(item.id) && styles.naTextActive]}>
                {isNotApplicableLifetime(item.id) ? '✓ Bana uygulanmıyor' : 'Bana uygulanmıyor olarak işaretle'}
              </Text>
            </Pressable>
            {isNotApplicableLifetime(item.id) && (
              <Text style={styles.naHint}>
                Sebebi doğduğunda (ör. istitâat kazanma, adak) buradan tekrar "Yaptım" olarak işaretleyebilirsin;
                hatırlatma listelerinde görünmez.
              </Text>
            )}
          </>
        )}

        {item.frequency === FREQUENCY.YEARLY_ONCE && (
          <>
            <PrimaryButton
              title={isCheckedYearly(item.id) ? `✓ Bu yıl (${yearKeyStr}) yaptım` : `Bu yıl (${yearKeyStr}) için işaretle`}
              onPress={() => toggleYearly(item.id)}
            />
            <Pressable style={styles.naBtn} onPress={() => toggleYearlyNotApplicable(item.id)}>
              <Text style={[styles.naText, isNotApplicableYearly(item.id) && styles.naTextActive]}>
                {isNotApplicableYearly(item.id) ? `✓ Bu yıl (${yearKeyStr}) bana uygulanmıyor` : 'Bu yıl bana uygulanmıyor olarak işaretle'}
              </Text>
            </Pressable>
            {isNotApplicableYearly(item.id) && (
              <Text style={styles.naHint}>
                Adak gibi bir sebebe bağlı ibadetlerde, sebebi oluşmadıysa bunu işaretleyebilirsin; "Bu Yıl İçin
                Hatırlatma" listesinde görünmez. Sebep oluşursa buradan tekrar "Yaptım" olarak işaretle.
              </Text>
            )}
          </>
        )}

        {![FREQUENCY.OCCASIONAL, FREQUENCY.LIFETIME].includes(item.frequency) && (
          <PrimaryButton
            title={isCheckedToday(item.id) ? '✓ Bugün işaretlendi' : 'Bugün için işaretle'}
            onPress={() => toggleToday(item.id)}
          />
        )}

        {item.custom && (
          <Pressable style={styles.deleteBtn} onPress={() => setConfirmVisible(true)}>
            <Text style={styles.deleteText}>İlave ibadeti sil</Text>
          </Pressable>
        )}
      </ScrollView>

      <ConfirmModal
        visible={confirmVisible}
        title="İlave ibadet silinsin mi?"
        message={`"${item.title}" kalıcı olarak silinecek.`}
        confirmLabel="Sil"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          removeCustomItem(item.id);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  category: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  meta: { color: colors.primary, fontWeight: '700', marginBottom: 8 },
  description: { color: colors.text, fontSize: 14, lineHeight: 21 },
  summaryText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  textToggle: { color: colors.primary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  textLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textLabelSpaced: { marginTop: 16 },
  arabicText: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  transliterationText: { color: colors.textMuted, fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  translationText: { color: colors.text, fontSize: 14, lineHeight: 22 },
  genderNote: { color: colors.textMuted, fontSize: 12, marginTop: 10, lineHeight: 18 },
  hint: { color: colors.textMuted, fontSize: 12, marginHorizontal: 16, marginTop: 8 },
  naBtn: { marginHorizontal: 16, marginTop: 10, paddingVertical: 8, alignItems: 'center' },
  naText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  naTextActive: { color: colors.primary },
  naHint: { color: colors.textMuted, fontSize: 12, marginHorizontal: 16, marginTop: 4, lineHeight: 17, textAlign: 'center' },
  notFound: { color: colors.text, padding: 16 },
  deleteBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DANGER,
  },
  deleteText: { color: DANGER, fontWeight: '700' },
});

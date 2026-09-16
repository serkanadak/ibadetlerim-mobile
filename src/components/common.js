import React from 'react';
import { View, Text, Pressable, TextInput, Modal, StyleSheet } from 'react-native';
import { colors, HUKUM_COLORS, ON_ACCENT, DANGER } from '../theme';
import { HUKUM_META } from '../data/ibadetler';

export function HukumBadge({ hukum }) {
  const meta = HUKUM_META[hukum];
  const color = HUKUM_COLORS[hukum] || colors.primary;
  if (!meta) return null;
  return (
    <View style={[styles.badge, { backgroundColor: color + '33', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{meta.label}</Text>
    </View>
  );
}

export function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function CheckRow({
  title,
  subtitle,
  hukum,
  hukumList,
  rekat,
  rekatText,
  checked,
  onPress,
  onLongPress,
  secondaryLabel,
  onSecondaryPress,
}) {
  const rekatSuffix = rekatText ? ` (${rekatText})` : rekat ? ` (${rekat} rekât)` : '';
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, checked && styles.rowTitleChecked]}>
          {title}
          {rekatSuffix}
        </Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        {secondaryLabel ? (
          <Pressable onPress={onSecondaryPress} hitSlop={8} style={styles.secondaryLinkWrap}>
            <Text style={styles.secondaryLink}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {hukumList ? (
        <View style={styles.badgeStack}>
          {hukumList.map((h) => (
            <HukumBadge key={h} hukum={h} />
          ))}
        </View>
      ) : hukum ? (
        <HukumBadge hukum={hukum} />
      ) : null}
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function DateField({ label, value, onChange, error }) {
  return (
    <View style={styles.dateField}>
      <Text style={styles.dateLabel}>{label}</Text>
      <TextInput
        style={[styles.dateInput, error && styles.dateInputError]}
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-AA-GG"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error ? <Text style={styles.dateError}>{error}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }, disabled && { opacity: 0.5 }]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

// React Native'in Alert.alert'i web'de (react-native-web) desteklenmediği için
// tüm platformlarda çalışan özel bir onay modalı.
export function ConfirmModal({ visible, title, message, confirmLabel = 'Onayla', cancelLabel = 'Vazgeç', destructive, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          {message ? <Text style={styles.modalMessage}>{message}</Text> : null}
          <View style={styles.modalButtonRow}>
            <Pressable style={styles.modalCancelBtn} onPress={onCancel}>
              <Text style={styles.modalCancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.modalConfirmBtn, destructive && styles.modalConfirmBtnDestructive]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalConfirmText, destructive && styles.modalConfirmTextDestructive]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeStack: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 6 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  row: {
    flexDirection: 'row',
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: ON_ACCENT, fontWeight: '900', fontSize: 14 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowTitleChecked: { textDecorationLine: 'line-through', color: colors.textMuted },
  rowSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  secondaryLinkWrap: { marginTop: 4, alignSelf: 'flex-start' },
  secondaryLink: { color: colors.primary, fontSize: 11, fontWeight: '700', textDecorationLine: 'underline' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  buttonText: { color: ON_ACCENT, fontWeight: '800', fontSize: 15 },
  dateField: { marginBottom: 10 },
  dateLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  dateInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateInputError: { borderColor: DANGER },
  dateError: { color: DANGER, fontSize: 11, marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  modalMessage: { color: colors.textMuted, fontSize: 13, marginTop: 8, lineHeight: 19 },
  modalButtonRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: { color: colors.textMuted, fontWeight: '700' },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalConfirmBtnDestructive: { backgroundColor: DANGER },
  modalConfirmText: { color: ON_ACCENT, fontWeight: '800' },
  modalConfirmTextDestructive: { color: '#fff' },
});

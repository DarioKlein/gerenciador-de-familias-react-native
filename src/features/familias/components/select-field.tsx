import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SelectFieldProps<T extends string> = {
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (value: T | null) => void;
  placeholder?: string;
  error?: string;
  allowClear?: boolean;
  variant?: 'field' | 'chip';
  getLabel?: (value: T) => string;
};

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecionar',
  error,
  allowClear = true,
  variant = 'field',
  getLabel = (option) => option,
}: SelectFieldProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const chip = variant === 'chip';

  const choose = (nextValue: T | null) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <View style={chip ? undefined : styles.wrapper}>
      {!chip ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? getLabel(value) : placeholder}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          chip ? styles.filterChip : styles.field,
          {
            backgroundColor: value ? theme.primarySoft : theme.input,
            borderColor: error ? theme.danger : value ? theme.primary : theme.border,
            opacity: pressed ? 0.78 : 1,
          },
        ]}>
        <ThemedText
          type={chip ? 'smallBold' : 'default'}
          numberOfLines={1}
          style={styles.fieldText}>
          {chip
            ? value
              ? `${label}: ${getLabel(value)}`
              : label
            : value
              ? getLabel(value)
              : placeholder}
        </ThemedText>
        <AppIcon
          name={value && chip ? 'close' : 'chevronDown'}
          color={theme.textSecondary}
          size={18}
        />
      </Pressable>
      {error && !chip ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar seletor"
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          onPress={() => setOpen(false)}>
          <ThemedView
            type="backgroundElement"
            accessibilityViewIsModal
            style={[styles.sheet, { borderColor: theme.border }]}
            onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitle}>
                <ThemedText type="subtitle">{label}</ThemedText>
                <ThemedText themeColor="textSecondary">Escolha uma opção</ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={() => setOpen(false)}
                style={[styles.closeButton, { backgroundColor: theme.input }]}>
                <AppIcon name="close" color={theme.textSecondary} size={20} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.options}>
              {allowClear ? (
                <Option
                  label="Não informado"
                  selected={value === null}
                  onPress={() => choose(null)}
                />
              ) : null}
              {options.map((option) => (
                <Option
                  key={option}
                  label={getLabel(option)}
                  selected={option === value}
                  onPress={() => choose(option)}
                />
              ))}
            </ScrollView>
          </ThemedView>
        </Pressable>
      </Modal>
    </View>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? theme.primarySoft : theme.background,
          borderColor: selected ? theme.primary : theme.border,
          opacity: pressed ? 0.78 : 1,
        },
      ]}>
      <ThemedText type={selected ? 'smallBold' : 'default'}>{label}</ThemedText>
      {selected ? (
        <AppIcon name="check" color={theme.primary} size={20} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  field: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
  },
  filterChip: {
    minHeight: 44,
    maxWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  fieldText: {
    flexShrink: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '78%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  sheetTitle: {
    flex: 1,
    gap: Spacing.one,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    gap: Spacing.two,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
  },
});

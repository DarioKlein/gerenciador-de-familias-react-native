import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChoiceChipsProps<T extends string> = {
  values: readonly T[];
  selected: T | null;
  onChange: (value: T | null) => void;
  getLabel?: (value: T) => string;
};

export function ChoiceChips<T extends string>({
  values,
  selected,
  onChange,
  getLabel = (value) => value,
}: ChoiceChipsProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {values.map((value) => {
        const active = selected === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => onChange(active ? null : value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? theme.primary : theme.input,
                borderColor: active ? theme.primary : theme.border,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            {active ? <AppIcon name="check" color="#FFFFFF" size={17} /> : null}
            <ThemedText type="smallBold" style={active ? styles.activeText : undefined}>
              {getLabel(value)}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

type MultipleChoiceChipsProps<T extends string> = {
  values: readonly T[];
  selected: readonly T[];
  onChange: (value: T[]) => void;
  getLabel?: (value: T) => string;
};

export function MultipleChoiceChips<T extends string>({
  values,
  selected,
  onChange,
  getLabel = (value) => value,
}: MultipleChoiceChipsProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {values.map((value) => {
        const active = selected.includes(value);
        return (
          <Pressable
            key={value}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            onPress={() =>
              onChange(
                active
                  ? selected.filter((selectedValue) => selectedValue !== value)
                  : [...selected, value]
              )
            }
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? theme.primary : theme.input,
                borderColor: active ? theme.primary : theme.border,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            {active ? <AppIcon name="check" color="#FFFFFF" size={17} /> : null}
            <ThemedText type="smallBold" style={active ? styles.activeText : undefined}>
              {getLabel(value)}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  activeText: {
    color: '#FFFFFF',
  },
});

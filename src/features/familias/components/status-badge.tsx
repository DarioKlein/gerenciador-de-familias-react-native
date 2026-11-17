import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { SituacaoReligiosa } from '@/features/familias/constants';

const STATUS_COLORS: Record<SituacaoReligiosa, { background: string; text: string }> = {
  Congrega: { background: '#C8F3DF', text: '#126344' },
  Parado: { background: '#E7E9ED', text: '#444B55' },
  Enfermo: { background: '#FFE1DC', text: '#A52A22' },
  Testemunhado: { background: '#D8F0F7', text: '#12627A' },
  Contato: { background: '#E9E1FA', text: '#5F3A91' },
};

export function StatusBadge({ value }: { value: SituacaoReligiosa }) {
  const colors = STATUS_COLORS[value];
  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <ThemedText type="smallBold" style={{ color: colors.text }}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});

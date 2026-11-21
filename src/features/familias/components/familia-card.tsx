import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getLocalidadeLabel } from '@/features/familias/constants';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

import { StatusBadge } from './status-badge';

type FamiliaCardProps = {
  familia: Familia;
  onPress: () => void;
};

export function FamiliaCard({ familia, onPress }: FamiliaCardProps) {
  const theme = useTheme();
  const address = [familia.endereco, familia.numero].filter(Boolean).join(', ');
  const location = [
    familia.setor,
    familia.bairro,
    familia.cidade ? getLocalidadeLabel(familia.cidade) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir cadastro de ${familia.nome}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <View style={styles.header}>
        <ThemedText type="subtitle" numberOfLines={2} style={styles.name}>
          {familia.nome}
        </ThemedText>
        {familia.situacaoReligiosa ? (
          <StatusBadge value={familia.situacaoReligiosa} />
        ) : null}
      </View>

      {familia.cargos.length > 0 ? (
        <View style={styles.metaRow}>
          <AppIcon name="work" color={theme.primary} size={18} />
          <ThemedText type="small" style={[styles.metaText, { color: theme.primary }]}>
            {familia.cargos.length === 1 ? 'Cargo' : 'Cargos'} ·{' '}
            {familia.cargos.join(', ')}
          </ThemedText>
        </View>
      ) : null}

      {familia.ministerio ? (
        <View style={styles.metaRow}>
          <AppIcon name="religious" color={theme.primary} size={18} />
          <ThemedText type="small" style={[styles.metaText, { color: theme.primary }]}>
            Ministério · {familia.ministerio}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.addressRow}>
        <View style={[styles.iconSurface, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name="location" color={theme.primary} size={21} />
        </View>
        <View style={styles.addressBlock}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {address}
          </ThemedText>
          <ThemedText themeColor="textSecondary" numberOfLines={1}>
            {location || 'Localização não informada'}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={[styles.metaRow, styles.footerPhone]}>
          <AppIcon name="phone" color={theme.textSecondary} size={17} />
          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={1}
            style={styles.metaText}>
            {familia.telefone ?? 'Telefone não informado'}
          </ThemedText>
        </View>
        <View style={[styles.metaRow, styles.footerAction]}>
          <ThemedText type="smallBold" numberOfLines={1} style={{ color: theme.primary }}>
            Ver detalhes
          </ThemedText>
          <AppIcon name="chevronRight" color={theme.primary} size={17} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 24,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  addressBlock: {
    flex: 1,
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconSurface: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  metaRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaText: {
    flex: 1,
  },
  footerPhone: {
    flex: 1,
  },
  footerAction: {
    flexShrink: 0,
  },
  footer: {
    minHeight: 52,
    marginHorizontal: -Spacing.four,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderTopWidth: 1,
  },
});

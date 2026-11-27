import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { possuiCadastroIncompleto } from '@/features/familias/dashboard';
import type { Familia } from '@/features/familias/types';
import { calcularResumoVisita } from '@/features/familias/visita';
import { useTheme } from '@/hooks/use-theme';

import { StatusBadge } from './status-badge';

type FamiliaCardProps = {
  familia: Familia;
  onPress: () => void;
};

type CardHighlightItem = {
  key: string;
  icon: AppIconName;
  iconBg: string;
  iconColor: string;
  textColor: string;
  bold: boolean;
  label: string;
};

export function FamiliaCard({ familia, onPress }: FamiliaCardProps) {
  const theme = useTheme();
  const resumoVisita = calcularResumoVisita(familia.ultimaVisita);
  const cadastroIncompleto = possuiCadastroIncompleto(familia);

  const highlights: CardHighlightItem[] = [
    {
      key: 'setor',
      icon: 'location',
      iconBg: familia.setor ? theme.primarySoft : theme.input,
      iconColor: familia.setor ? theme.primary : theme.textSecondary,
      textColor: familia.setor ? theme.text : theme.textSecondary,
      bold: Boolean(familia.setor),
      label: familia.setor ?? 'Setor não informado',
    },
    !resumoVisita.possuiVisita
      ? {
          key: 'visita',
          icon: 'calendar',
          iconBg: theme.input,
          iconColor: theme.textSecondary,
          textColor: theme.textSecondary,
          bold: false,
          label: 'Nenhuma visita registrada',
        }
      : resumoVisita.alertaAtrasada
        ? {
            key: 'visita',
            icon: 'warning',
            iconBg: theme.warningSoft,
            iconColor: theme.warning,
            textColor: theme.warning,
            bold: true,
            label: 'Não visitado há 6 meses',
          }
        : {
            key: 'visita',
            icon: 'check',
            iconBg: theme.primarySoft,
            iconColor: theme.primary,
            textColor: theme.primary,
            bold: true,
            label: `Visita realizada · ${resumoVisita.dataFormatada}`,
          },
    cadastroIncompleto
      ? {
          key: 'dados',
          icon: 'warning',
          iconBg: theme.dangerSoft,
          iconColor: theme.danger,
          textColor: theme.danger,
          bold: true,
          label: 'Dados faltantes',
        }
      : {
          key: 'dados',
          icon: 'check',
          iconBg: theme.primarySoft,
          iconColor: theme.primary,
          textColor: theme.primary,
          bold: true,
          label: 'Dados preenchidos',
        },
  ];

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

      <View style={styles.highlights}>
        {highlights.map((item) => (
          <View key={item.key} style={styles.highlightRow}>
            <View style={[styles.highlightIcon, { backgroundColor: item.iconBg }]}>
              <AppIcon name={item.icon} color={item.iconColor} size={17} />
            </View>
            <ThemedText
              type={item.bold ? 'smallBold' : 'small'}
              numberOfLines={1}
              style={[styles.highlightText, { color: item.textColor }]}>
              {item.label}
            </ThemedText>
          </View>
        ))}
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
  highlights: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  highlightRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  highlightIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  highlightText: {
    flex: 1,
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

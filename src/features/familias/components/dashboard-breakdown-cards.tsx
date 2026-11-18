import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { SituacaoReligiosa, TipoResidencia } from '@/features/familias/constants';
import type { DashboardResumo } from '@/features/familias/dashboard';
import { useTheme } from '@/hooks/use-theme';

import { DashboardSection, ProgressBar, SegmentedBar } from './dashboard-primitives';

const RELIGIOUS_COLORS: Record<
  SituacaoReligiosa | 'Não informado',
  { background: string; accent: string }
> = {
  Congrega: { background: '#C8F3DF', accent: '#126344' },
  Parado: { background: '#E7E9ED', accent: '#444B55' },
  Enfermo: { background: '#FFE1DC', accent: '#A52A22' },
  Testemunhado: { background: '#D8F0F7', accent: '#12627A' },
  Contato: { background: '#E9E1FA', accent: '#5F3A91' },
  'Não informado': { background: '#F1F3F7', accent: '#627069' },
};

const RESIDENCIA_COLORS: Record<TipoResidencia | 'Não informado', string> = {
  Própria: '#087A57',
  Alugada: '#12627A',
  'Não informado': '#627069',
};

const LOCALIDADE_BAR_COLORS = ['#087A57', '#12627A', '#5F3A91', '#2B6CB0', '#444B55'];

export function DashboardBreakdownCards({ resumo }: { resumo: DashboardResumo }) {
  const theme = useTheme();
  const religiousSegments = resumo.porSituacaoReligiosa.filter((item) => item.total > 0);
  const residenceSegments = resumo.porResidencia.filter((item) => item.total > 0);

  return (
    <View style={styles.sections}>
      <DashboardSection
        title="Famílias por localidade"
        icon="location"
        trailing={
          <View style={[styles.sectionPill, { backgroundColor: theme.input }]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {resumo.totalLocalidades}{' '}
              {resumo.totalLocalidades === 1 ? 'localidade' : 'localidades'}
            </ThemedText>
          </View>
        }>
        <View style={styles.barList}>
          {resumo.porLocalidade.map((item, index) => {
            const barColor =
              item.chave === 'Não informado'
                ? theme.textSecondary
                : LOCALIDADE_BAR_COLORS[index % LOCALIDADE_BAR_COLORS.length];

            return (
              <View key={item.chave} style={styles.localityItem}>
                <View style={styles.localityRowHeader}>
                  <ThemedText type="smallBold" style={styles.localityLabel}>
                    {item.label}
                  </ThemedText>
                  <ThemedText type="smallBold">
                    {item.total}{' '}
                    <ThemedText type="small" themeColor="textSecondary">
                      ({item.percentual}%)
                    </ThemedText>
                  </ThemedText>
                </View>
                <ProgressBar ratio={item.proporcao} color={barColor} hasValue={item.total > 0} />
              </View>
            );
          })}
        </View>
      </DashboardSection>

      <DashboardSection
        title="Famílias por bairro"
        icon="home"
        trailing={
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            Top bairros
          </ThemedText>
        }>
        {resumo.topBairros.length === 0 ? (
          <ThemedText themeColor="textSecondary">
            Nenhum bairro foi informado nos cadastros até o momento.
          </ThemedText>
        ) : (
          <View style={styles.barList}>
            {resumo.topBairros.map((item, index) => (
              <View key={item.chave} style={styles.neighborhoodRow}>
                <ThemedText
                  type="smallBold"
                  numberOfLines={1}
                  style={styles.neighborhoodName}>
                  {item.label}
                </ThemedText>
                <View style={styles.neighborhoodBarWrap}>
                  <ProgressBar
                    ratio={item.proporcao}
                    color={index < 2 ? theme.primary : '#12627A'}
                    hasValue={item.total > 0}
                  />
                </View>
                <ThemedText type="smallBold" style={styles.neighborhoodCount}>
                  {item.total}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
        {resumo.semBairro > 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {resumo.semBairro}{' '}
            {resumo.semBairro === 1
              ? 'família ainda está sem bairro informado.'
              : 'famílias ainda estão sem bairro informado.'}
          </ThemedText>
        ) : null}
      </DashboardSection>

      <DashboardSection
        title="Situação religiosa"
        icon="religious"
        trailing={
          <ThemedText type="small" themeColor="textSecondary">
            {resumo.totalFamilias} {resumo.totalFamilias === 1 ? 'família' : 'famílias'}
          </ThemedText>
        }>
        {religiousSegments.length > 0 ? (
          <SegmentedBar
            segments={religiousSegments.map((item) => ({
              key: item.chave,
              value: item.total,
              color: RELIGIOUS_COLORS[item.chave].accent,
            }))}
          />
        ) : null}
        <View style={styles.religiousPills}>
          {resumo.porSituacaoReligiosa.map((item) => {
            const palette = RELIGIOUS_COLORS[item.chave];
            return (
              <View
                key={item.chave}
                style={[styles.religiousPill, { backgroundColor: palette.background }]}>
                <View style={[styles.statusDot, { backgroundColor: palette.accent }]} />
                <ThemedText type="smallBold" style={{ color: palette.accent }}>
                  {item.label}
                </ThemedText>
                <View
                  style={[
                    styles.religiousCountBadge,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <ThemedText type="smallBold" style={{ color: palette.accent }}>
                    {item.total}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      </DashboardSection>

      <DashboardSection
        title="Situação econômica"
        icon="work"
        trailing={
          <ThemedText type="small" themeColor="textSecondary">
            Classificação
          </ThemedText>
        }>
        <View style={styles.economicGrid}>
          {resumo.porSituacaoEconomica.map((item) => {
            const isUnknown = item.chave === 'Não informado';
            return (
              <View
                key={item.chave}
                style={[
                  styles.economicTile,
                  {
                    backgroundColor: isUnknown ? theme.input : theme.primarySoft,
                    borderColor: isUnknown ? theme.border : 'transparent',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.economicValue,
                    { color: isUnknown ? theme.textSecondary : theme.primary },
                  ]}>
                  {item.total}
                </ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {item.label}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.percentual}% do total
                </ThemedText>
              </View>
            );
          })}
        </View>
      </DashboardSection>

      <DashboardSection
        title="Tipo de residência"
        icon="home"
        trailing={
          <ThemedText type="small" themeColor="textSecondary">
            Moradia
          </ThemedText>
        }>
        <View style={styles.residenceSummaryList}>
          {resumo.porResidencia.map((item) => {
            const color = RESIDENCIA_COLORS[item.chave];
            return (
              <View key={item.chave} style={styles.residenceSummaryRow}>
                <View style={styles.residenceSummaryLeft}>
                  <View style={[styles.statusDot, { backgroundColor: color }]} />
                  <ThemedText type="smallBold">{item.label}</ThemedText>
                </View>
                <ThemedText type="smallBold" style={{ color }}>
                  {item.total} ({item.percentual}%)
                </ThemedText>
              </View>
            );
          })}
        </View>
        {residenceSegments.length > 0 ? (
          <SegmentedBar
            segments={residenceSegments.map((item) => ({
              key: item.chave,
              value: item.total,
              color: RESIDENCIA_COLORS[item.chave],
            }))}
          />
        ) : null}
      </DashboardSection>

      <ThemedView
        type="backgroundElement"
        style={[styles.infoCard, { borderColor: theme.border }]}>
        <View style={styles.backupHeader}>
          <View style={[styles.iconBox, { backgroundColor: theme.primarySoft }]}>
            <AppIcon name="database" color={theme.primary} size={22} />
          </View>
          <View style={styles.backupCopy}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Backup das famílias
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Salve ou importe uma cópia dos seus cadastros.
            </ThemedText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/backup')}
          style={({ pressed }) => [
            styles.primaryAction,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.78 : 1,
            },
          ]}>
          <AppIcon name="database" color="#FFFFFF" size={20} />
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            Ir para Backup
          </ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: Spacing.three,
  },
  sectionPill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  barList: {
    gap: Spacing.three,
  },
  localityItem: {
    gap: Spacing.one,
  },
  localityRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  localityLabel: {
    flex: 1,
  },
  neighborhoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  neighborhoodName: {
    width: 112,
  },
  neighborhoodBarWrap: {
    flex: 1,
  },
  neighborhoodCount: {
    minWidth: 28,
    textAlign: 'right',
  },
  religiousPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  religiousPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.one,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  religiousCountBadge: {
    minWidth: 26,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
  },
  economicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  economicTile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: Spacing.half,
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
  },
  economicValue: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
  },
  residenceSummaryList: {
    gap: Spacing.two,
  },
  residenceSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  residenceSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  infoCard: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  backupCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  cardTitle: {
    fontSize: 19,
    lineHeight: 26,
    flexShrink: 1,
  },
  primaryAction: {
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 18,
    paddingHorizontal: Spacing.four,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});

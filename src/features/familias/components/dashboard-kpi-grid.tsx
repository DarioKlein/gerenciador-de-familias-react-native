import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatarUltimaAtualizacao,
  type DashboardResumo,
} from '@/features/familias/dashboard';
import { useTheme } from '@/hooks/use-theme';

export function DashboardKpiGrid({ resumo }: { resumo: DashboardResumo }) {
  const theme = useTheme();
  const hasIncomplete = resumo.cadastrosIncompletos > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.consolidatedBanner, { backgroundColor: theme.primarySoft }]}>
        <View style={styles.consolidatedLeft}>
          <AppIcon name="check" color={theme.primary} size={18} />
          <ThemedText type="smallBold" style={[styles.consolidatedText, { color: theme.primary }]}>
            Dados consolidados no aparelho
          </ThemedText>
        </View>
        <View
          style={[
            styles.consolidatedDatePill,
            { backgroundColor: theme.backgroundElement },
          ]}>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {formatarUltimaAtualizacao(resumo.ultimaAtualizacao)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Total de famílias: ${resumo.totalFamilias}. Toque para ver a lista`}
            onPress={() => router.push('/familias')}
            style={({ pressed }) => [
              styles.kpiCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <View style={styles.kpiTop}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.kpiLabel}>
                Total de famílias
              </ThemedText>
              <View style={[styles.kpiIcon, { backgroundColor: theme.primarySoft }]}>
                <AppIcon name="people" color={theme.primary} size={19} />
              </View>
            </View>
            <ThemedText style={styles.kpiValue}>{resumo.totalFamilias}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Cadastros ativos
            </ThemedText>
          </Pressable>

          <ThemedView
            type="backgroundElement"
            style={[styles.kpiCard, { borderColor: theme.border }]}>
            <View style={styles.kpiTop}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.kpiLabel}>
                Bairros
              </ThemedText>
              <View style={[styles.kpiIcon, { backgroundColor: '#D8F0F7' }]}>
                <AppIcon name="location" color="#12627A" size={19} />
              </View>
            </View>
            <View style={styles.kpiValueRow}>
              <ThemedText style={styles.kpiValue}>{resumo.totalBairros}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {resumo.totalBairros === 1 ? 'bairro' : 'bairros'}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Com famílias cadastradas
            </ThemedText>
          </ThemedView>
        </View>

        <View style={styles.kpiRow}>
          <ThemedView
            type="backgroundElement"
            style={[styles.kpiCard, { borderColor: theme.border }]}>
            <View style={styles.kpiTop}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.kpiLabel}>
                Setores
              </ThemedText>
              <View style={[styles.kpiIcon, { backgroundColor: theme.primarySoft }]}>
                <AppIcon name="filter" color={theme.primary} size={19} />
              </View>
            </View>
            <View style={styles.kpiValueRow}>
              <ThemedText style={styles.kpiValue}>{resumo.totalSetores}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {resumo.totalSetores === 1 ? 'setor ativo' : 'setores ativos'}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Setores 1 a 7 e Patrimônios
            </ThemedText>
          </ThemedView>

          <View
            style={[
              styles.kpiCard,
              {
                backgroundColor: hasIncomplete ? theme.dangerSoft : theme.primarySoft,
                borderColor: hasIncomplete ? '#F5C2C0' : theme.primary,
              },
            ]}>
            <View style={styles.kpiTop}>
              <ThemedText
                type="smallBold"
                style={[
                  styles.kpiLabel,
                  { color: hasIncomplete ? theme.danger : theme.primary },
                ]}>
                Sem inf. completa
              </ThemedText>
              <View
                style={[
                  styles.kpiIcon,
                  { backgroundColor: theme.backgroundElement },
                ]}>
                <AppIcon
                  name={hasIncomplete ? 'warning' : 'check'}
                  color={hasIncomplete ? theme.danger : theme.primary}
                  size={19}
                />
              </View>
            </View>
            <View style={styles.kpiValueRow}>
              <ThemedText
                style={[
                  styles.kpiValue,
                  { color: hasIncomplete ? theme.danger : theme.primary },
                ]}>
                {resumo.cadastrosIncompletos}
              </ThemedText>
              <ThemedText
                type="smallBold"
                style={{ color: hasIncomplete ? theme.danger : theme.primary }}>
                {resumo.cadastrosIncompletos === 1 ? 'ficha' : 'fichas'}
              </ThemedText>
            </View>
            <View
              style={[
                styles.attentionBadge,
                { backgroundColor: hasIncomplete ? theme.danger : theme.primary },
              ]}>
              <ThemedText type="smallBold" style={styles.attentionBadgeText}>
                {hasIncomplete ? 'ATENÇÃO' : 'COMPLETO'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  consolidatedBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderRadius: 18,
    padding: Spacing.three,
  },
  consolidatedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  consolidatedText: {
    flexShrink: 1,
  },
  consolidatedDatePill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  kpiGrid: {
    gap: Spacing.two,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  kpiCard: {
    flex: 1,
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 22,
    padding: Spacing.three,
  },
  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  kpiLabel: {
    flex: 1,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  kpiValue: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  attentionBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  attentionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
});

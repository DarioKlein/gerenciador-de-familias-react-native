import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBrandHeader } from '@/components/app-header';
import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useFamiliasRepository } from '@/database/use-familias-repository';
import { DashboardBreakdownCards } from '@/features/familias/components/dashboard-breakdown-cards';
import { DashboardEmptyState } from '@/features/familias/components/dashboard-empty-state';
import { DashboardKpiGrid } from '@/features/familias/components/dashboard-kpi-grid';
import { calcularResumoDashboard } from '@/features/familias/dashboard';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const repository = useFamiliasRepository();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        const items = await repository.listar();
        setFamilias(items);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar o resumo das famílias.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [repository]
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const resumo = useMemo(() => calcularResumoDashboard(familias), [familias]);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }>
          <View style={styles.content}>
            <View style={styles.header}>
              <AppBrandHeader
                title="Início"
                description="Visão geral dos cadastros de famílias."
              />

              {resumo.totalFamilias > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cadastrar nova família"
                  onPress={() => router.push('/familias/nova')}
                  style={({ pressed }) => [
                    styles.primaryAction,
                    {
                      backgroundColor: theme.primary,
                      opacity: pressed ? 0.78 : 1,
                    },
                  ]}>
                  <AppIcon name="addPerson" color="#FFFFFF" size={22} />
                  <ThemedText type="smallBold" style={styles.primaryButtonText}>
                    Nova família
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>

            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}>
                <AppIcon name="warning" color={theme.danger} size={20} />
                <ThemedText type="smallBold" style={[styles.errorText, { color: theme.danger }]}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            {loading && familias.length === 0 ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={theme.primary} />
                <ThemedText themeColor="textSecondary">Carregando resumo…</ThemedText>
              </View>
            ) : resumo.totalFamilias === 0 ? (
              <DashboardEmptyState />
            ) : (
              <View style={styles.populatedContent}>
                <DashboardKpiGrid resumo={resumo} />
                <DashboardBreakdownCards resumo={resumo} />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.select({ web: 96, default: Spacing.three }),
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.three,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 18,
    padding: Spacing.three,
  },
  errorText: {
    flex: 1,
  },
  loadingState: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  populatedContent: {
    gap: Spacing.three,
  },
});

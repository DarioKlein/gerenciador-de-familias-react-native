import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useFamiliasRepository } from '@/database/use-familias-repository';
import { FamiliaCard } from '@/features/familias/components/familia-card';
import { SelectField } from '@/features/familias/components/select-field';
import {
  CIDADES,
  getLocalidadeLabel,
  SITUACOES_RELIGIOSAS,
  type Cidade,
  type SituacaoReligiosa,
} from '@/features/familias/constants';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

export default function FamiliasScreen() {
  const theme = useTheme();
  const repository = useFamiliasRepository();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [bairro, setBairro] = useState<string | null>(null);
  const [situacao, setSituacao] = useState<SituacaoReligiosa | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        const [items, neighborhoodOptions] = await Promise.all([
          repository.listar({
            busca,
            cidade,
            bairro,
            situacaoReligiosa: situacao,
          }),
          repository.listarBairros(),
        ]);
        setFamilias(items);
        setBairros(neighborhoodOptions);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar as famílias.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bairro, busca, cidade, repository, situacao]
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const clearFilters = () => {
    setBusca('');
    setCidade(null);
    setBairro(null);
    setSituacao(null);
  };

  const hasFilters = Boolean(busca.trim() || cidade || bairro || situacao);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={familias}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={familias.length > 0 || hasFilters}
          bounces={familias.length > 0}
          alwaysBounceVertical={false}
          refreshing={refreshing}
          onRefresh={() => void load(true)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.titleBlock}>
                <ThemedText type="subtitle">Famílias</ThemedText>
                <ThemedText themeColor="textSecondary">
                  Consulte e encontre cadastros mesmo sem internet.
                </ThemedText>
              </View>

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

              <View
                style={[
                  styles.search,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}>
                <AppIcon name="search" color={theme.textSecondary} size={22} />
                <TextInput
                  value={busca}
                  onChangeText={setBusca}
                  placeholder="Buscar por nome, rua ou telefone"
                  placeholderTextColor={theme.textSecondary}
                  selectionColor={theme.primary}
                  returnKeyType="search"
                  style={[styles.searchInput, { color: theme.text }]}
                />
                {busca ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Limpar busca"
                    onPress={() => setBusca('')}
                    style={styles.clearSearch}>
                    <AppIcon name="close" color={theme.textSecondary} size={18} />
                  </Pressable>
                ) : null}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}>
                <SelectField<Cidade>
                  variant="chip"
                  label="Localidade"
                  value={cidade}
                  options={CIDADES}
                  getLabel={getLocalidadeLabel}
                  onChange={setCidade}
                />
                <SelectField<string>
                  variant="chip"
                  label="Bairro"
                  value={bairro}
                  options={bairros}
                  onChange={setBairro}
                />
                <SelectField<SituacaoReligiosa>
                  variant="chip"
                  label="Situação"
                  value={situacao}
                  options={SITUACOES_RELIGIOSAS}
                  onChange={setSituacao}
                />
              </ScrollView>

              <View style={styles.resultsRow}>
                <View style={styles.resultCount}>
                  <AppIcon name="filter" color={theme.primary} size={19} />
                  <ThemedText type="smallBold">
                    {loading ? 'Carregando…' : `${familias.length} ${familias.length === 1 ? 'família' : 'famílias'}`}
                  </ThemedText>
                </View>
                {hasFilters ? (
                  <Pressable accessibilityRole="button" onPress={clearFilters}>
                    <ThemedText type="smallBold" style={{ color: theme.primary }}>
                      Limpar filtros
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>

              {error ? (
                <View style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}>
                  <ThemedText type="smallBold" style={{ color: theme.danger }}>
                    {error}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <FamiliaCard
              familia={item}
              onPress={() =>
                router.push({ pathname: '/familias/[id]', params: { id: item.id } })
              }
            />
          )}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
                  <AppIcon
                    name={hasFilters ? 'search' : 'addPerson'}
                    color={theme.primary}
                    size={38}
                  />
                </View>
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                  {hasFilters ? 'Nenhuma família encontrada' : 'Nenhuma família cadastrada'}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
                  {hasFilters
                    ? 'Tente alterar ou remover os filtros para ampliar os resultados.'
                    : 'Cadastre a primeira família para começar a organizar sua base local.'}
                </ThemedText>
                {hasFilters ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={clearFilters}
                    style={[styles.emptyAction, { backgroundColor: theme.primary }]}>
                    <View style={styles.buttonContent}>
                      <AppIcon name="filter" color="#FFFFFF" size={20} />
                      <ThemedText type="smallBold" style={styles.primaryButtonText}>
                        Limpar todos os filtros
                      </ThemedText>
                    </View>
                  </Pressable>
                ) : null}
              </View>
            )
          }
        />

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
  listContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  titleBlock: {
    gap: Spacing.one,
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
  search: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
  },
  clearSearch: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  filters: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  resultsRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  resultCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  errorBanner: {
    borderRadius: 18,
    padding: Spacing.three,
  },
  separator: {
    height: Spacing.three,
  },
  emptyState: {
    flex: 1,
    minHeight: 300,
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  loadingState: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  emptyCopy: {
    maxWidth: 480,
    textAlign: 'center',
  },
  emptyAction: {
    width: '100%',
    maxWidth: 300,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});

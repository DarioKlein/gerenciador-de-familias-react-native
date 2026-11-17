import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFamiliasRepository } from '@/database/use-familias-repository';
import { FamiliaForm } from '@/features/familias/components/familia-form';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

export default function EditarFamiliaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const repository = useFamiliasRepository();
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [bairros, setBairros] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      void Promise.all([repository.buscarPorId(id), repository.listarBairros()])
        .then(([item, neighborhoodOptions]) => {
          if (!active) return;
          setFamilia(item);
          setBairros(neighborhoodOptions);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [id, repository])
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerState}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText themeColor="textSecondary">Carregando cadastro…</ThemedText>
      </ThemedView>
    );
  }

  if (!familia) {
    return (
      <ThemedView style={styles.centerState}>
        <ThemedText type="subtitle">Família não encontrada</ThemedText>
        <ThemedText themeColor="textSecondary">Este cadastro não existe mais.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FamiliaForm
      initialValue={familia}
      bairros={bairros}
      submitLabel="Salvar alterações"
      onCancel={() => router.back()}
      onSubmit={async (input) => {
        const updated = await repository.atualizar(familia.id, input);
        if (!updated) throw new Error('O cadastro não foi encontrado para atualização.');
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
});

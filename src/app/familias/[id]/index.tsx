import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFamiliasRepository } from '@/database/use-familias-repository';
import { DeleteFamilyModal } from '@/features/familias/components/delete-family-modal';
import {
  FamiliaAddressSection,
  FamiliaCompositionSection,
  FamiliaContactSection,
  FamiliaHeroCard,
  FamiliaRoleSection,
  FamiliaStatusSection,
  FamiliaVisitSection,
} from '@/features/familias/components/familia-detail-sections';
import { RegisterVisitModal } from '@/features/familias/components/register-visit-modal';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

export default function FamiliaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const repository = useFamiliasRepository();
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitOpen, setVisitOpen] = useState(false);
  const [savingVisit, setSavingVisit] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(null);
      void repository
        .buscarPorId(id)
        .then((item) => {
          if (active) setFamilia(item);
        })
        .catch((loadError) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : 'Não foi possível carregar a família.'
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [id, repository])
  );

  const confirmVisit = async (dataIso: string) => {
    if (!familia) return;
    try {
      setSavingVisit(true);
      setError(null);
      const updated = await repository.registrarVisita(familia.id, dataIso);
      if (!updated) throw new Error('O cadastro não foi encontrado para registrar a visita.');
      setFamilia(updated);
      setVisitOpen(false);
    } catch (visitError) {
      setError(
        visitError instanceof Error
          ? visitError.message
          : 'Não foi possível registrar a visita.'
      );
      setVisitOpen(false);
    } finally {
      setSavingVisit(false);
    }
  };

  const confirmDelete = async () => {
    if (!familia) return;
    try {
      setDeleting(true);
      const deleted = await repository.excluir(familia.id);
      if (!deleted) throw new Error('O cadastro não foi encontrado para exclusão.');
      setDeleteOpen(false);
      router.replace('/familias');
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível excluir a família.'
      );
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !familia) {
    return (
      <ThemedView style={styles.centerState}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText themeColor="textSecondary">Carregando cadastro…</ThemedText>
      </ThemedView>
    );
  }

  if (!familia) {
    return (
      <ProductScreen title="Família não encontrada">
        <ThemedView
          type="backgroundElement"
          style={[styles.emptyCard, { borderColor: theme.border }]}>
          <ThemedText themeColor="textSecondary">
            {error ?? 'Este cadastro não existe mais no aparelho.'}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/familias')}
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              Voltar para famílias
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ProductScreen>
    );
  }

  return (
    <ProductScreen>
      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}>
          <ThemedText type="smallBold" style={{ color: theme.danger }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <FamiliaHeroCard
        familia={familia}
        onRegisterVisit={() => setVisitOpen(true)}
        onEdit={() =>
          router.push({ pathname: '/familias/[id]/editar', params: { id: familia.id } })
        }
        onDelete={() => setDeleteOpen(true)}
      />

      <FamiliaVisitSection familia={familia} />
      <FamiliaAddressSection familia={familia} />
      <FamiliaContactSection familia={familia} />
      <FamiliaCompositionSection familia={familia} />
      <FamiliaRoleSection familia={familia} />
      <FamiliaStatusSection familia={familia} />

      {visitOpen ? (
        <RegisterVisitModal
          familia={familia}
          visible={visitOpen}
          saving={savingVisit}
          onCancel={() => setVisitOpen(false)}
          onConfirm={confirmVisit}
        />
      ) : null}

      <DeleteFamilyModal
        familia={familia}
        visible={deleteOpen}
        deleting={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </ProductScreen>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  emptyCard: {
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  errorBanner: {
    borderRadius: 18,
    padding: Spacing.three,
  },
});

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFamiliasRepository } from '@/database/use-familias-repository';
import { DeleteFamilyModal } from '@/features/familias/components/delete-family-modal';
import { StatusBadge } from '@/features/familias/components/status-badge';
import {
  getLocalidadeLabel,
  MUNICIPIO_OFICIAL,
  UF_OFICIAL,
} from '@/features/familias/constants';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

export default function FamiliaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const repository = useFamiliasRepository();
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [loading, setLoading] = useState(true);
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
      <ProductScreen title="Família não encontrada">
        <ThemedView type="backgroundElement" style={styles.card}>
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

  const address = [familia.endereco, familia.numero].filter(Boolean).join(', ');
  const location = [
    familia.bairro,
    familia.cidade ? getLocalidadeLabel(familia.cidade) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ProductScreen>
      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}>
          <ThemedText type="smallBold" style={{ color: theme.danger }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <ThemedView
        type="backgroundElement"
        style={[styles.heroCard, { borderColor: theme.border }]}>
        <View style={styles.heroHeader}>
          <View style={[styles.heroIcon, { backgroundColor: theme.primarySoft }]}>
            <AppIcon name="people" color={theme.primary} size={28} />
          </View>
          <View style={styles.heroCopy}>
            <ThemedText type="subtitle" style={styles.heroTitle}>
              {familia.nome}
            </ThemedText>
          </View>
          {familia.situacaoReligiosa ? (
            <StatusBadge value={familia.situacaoReligiosa} />
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar cadastro"
            onPress={() =>
              router.push({ pathname: '/familias/[id]/editar', params: { id: familia.id } })
            }
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.78 : 1 },
            ]}>
            <View style={styles.buttonContent}>
              <AppIcon name="edit" color="#FFFFFF" size={20} />
              <ThemedText type="smallBold" style={styles.buttonText}>
                Editar
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDeleteOpen(true)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.danger,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            <View style={styles.buttonContent}>
              <AppIcon name="trash" color="#FFFFFF" size={20} />
              <ThemedText type="smallBold" style={styles.buttonText}>
                Excluir
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </ThemedView>

      <DetailSection title="Endereço" icon="location">
        <DetailRow label="CEP" value={familia.cep} />
        <DetailRow label="Rua e número" value={address} />
        <DetailRow label="Bairro e localidade" value={location || null} />
        <DetailRow label="Município" value={`${MUNICIPIO_OFICIAL}/${UF_OFICIAL}`} />
      </DetailSection>

      <DetailSection title="Contato" icon="phone">
        <DetailRow label="Telefone" value={familia.telefone} />
      </DetailSection>

      <DetailSection title="Função" icon="work">
        <DetailRow
          label={familia.cargos.length === 1 ? 'Cargo' : 'Cargos'}
          value={familia.cargos.length > 0 ? familia.cargos.join(', ') : null}
        />
        <DetailRow label="Ministério" value={familia.ministerio} />
      </DetailSection>

      <DetailSection title="Situação" icon="religious">
        <DetailRow label="Situação religiosa" value={familia.situacaoReligiosa} />
        <DetailRow label="Situação econômica" value={familia.situacaoEconomica} />
        <DetailRow label="Residência" value={familia.residencia} />
      </DetailSection>

      <ThemedText type="small" themeColor="textSecondary" style={styles.timestamps}>
        Criado em {formatDate(familia.criadoEm)} · Atualizado em{' '}
        {formatDate(familia.atualizadoEm)}
      </ThemedText>

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

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: AppIconName;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name={icon} color={theme.primary} size={20} />
        </View>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
      {children}
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  const theme = useTheme();
  return (
    <View style={[styles.detailRow, { backgroundColor: theme.input }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value || 'Não informado'}</ThemedText>
    </View>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
  },
  heroCard: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  detailRow: {
    gap: Spacing.half,
    borderRadius: 16,
    padding: Spacing.three,
  },
  timestamps: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  errorBanner: {
    borderRadius: 18,
    padding: Spacing.three,
  },
});

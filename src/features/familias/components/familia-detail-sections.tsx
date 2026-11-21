import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  getLocalidadeLabel,
  MUNICIPIO_OFICIAL,
  UF_OFICIAL,
} from '@/features/familias/constants';
import {
  abrirEnderecoNoMapa,
  construirConsultaMapa,
  type ProvedorMapa,
} from '@/features/familias/mapa';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

import { StatusBadge } from './status-badge';

export function FamiliaHeroCard({
  familia,
  onEdit,
  onDelete,
}: {
  familia: Familia;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const location = [
    familia.setor,
    familia.bairro,
    familia.cidade ? getLocalidadeLabel(familia.cidade) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.heroCard, { borderColor: theme.border }]}>
      <View style={styles.heroTopRow}>
        <View style={[styles.heroIcon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name="people" color={theme.primary} size={28} />
        </View>
        <View style={styles.heroCopy}>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            {familia.nome}
          </ThemedText>
          <View style={styles.heroLocationRow}>
            <AppIcon name="location" color={theme.textSecondary} size={15} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.heroLocationText}>
              {location || 'Localização não informada'}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.heroBadgesRow}>
        {familia.situacaoReligiosa ? (
          <StatusBadge value={familia.situacaoReligiosa} />
        ) : (
          <View style={[styles.neutralBadge, { backgroundColor: theme.input }]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Situação não informada
            </ThemedText>
          </View>
        )}
        {familia.setor ? (
          <View style={[styles.highlightBadge, { backgroundColor: '#D8F0F7' }]}>
            <AppIcon name="location" color="#12627A" size={14} />
            <ThemedText type="smallBold" style={{ color: '#12627A' }}>
              {familia.setor}
            </ThemedText>
          </View>
        ) : null}
        {familia.ministerio ? (
          <View style={[styles.highlightBadge, { backgroundColor: theme.primarySoft }]}>
            <AppIcon name="religious" color={theme.primary} size={14} />
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {familia.ministerio}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar cadastro"
          onPress={onEdit}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.78 : 1 },
          ]}>
          <View style={styles.buttonContent}>
            <AppIcon name="edit" color="#FFFFFF" size={20} />
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              Editar
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Excluir família"
          onPress={onDelete}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteActionButton,
            {
              backgroundColor: theme.dangerSoft,
              borderColor: '#F5C2C0',
              opacity: pressed ? 0.78 : 1,
            },
          ]}>
          <View style={styles.buttonContent}>
            <AppIcon name="trash" color={theme.danger} size={20} />
            <ThemedText type="smallBold" style={{ color: theme.danger }}>
              Excluir
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </ThemedView>
  );
}

export function FamiliaAddressSection({ familia }: { familia: Familia }) {
  const theme = useTheme();
  const [mapError, setMapError] = useState<string | null>(null);

  const address = [familia.endereco, familia.numero].filter(Boolean).join(', ');
  const location = [
    familia.setor,
    familia.bairro,
    familia.cidade ? getLocalidadeLabel(familia.cidade) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const consultaMapa = construirConsultaMapa(familia);
  const enderecoCompleto = consultaMapa !== null;

  const handleOpenMap = async (provedor: ProvedorMapa) => {
    try {
      setMapError(null);
      await abrirEnderecoNoMapa(provedor, familia);
    } catch (error) {
      setMapError(
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir o aplicativo de mapas.'
      );
    }
  };

  return (
    <DetailSection title="Endereço" icon="location">
      <DetailField label="Rua e número" value={address || null} prominent />
      <DetailField label="Bairro e localidade" value={location || null} />
      <DetailField label="Setor" value={familia.setor} highlight={Boolean(familia.setor)} />
      <DetailField label="CEP" value={familia.cep} />
      <DetailField label="Município" value={`${MUNICIPIO_OFICIAL}/${UF_OFICIAL}`} />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.mapBlock}>
        <View style={styles.mapHeader}>
          <View style={styles.mapHeaderCopy}>
            <ThemedText type="smallBold">Abrir localização no mapa</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {enderecoCompleto
                ? 'Requer conexão com a internet'
                : 'Informe a localidade ou o bairro para liberar a abertura no mapa.'}
            </ThemedText>
          </View>
          {!enderecoCompleto ? (
            <View style={[styles.incompleteBadge, { backgroundColor: theme.dangerSoft }]}>
              <AppIcon name="warning" color={theme.danger} size={14} />
              <ThemedText type="smallBold" style={{ color: theme.danger }}>
                Endereço incompleto
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              enderecoCompleto
                ? 'Abrir endereço no Google Maps'
                : 'Google Maps indisponível: Endereço incompleto'
            }
            accessibilityState={{ disabled: !enderecoCompleto }}
            disabled={!enderecoCompleto}
            onPress={() => void handleOpenMap('google-maps')}
            style={({ pressed }) => [
              styles.actionButton,
              !enderecoCompleto ? styles.disabledMapButton : undefined,
              {
                backgroundColor: enderecoCompleto ? theme.primary : theme.input,
                borderColor: enderecoCompleto ? theme.primary : theme.border,
                opacity: enderecoCompleto && pressed ? 0.78 : 1,
              },
            ]}>
            <View style={styles.buttonContent}>
              <AppIcon
                name="map"
                color={enderecoCompleto ? '#FFFFFF' : theme.textSecondary}
                size={20}
              />
              <ThemedText
                type="smallBold"
                style={
                  enderecoCompleto
                    ? styles.primaryButtonText
                    : { color: theme.textSecondary }
                }>
                Google Maps
              </ThemedText>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              enderecoCompleto
                ? 'Abrir endereço no Waze'
                : 'Waze indisponível: Endereço incompleto'
            }
            accessibilityState={{ disabled: !enderecoCompleto }}
            disabled={!enderecoCompleto}
            onPress={() => void handleOpenMap('waze')}
            style={({ pressed }) => [
              styles.actionButton,
              styles.wazeActionButton,
              {
                backgroundColor: enderecoCompleto ? theme.primarySoft : theme.input,
                borderColor: enderecoCompleto ? theme.primary : theme.border,
                opacity: enderecoCompleto && pressed ? 0.78 : 1,
              },
            ]}>
            <View style={styles.buttonContent}>
              <AppIcon
                name="directions"
                color={enderecoCompleto ? theme.primary : theme.textSecondary}
                size={20}
              />
              <ThemedText
                type="smallBold"
                style={{
                  color: enderecoCompleto ? theme.primary : theme.textSecondary,
                }}>
                Waze
              </ThemedText>
            </View>
          </Pressable>
        </View>

        {mapError ? (
          <View style={[styles.mapErrorBanner, { backgroundColor: theme.dangerSoft }]}>
            <AppIcon name="warning" color={theme.danger} size={18} />
            <ThemedText type="smallBold" style={[styles.mapErrorText, { color: theme.danger }]}>
              {mapError}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </DetailSection>
  );
}

export function FamiliaContactSection({ familia }: { familia: Familia }) {
  return (
    <DetailSection title="Contato" icon="phone">
      <DetailField label="Telefone" value={familia.telefone} prominent />
    </DetailSection>
  );
}

export function FamiliaRoleSection({ familia }: { familia: Familia }) {
  const theme = useTheme();

  return (
    <DetailSection title="Função" icon="work">
      <View style={[styles.detailField, { backgroundColor: theme.input }]}>
        <ThemedText type="small" themeColor="textSecondary">
          {familia.cargos.length === 1 ? 'Cargo' : 'Cargos'}
        </ThemedText>
        {familia.cargos.length > 0 ? (
          <View style={styles.cargoChips}>
            {familia.cargos.map((cargo) => (
              <View
                key={cargo}
                style={[
                  styles.cargoChip,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <AppIcon name="check" color={theme.primary} size={14} />
                <ThemedText type="smallBold">{cargo}</ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Não informado
          </ThemedText>
        )}
      </View>

      <DetailField
        label="Ministério"
        value={familia.ministerio}
        icon={familia.ministerio ? 'religious' : undefined}
        highlight={Boolean(familia.ministerio)}
      />
    </DetailSection>
  );
}

export function FamiliaStatusSection({ familia }: { familia: Familia }) {
  const theme = useTheme();

  return (
    <DetailSection title="Situação e moradia" icon="people">
      <View style={[styles.detailField, { backgroundColor: theme.input }]}>
        <ThemedText type="small" themeColor="textSecondary">
          Situação religiosa
        </ThemedText>
        {familia.situacaoReligiosa ? (
          <View style={styles.statusBadgeWrap}>
            <StatusBadge value={familia.situacaoReligiosa} />
          </View>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Não informado
          </ThemedText>
        )}
      </View>

      <DetailField label="Situação econômica" value={familia.situacaoEconomica} />
      <DetailField
        label="Tipo de residência"
        value={familia.residencia}
        icon={familia.residencia ? 'home' : undefined}
      />
    </DetailSection>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: AppIconName;
  children: ReactNode;
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

function DetailField({
  label,
  value,
  icon,
  prominent = false,
  highlight = false,
}: {
  label: string;
  value: string | null;
  icon?: AppIconName;
  prominent?: boolean;
  highlight?: boolean;
}) {
  const theme = useTheme();
  const filled = Boolean(value);

  return (
    <View style={[styles.detailField, { backgroundColor: theme.input }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.detailValueRow}>
        {icon && filled ? (
          <AppIcon
            name={icon}
            color={highlight ? theme.primary : theme.textSecondary}
            size={18}
          />
        ) : null}
        <ThemedText
          type={filled ? 'smallBold' : 'small'}
          themeColor={filled ? 'text' : 'textSecondary'}
          style={[
            styles.detailValueText,
            prominent && filled ? styles.prominentValue : undefined,
            highlight && filled ? { color: theme.primary } : undefined,
          ]}>
          {value || 'Não informado'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 32,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  heroLocationText: {
    flex: 1,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  neutralBadge: {
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  highlightBadge: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
  },
  deleteActionButton: {
    borderWidth: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
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
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  detailField: {
    gap: Spacing.one,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  detailValueText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  prominentValue: {
    fontSize: 17,
    lineHeight: 24,
  },
  cargoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.half,
  },
  cargoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  statusBadgeWrap: {
    alignSelf: 'flex-start',
    marginTop: Spacing.half,
  },
  mapBlock: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  mapHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  mapHeaderCopy: {
    flex: 1,
    minWidth: 180,
    gap: Spacing.half,
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  disabledMapButton: {
    borderWidth: 1,
  },
  wazeActionButton: {
    borderWidth: 1,
  },
  mapErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 16,
    padding: Spacing.three,
  },
  mapErrorText: {
    flex: 1,
  },
});

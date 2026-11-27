import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Familia } from '@/features/familias/types';
import {
  aplicarMascaraData,
  ehDataFutura,
  formatarDataVisitaBr,
  obterDataHojeIso,
  obterDataOntemIso,
  parsearDataVisitaBr,
} from '@/features/familias/visita';
import { useTheme } from '@/hooks/use-theme';

import { FormTextField } from './form-text-field';

type RegisterVisitModalProps = {
  familia: Familia;
  visible: boolean;
  saving: boolean;
  onCancel: () => void;
  onConfirm: (dataIso: string) => Promise<void> | void;
};

export function RegisterVisitModal({
  familia,
  visible,
  saving,
  onCancel,
  onConfirm,
}: RegisterVisitModalProps) {
  const theme = useTheme();
  const hojeIso = obterDataHojeIso();
  const ontemIso = obterDataOntemIso();
  const [dataTexto, setDataTexto] = useState(() => formatarDataVisitaBr(hojeIso));
  const [error, setError] = useState<string | null>(null);

  const dataIsoAtual = parsearDataVisitaBr(dataTexto);
  const selecionouHoje = dataIsoAtual === hojeIso;
  const selecionouOntem = dataIsoAtual === ontemIso;

  const escolherDataRapida = (iso: string) => {
    setDataTexto(formatarDataVisitaBr(iso));
    setError(null);
  };

  const handleConfirm = () => {
    const parsedIso = parsearDataVisitaBr(dataTexto);
    if (!parsedIso) {
      setError('Informe uma data válida no formato DD/MM/AAAA.');
      return;
    }

    if (ehDataFutura(parsedIso)) {
      setError('A data da visita não pode ser futura.');
      return;
    }

    setError(null);
    void onConfirm(parsedIso);
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={saving ? undefined : onCancel}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <ThemedView
          type="backgroundElement"
          accessibilityViewIsModal
          style={[styles.dialog, { borderColor: theme.border }]}>
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
              <AppIcon name="calendar" color={theme.primary} size={26} />
            </View>
            <View style={styles.copy}>
              <ThemedText type="subtitle">Registrar nova visita</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                Família: <ThemedText type="smallBold">{familia.nome}</ThemedText>
              </ThemedText>
            </View>
          </View>

          <View style={styles.shortcutsBlock}>
            <ThemedText type="small" themeColor="textSecondary">
              Atalhos rápidos
            </ThemedText>
            <View style={styles.shortcutsRow}>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => escolherDataRapida(hojeIso)}
                style={({ pressed }) => [
                  styles.shortcutChip,
                  {
                    backgroundColor: selecionouHoje ? theme.primarySoft : theme.input,
                    borderColor: selecionouHoje ? theme.primary : theme.border,
                    opacity: pressed ? 0.78 : 1,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selecionouHoje ? theme.primary : theme.text }}>
                  Hoje
                </ThemedText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => escolherDataRapida(ontemIso)}
                style={({ pressed }) => [
                  styles.shortcutChip,
                  {
                    backgroundColor: selecionouOntem ? theme.primarySoft : theme.input,
                    borderColor: selecionouOntem ? theme.primary : theme.border,
                    opacity: pressed ? 0.78 : 1,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selecionouOntem ? theme.primary : theme.text }}>
                  Ontem
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <FormTextField
            label="Data da visita"
            required
            value={dataTexto}
            error={error ?? undefined}
            hint="Use o formato dia/mês/ano (ex.: 26/11/2026)."
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            editable={!saving}
            onChangeText={(value) => {
              setDataTexto(aplicarMascaraData(value));
              setError(null);
            }}
          />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.input, opacity: pressed ? 0.75 : 1 },
              ]}>
              <ThemedText
                type="smallBold"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.primary, opacity: pressed || saving ? 0.72 : 1 },
              ]}>
              <View style={styles.buttonContent}>
                <AppIcon name="save" color="#FFFFFF" size={19} />
                <ThemedText
                  type="smallBold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                  style={styles.saveButtonText}>
                  {saving ? 'Salvando…' : 'Salvar visita'}
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  icon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  shortcutsBlock: {
    gap: Spacing.two,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  shortcutChip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  button: {
    flex: 1,
    minHeight: 52,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: Spacing.two,
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  buttonContent: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});

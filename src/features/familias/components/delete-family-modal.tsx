import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getLocalidadeLabel } from '@/features/familias/constants';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

type DeleteFamilyModalProps = {
  familia: Familia;
  visible: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteFamilyModal({
  familia,
  visible,
  deleting,
  onCancel,
  onConfirm,
}: DeleteFamilyModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={deleting ? undefined : onCancel}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <ThemedView
          type="backgroundElement"
          accessibilityViewIsModal
          style={[styles.dialog, { borderColor: theme.border }]}>
          <View style={[styles.icon, { backgroundColor: theme.dangerSoft }]}>
            <AppIcon name="trash" color={theme.danger} size={28} />
          </View>

          <View style={styles.copy}>
            <ThemedText type="subtitle">Excluir família?</ThemedText>
            <ThemedText themeColor="textSecondary">
              O cadastro de <ThemedText type="smallBold">{familia.nome}</ThemedText> será removido
              permanentemente deste aparelho.
            </ThemedText>
          </View>

          <View style={[styles.summary, { backgroundColor: theme.input }]}>
            <ThemedText type="smallBold">{familia.nome}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {[
                familia.bairro,
                familia.cidade ? getLocalidadeLabel(familia.cidade) : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Localização não informada'}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.input, opacity: pressed ? 0.75 : 1 },
              ]}>
              <ThemedText type="smallBold">Cancelar</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.danger, opacity: pressed || deleting ? 0.7 : 1 },
              ]}>
              <View style={styles.buttonContent}>
                <AppIcon name="trash" color="#FFFFFF" size={19} />
                <ThemedText type="smallBold" style={styles.dangerButtonText}>
                  {deleting ? 'Excluindo…' : 'Excluir'}
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
    padding: Spacing.four,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    gap: Spacing.four,
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
  },
  icon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  copy: {
    gap: Spacing.two,
  },
  summary: {
    gap: Spacing.one,
    borderRadius: 18,
    padding: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});

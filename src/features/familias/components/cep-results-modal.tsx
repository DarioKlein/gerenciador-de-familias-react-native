import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { EnderecoCep } from '@/features/familias/cep';
import { useTheme } from '@/hooks/use-theme';

type CepResultsModalProps = {
  visible: boolean;
  results: EnderecoCep[];
  usingCache: boolean;
  onClose: () => void;
  onSelect: (result: EnderecoCep) => void;
};

export function CepResultsModal({
  visible,
  results,
  usingCache,
  onClose,
  onSelect,
}: CepResultsModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar resultados de CEP"
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <ThemedView
          type="backgroundElement"
          accessibilityViewIsModal
          style={[styles.sheet, { borderColor: theme.border }]}
          onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: theme.primarySoft }]}>
              <AppIcon name="location" color={theme.primary} size={23} />
            </View>
            <View style={styles.headerCopy}>
              <ThemedText type="subtitle">Escolha o endereço</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {usingCache
                  ? 'Resultados salvos anteriormente neste aparelho.'
                  : `${results.length} ${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}.`}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.input }]}>
              <AppIcon name="close" color={theme.textSecondary} size={20} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.results}>
            {results.map((result) => (
              <Pressable
                key={result.cep}
                accessibilityRole="button"
                accessibilityLabel={`Usar ${result.endereco}, CEP ${result.cep}`}
                onPress={() => onSelect(result)}
                style={({ pressed }) => [
                  styles.result,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    opacity: pressed ? 0.76 : 1,
                  },
                ]}>
                <View style={styles.resultCopy}>
                  <ThemedText type="smallBold">{result.endereco}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {[result.bairro, `${result.municipio}/${result.uf}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </ThemedText>
                  <ThemedText type="smallBold" style={{ color: theme.primary }}>
                    CEP {result.cep}
                  </ThemedText>
                </View>
                <AppIcon name="chevronRight" color={theme.primary} size={20} />
              </Pressable>
            ))}
          </ScrollView>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '80%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  headerCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  results: {
    gap: Spacing.two,
  },
  result: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
  },
  resultCopy: {
    flex: 1,
    gap: Spacing.half,
  },
});

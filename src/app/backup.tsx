import { StyleSheet } from 'react-native';

import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function BackupScreen() {
  return (
    <ProductScreen
      title="Backup"
      description="Exporte ou importe os dados das famílias com segurança.">
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Nenhum backup realizado</ThemedText>
        <ThemedText themeColor="textSecondary">
          A exportação e a importação em planilha serão adicionadas em uma próxima etapa.
        </ThemedText>
      </ThemedView>
    </ProductScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
});

import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function FamiliasScreen() {
  return (
    <ProductScreen
      title="Famílias"
      description="Consulte, pesquise e filtre os cadastros."
      action={
        <Link href="/familias/nova" asChild>
          <Pressable accessibilityRole="button" style={styles.primaryButton}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              + Nova
            </ThemedText>
          </Pressable>
        </Link>
      }>
      <ThemedView type="backgroundElement" style={styles.emptyState}>
        <ThemedText type="smallBold">Nenhuma família cadastrada</ThemedText>
        <ThemedText themeColor="textSecondary">
          Use o botão Nova para iniciar o primeiro cadastro.
        </ThemedText>
      </ThemedView>
    </ProductScreen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    gap: Spacing.two,
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: Spacing.four,
  },
  primaryButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: '#1B7F5C',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});

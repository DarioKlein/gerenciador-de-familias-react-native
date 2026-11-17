import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ProductScreen
      title="Início"
      description="Visão geral dos cadastros de famílias."
      action={
        <Link href="/familias/nova" asChild>
          <Pressable accessibilityRole="button" style={styles.primaryButton}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              + Nova família
            </ThemedText>
          </Pressable>
        </Link>
      }>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Base local preparada</ThemedText>
        <ThemedText themeColor="textSecondary">
          Os totais e avisos de backup aparecerão aqui quando os primeiros cadastros forem
          adicionados.
        </ThemedText>
      </ThemedView>
    </ProductScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
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

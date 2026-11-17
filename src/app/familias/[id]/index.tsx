import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function FamiliaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ProductScreen title="Família" description="Detalhes completos do cadastro selecionado.">
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText themeColor="textSecondary">
          O cadastro {id ? `#${id.slice(0, 8)}` : ''} será carregado nesta tela.
        </ThemedText>
      </ThemedView>
    </ProductScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
});

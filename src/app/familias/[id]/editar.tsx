import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function EditarFamiliaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ProductScreen title="Editar família" description="Atualize os dados do cadastro.">
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText themeColor="textSecondary">
          O formulário carregará o cadastro {id ? `#${id.slice(0, 8)}` : ''} para edição.
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

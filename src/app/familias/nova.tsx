import { StyleSheet } from 'react-native';

import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function NovaFamiliaScreen() {
  return (
    <ProductScreen
      title="Nova família"
      description="O formulário de cadastro usará o modelo e as validações já preparados.">
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText themeColor="textSecondary">
          A interface do formulário será implementada no próximo módulo.
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

import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function FamiliasLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="nova">
        <Stack.Header asChild>
          <CompactHeader title="Nova família" />
        </Stack.Header>
      </Stack.Screen>
      <Stack.Screen name="[id]/index">
        <Stack.Header asChild>
          <CompactHeader title="Família" />
        </Stack.Header>
      </Stack.Screen>
      <Stack.Screen name="[id]/editar">
        <Stack.Header asChild>
          <CompactHeader title="Editar família" />
        </Stack.Header>
      </Stack.Screen>
    </Stack>
  );
}

function CompactHeader({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}>
          <AppIcon name="chevronLeft" color={theme.text} size={24} />
        </Pressable>
        <ThemedText type="smallBold" style={styles.headerTitle} numberOfLines={1}>
          {title}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    flex: 1,
    paddingRight: Spacing.three,
    fontSize: 18,
    lineHeight: 24,
  },
});

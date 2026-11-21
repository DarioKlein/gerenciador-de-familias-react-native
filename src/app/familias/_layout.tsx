import { Stack } from 'expo-router';

import { AppHeader } from '@/components/app-header';
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
          <AppHeader title="Nova família" />
        </Stack.Header>
      </Stack.Screen>
      <Stack.Screen name="[id]/index">
        <Stack.Header asChild>
          <AppHeader title="Detalhes da família" />
        </Stack.Header>
      </Stack.Screen>
      <Stack.Screen name="[id]/editar">
        <Stack.Header asChild>
          <AppHeader title="Editar família" />
        </Stack.Header>
      </Stack.Screen>
    </Stack>
  );
}

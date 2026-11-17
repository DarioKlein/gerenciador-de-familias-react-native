import { Stack } from 'expo-router';

export default function FamiliasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="nova" options={{ title: 'Nova família' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Família' }} />
      <Stack.Screen name="[id]/editar" options={{ title: 'Editar família' }} />
    </Stack>
  );
}

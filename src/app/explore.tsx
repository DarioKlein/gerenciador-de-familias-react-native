import { Redirect } from 'expo-router';

/** Mantém compatibilidade com o caminho antigo do template. */
export default function LegacyExploreRoute() {
  return <Redirect href="/familias" />;
}

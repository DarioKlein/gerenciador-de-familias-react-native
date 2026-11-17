import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { migrateDatabase } from '@/database/migrations';

SplashScreen.preventAutoHideAsync();

async function initializeDatabase(db: SQLiteDatabase) {
  await migrateDatabase(db);
  await SplashScreen.hideAsync();
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SQLiteProvider databaseName="familias.db" onInit={initializeDatabase}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </SQLiteProvider>
  );
}

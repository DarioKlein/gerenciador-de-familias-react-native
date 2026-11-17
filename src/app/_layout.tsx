import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { migrateDatabase } from '@/database/migrations';

SplashScreen.preventAutoHideAsync();

async function initializeDatabase(db: SQLiteDatabase) {
  await migrateDatabase(db);
  await SplashScreen.hideAsync();
}

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.backgroundElement,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.danger,
  },
};

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="familias.db" onInit={initializeDatabase}>
      <ThemeProvider value={AppTheme}>
        <StatusBar style="dark" />
        <AppTabs />
      </ThemeProvider>
    </SQLiteProvider>
  );
}

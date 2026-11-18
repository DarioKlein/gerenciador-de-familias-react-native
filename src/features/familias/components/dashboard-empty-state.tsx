import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function DashboardEmptyState() {
  const theme = useTheme();

  return (
    <View style={styles.sections}>
      <ThemedView
        type="backgroundElement"
        style={[styles.welcomeCard, { borderColor: theme.border }]}>
        <View style={[styles.welcomeIconSurface, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name="people" color={theme.primary} size={42} />
        </View>
        <ThemedText type="subtitle" style={styles.welcomeTitle}>
          Nenhuma família cadastrada ainda
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.welcomeDescription}>
          Comece registrando as famílias da sua comunidade ou traga uma planilha Excel (.xlsx).
          Tudo fica salvo com segurança apenas no seu celular.
        </ThemedText>

        <View style={styles.welcomeActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/familias/nova')}
            style={({ pressed }) => [
              styles.primaryAction,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            <AppIcon name="addPerson" color="#FFFFFF" size={21} />
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              Cadastrar primeira família
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/backup')}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            <AppIcon name="database" color={theme.text} size={20} />
            <ThemedText type="smallBold">Importar planilha (.xlsx)</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <ThemedView
        type="backgroundElement"
        style={[styles.infoCard, { borderColor: theme.border }]}>
        <View style={styles.backupHeader}>
          <View style={[styles.iconBox, { backgroundColor: theme.input }]}>
            <AppIcon name="database" color={theme.textSecondary} size={21} />
          </View>
          <View style={styles.backupCopy}>
            <ThemedText type="smallBold">Segurança do banco de dados</ThemedText>
            <ThemedText type="small" style={{ color: theme.danger }}>
              Gere uma planilha de backup regularmente
            </ThemedText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/backup')}
          style={({ pressed }) => [
            styles.primaryAction,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.78 : 1,
            },
          ]}>
          <AppIcon name="database" color="#FFFFFF" size={20} />
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            Ir para Backup
          </ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: Spacing.three,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  welcomeCard: {
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
  },
  welcomeIconSurface: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  welcomeTitle: {
    textAlign: 'center',
  },
  welcomeDescription: {
    textAlign: 'center',
    maxWidth: 460,
  },
  welcomeActions: {
    width: '100%',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  primaryAction: {
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 18,
    paddingHorizontal: Spacing.four,
  },
  secondaryAction: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: Spacing.four,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  infoCard: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  backupCopy: {
    flex: 1,
    gap: Spacing.one,
  },
});

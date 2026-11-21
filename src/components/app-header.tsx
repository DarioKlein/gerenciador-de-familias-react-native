import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const APP_LOGO = require('@/assets/images/icon.png');
const APP_NAME = 'Famílias';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  onBack = () => router.back(),
}: AppHeaderProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={{
        backgroundColor: theme.backgroundElement,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}>
      <View style={styles.stackHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: theme.input, opacity: pressed ? 0.72 : 1 },
          ]}>
          <AppIcon name="chevronLeft" color={theme.text} size={22} />
        </Pressable>

        <Image
          source={APP_LOGO}
          style={styles.stackLogo}
          contentFit="cover"
          accessibilityLabel={`Logo ${APP_NAME}`}
        />

        <View style={styles.stackCopy}>
          <ThemedText type="smallBold" numberOfLines={1} style={{ color: theme.primary }}>
            {subtitle ? `${APP_NAME} · ${subtitle}` : APP_NAME}
          </ThemedText>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.stackTitle}>
            {title}
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}

type AppBrandHeaderProps = {
  title: string;
  description?: string;
};

export function AppBrandHeader({ title, description }: AppBrandHeaderProps) {
  const theme = useTheme();
  const eyebrow = title === APP_NAME ? 'Cadastro local' : APP_NAME;

  return (
    <View style={styles.brandHeader}>
      <View style={styles.brandRow}>
        <Image
          source={APP_LOGO}
          style={styles.brandLogo}
          contentFit="cover"
          accessibilityLabel={`Logo ${APP_NAME}`}
        />
        <View style={styles.brandTitleBlock}>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {eyebrow}
          </ThemedText>
          <ThemedText type="subtitle">{title}</ThemedText>
        </View>
      </View>
      {description ? <ThemedText themeColor="textSecondary">{description}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stackHeader: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  stackLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  stackCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  stackTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  brandHeader: {
    gap: Spacing.two,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 13,
  },
  brandTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
});

import type { PropsWithChildren, ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBrandHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type ProductScreenProps = PropsWithChildren<{
  title?: string;
  description?: string;
  action?: ReactNode;
}>;

export function ProductScreen({ title, description, action, children }: ProductScreenProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView
        style={styles.safeArea}
        edges={hasHeader ? undefined : ['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            !hasHeader ? styles.stackScrollTop : undefined,
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {hasHeader ? (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  {title ? (
                    <AppBrandHeader title={title} description={description} />
                  ) : description ? (
                    <ThemedText themeColor="textSecondary">{description}</ThemedText>
                  ) : null}
                </View>
                {action}
              </View>
            ) : null}
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.select({ web: 96, default: Spacing.three }),
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  stackScrollTop: {
    paddingTop: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
  },
});

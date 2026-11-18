import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function DashboardSection({
  title,
  icon,
  trailing,
  children,
}: {
  title: string;
  icon: AppIconName;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.sectionCard, { borderColor: theme.border }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleGroup}>
          <View style={[styles.sectionIcon, { backgroundColor: theme.primarySoft }]}>
            <AppIcon name={icon} color={theme.primary} size={19} />
          </View>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            {title}
          </ThemedText>
        </View>
        {trailing}
      </View>
      {children}
    </ThemedView>
  );
}

export function ProgressBar({
  ratio,
  color,
  hasValue,
}: {
  ratio: number;
  color: string;
  hasValue: boolean;
}) {
  const theme = useTheme();
  const widthPercent = Math.max(0, Math.min(100, Math.round(ratio * 100)));

  return (
    <View style={[styles.progressTrack, { backgroundColor: theme.input }]}>
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: `${widthPercent}%`,
            minWidth: hasValue ? 8 : 0,
          },
        ]}
      />
    </View>
  );
}

export function SegmentedBar({
  segments,
}: {
  segments: { key: string; value: number; color: string }[];
}) {
  const theme = useTheme();

  return (
    <View style={[styles.segmentedTrack, { backgroundColor: theme.input }]}>
      {segments.map((segment) => (
        <View
          key={segment.key}
          style={[
            styles.segmentedSlice,
            {
              flex: segment.value,
              backgroundColor: segment.color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  cardTitle: {
    fontSize: 19,
    lineHeight: 26,
    flexShrink: 1,
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  segmentedTrack: {
    height: 12,
    flexDirection: 'row',
    gap: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  segmentedSlice: {
    height: '100%',
  },
});

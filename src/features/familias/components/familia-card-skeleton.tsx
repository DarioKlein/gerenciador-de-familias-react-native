import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function FamiliaCardSkeletonList({ count = 3 }: { count?: number }) {
  const theme = useTheme();
  const [pulse] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.titleBar,
                { backgroundColor: theme.input, opacity: pulse },
              ]}
            />
            <Animated.View
              style={[
                styles.badgePill,
                { backgroundColor: theme.input, opacity: pulse },
              ]}
            />
          </View>

          <View style={styles.addressRow}>
            <Animated.View
              style={[
                styles.iconBox,
                { backgroundColor: theme.input, opacity: pulse },
              ]}
            />
            <View style={styles.addressLines}>
              <Animated.View
                style={[
                  styles.linePrimary,
                  { backgroundColor: theme.input, opacity: pulse },
                ]}
              />
              <Animated.View
                style={[
                  styles.lineSecondary,
                  { backgroundColor: theme.input, opacity: pulse },
                ]}
              />
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Animated.View
              style={[
                styles.footerLine,
                { backgroundColor: theme.input, opacity: pulse },
              ]}
            />
            <Animated.View
              style={[
                styles.footerAction,
                { backgroundColor: theme.input, opacity: pulse },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 24,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleBar: {
    height: 24,
    width: '56%',
    borderRadius: 10,
  },
  badgePill: {
    height: 28,
    width: 86,
    borderRadius: 999,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
  },
  addressLines: {
    flex: 1,
    gap: Spacing.two,
  },
  linePrimary: {
    height: 16,
    width: '78%',
    borderRadius: 8,
  },
  lineSecondary: {
    height: 14,
    width: '54%',
    borderRadius: 8,
  },
  footer: {
    minHeight: 52,
    marginHorizontal: -Spacing.four,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  footerLine: {
    height: 14,
    width: 120,
    borderRadius: 8,
  },
  footerAction: {
    height: 14,
    width: 78,
    borderRadius: 8,
  },
});

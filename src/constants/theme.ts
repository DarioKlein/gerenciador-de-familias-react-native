/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17211C',
    background: '#F5F7FC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#D8F7EB',
    textSecondary: '#627069',
    primary: '#087A57',
    primarySoft: '#D8F7EB',
    danger: '#B91C1C',
    dangerSoft: '#FDE8E7',
    border: '#E5E9ED',
    input: '#F1F3F7',
    overlay: 'rgba(23, 33, 28, 0.46)',
  },
  dark: {
    text: '#17211C',
    background: '#F5F7FC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#D8F7EB',
    textSecondary: '#627069',
    primary: '#087A57',
    primarySoft: '#D8F7EB',
    danger: '#B91C1C',
    dangerSoft: '#FDE8E7',
    border: '#E5E9ED',
    input: '#F1F3F7',
    overlay: 'rgba(23, 33, 28, 0.46)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

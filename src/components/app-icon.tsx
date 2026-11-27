import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

const icons = {
  add: { ios: 'plus', android: 'add', web: 'add' },
  addPerson: { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' },
  badge: { ios: 'person.text.rectangle', android: 'badge', web: 'badge' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  chevronLeft: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  database: { ios: 'externaldrive', android: 'database', web: 'database' },
  directions: {
    ios: 'arrow.triangle.turn.up.right.diamond',
    android: 'directions',
    web: 'directions',
  },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  filter: {
    ios: 'line.3.horizontal.decrease',
    android: 'filter_alt',
    web: 'filter_alt',
  },
  folder: { ios: 'folder', android: 'folder_open', web: 'folder_open' },
  home: { ios: 'house', android: 'home', web: 'home' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  map: { ios: 'map', android: 'map', web: 'map' },
  people: { ios: 'person.2', android: 'groups', web: 'groups' },
  phone: { ios: 'phone', android: 'call', web: 'call' },
  religious: { ios: 'building.columns', android: 'church', web: 'church' },
  restore: { ios: 'arrow.counterclockwise', android: 'restore', web: 'restore' },
  save: { ios: 'checkmark.circle', android: 'save', web: 'save' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  table: { ios: 'tablecells', android: 'table_chart', web: 'table_chart' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  warning: {
    ios: 'exclamationmark.triangle',
    android: 'warning',
    web: 'warning',
  },
  work: { ios: 'briefcase', android: 'work', web: 'work' },
} satisfies Record<string, SymbolViewProps['name']>;

export type AppIconName = keyof typeof icons;

type AppIconProps = {
  name: AppIconName;
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function AppIcon({ name, color, size = 22, style }: AppIconProps) {
  return (
    <SymbolView
      name={icons[name]}
      tintColor={color}
      size={size}
      resizeMode="scaleAspectFit"
      style={[{ width: size, height: size }, style]}
    />
  );
}

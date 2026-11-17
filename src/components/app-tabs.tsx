import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.backgroundElement}
      indicatorColor={colors.primarySoft}
      tintColor={colors.primary}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home_filled' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="familias">
        <NativeTabs.Trigger.Label>Famílias</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          md={{ default: 'groups', selected: 'groups' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="backup">
        <NativeTabs.Trigger.Label>Backup</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'externaldrive', selected: 'externaldrive.fill' }}
          md={{ default: 'backup', selected: 'backup' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

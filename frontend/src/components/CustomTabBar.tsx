import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, shadows } from '@constants/colors';
import { componentSizes, spacing } from '@constants/design';

const TAB_CONFIG: Record<string, { icon: keyof typeof Feather.glyphMap; label: string }> = {
  Home:     { icon: 'home',     label: 'Home' },
  Feed:     { icon: 'users',    label: 'Social' },
  Activity: { icon: 'bell',     label: 'Atividades' },
  Settings: { icon: 'settings', label: 'Config' },
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 6);

  const visibleRoutes = state.routes.filter(r => TAB_CONFIG[r.name]);
  const leftRoutes = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(2);

  const handleFAB = () => {
    navigation.navigate('CreatePost');
  };

  return (
    <View style={[styles.bar, { paddingBottom, borderTopColor: colors.bgSurface3 }]}>
      {leftRoutes.map((route) => {
        const isFocused = state.routes[state.index]?.name === route.name;
        const cfg = TAB_CONFIG[route.name];
        return (
          <TabItem
            key={route.key}
            icon={cfg.icon}
            label={cfg.label}
            active={isFocused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}

      {/* FAB central */}
      <TouchableOpacity
        onPress={handleFAB}
        activeOpacity={0.85}
        style={styles.fabWrap}
        accessibilityRole="button"
        accessibilityLabel="Criar publicação"
      >
        <View style={[styles.fab, { backgroundColor: colors.brand }, shadows.brand]}>
          <Feather name="plus" size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {rightRoutes.map((route) => {
        const isFocused = state.routes[state.index]?.name === route.name;
        const cfg = TAB_CONFIG[route.name];
        return (
          <TabItem
            key={route.key}
            icon={cfg.icon}
            label={cfg.label}
            active={isFocused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, { screen: `${route.name}Main` });
              }
            }}
          />
        );
      })}
    </View>
  );
}

function TabItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Feather name={icon} size={24} color={active ? colors.brand : colors.textSecondary} />
      <Text style={[styles.tabLabel, { color: active ? colors.brand : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    paddingTop: spacing[2],
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingBottom: spacing[1],
    minHeight: componentSizes.tabBarHeight,
    minWidth: componentSizes.minTouch,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing[1],
  },
  fab: {
    width: componentSizes.fabSize,
    height: componentSizes.fabSize,
    borderRadius: componentSizes.fabSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -8 }],
  },
});

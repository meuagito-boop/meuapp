import { useFocusEffect, useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';


import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

/**
 * SettingsScreen - T_CONFIG Design Aprovado
 * Hub de controle do usuÃ¡rio com grupos de configuraÃ§Ã£o
 * 5 grupos: Conta, Localidade, PreferÃªncias, Sobre, Zona de perigo
 * 17 sub-telas documentadas
 */

interface SettingGroup {
  id: string;
  title: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: string;
  type: 'link' | 'toggle' | 'action';
  route?: string;
  onPress?: () => void;
  isDanger?: boolean;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [gpsEnabled, setGpsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // Reset state when screen is focused
    }, []),
  );

  const SETTINGS_GROUPS: SettingGroup[] = [
    {
      id: 'account',
      title: 'Conta',
      items: [
        {
          id: 'my-account',
          label: 'Minha Conta',
          subtitle: 'Foto, nome, e-mail e telefone',
          type: 'link',
          route: 'SettingsMyAccount',
        },
      ],
    },
    {
      id: 'location',
      title: 'Localidade',
      items: [
        {
          id: 'city',
          label: 'Cidade Atual',
          subtitle: 'Muda o foco de buscas',
          type: 'link',
          route: 'SettingsCity',
        },
        {
          id: 'search-radius',
          label: 'Raio de Busca',
          subtitle: '5km padrÃ£o',
          type: 'link',
          route: 'SettingsSearchRadius',
        },
        {
          id: 'gps-permission',
          label: 'PermissÃ£o de GPS',
          subtitle: 'Usar localizaÃ§Ã£o ao buscar',
          type: 'toggle',
          value: gpsEnabled,
          onValueChange: setGpsEnabled,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'PreferÃªncias',
      items: [
        {
          id: 'notifications',
          label: 'NotificaÃ§Ãµes',
          subtitle: 'Controle tipos de notificaÃ§Ãµes',
          type: 'link',
          route: 'SettingsNotifications',
        },
        {
          id: 'privacy',
          label: 'Privacidade',
          subtitle: 'Conta pÃºblica, mensagens, check-ins',
          type: 'link',
          route: 'SettingsPrivacy',
        },
        {
          id: 'security',
          label: 'SeguranÃ§a',
          subtitle: 'Senha, 2FA, dispositivos',
          type: 'link',
          route: 'SettingsSecurity',
        },
        {
          id: 'language',
          label: 'Idioma',
          subtitle: 'PortuguÃªs (Brasil)',
          type: 'link',
          route: 'SettingsLanguage',
        },
      ],
    },
    {
      id: 'about',
      title: 'Sobre',
      items: [
        {
          id: 'about-app',
          label: 'Sobre o Meu Agito',
          subtitle: 'VersÃ£o, legal e suporte',
          type: 'link',
          route: 'SettingsAbout',
        },
      ],
    },
    {
      id: 'danger',
      title: 'Zona de Perigo',
      items: [
        {
          id: 'deactivate',
          label: 'Desativar Conta',
          subtitle: 'Oculta perfil temporariamente',
          type: 'action',
          isDanger: true,
          onPress: () => {
            Alert.alert(
              'Desativar Conta',
              'Sua conta serÃ¡ oculta para outros usuÃ¡rios. VocÃª pode reativar ao fazer login novamente.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Desativar',
                  onPress: () => Alert.alert('Conta desativada com sucesso'),
                  style: 'destructive',
                },
              ],
            );
          },
        },
        {
          id: 'delete',
          label: 'Excluir Conta',
          subtitle: 'ExclusÃ£o permanente e irreversÃ­vel',
          type: 'action',
          isDanger: true,
          onPress: () => {
            navigation.push('SettingsDeleteAccount');
          },
        },
      ],
    },
  ];

  const renderItem = (item: SettingItem) => {
    if (item.type === 'toggle') {
      return (
        <View
          key={item.id}
          style={[styles.settingItem, item.isDanger && styles.settingItemDanger]}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          <Switch
            value={item.value || false}
            onValueChange={item.onValueChange || (() => {})}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
            style={styles.toggle}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, item.isDanger && styles.settingItemDanger]}
        activeOpacity={0.7}
        onPress={() => {
          if (item.onPress) {
            item.onPress();
          } else if (item.route) {
            navigation.push(item.route);
          }
        }}
      >
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, item.isDanger && styles.settingLabelDanger]}>
            {item.label}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        {item.type === 'link' && (
          <Text style={styles.chevron}>â€º</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderGroup = (group: SettingGroup) => (
    <View key={group.id} style={styles.groupContainer}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{group.title}</Text>
      </View>
      <View style={styles.groupItems}>
        {group.items.map((item) => renderItem(item))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.title}>ConfiguraÃ§Ãµes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SETTINGS_GROUPS.map((group) => renderGroup(group))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text,
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  groupContainer: {
    marginBottom: spacing.lg,
  },
  groupHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  groupItems: {
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  settingItemDanger: {
    // Danger items will have red text for labels
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingLabelDanger: {
    color: '#E74C3C',
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  toggle: {
    marginLeft: spacing.md,
  },
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
});

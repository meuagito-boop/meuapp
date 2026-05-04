import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';


import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

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
  type: 'link' | 'action';
  route?: string;
  onPress?: () => void;
  isDanger?: boolean;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

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
      ],
    },
    {
      id: 'preferences',
      title: 'Preferencias',
      items: [
        {
          id: 'security',
          label: 'Seguranca',
          subtitle: 'Senha e 2FA',
          type: 'link',
          route: 'SettingsSecurity',
        },
        {
          id: 'privacy',
          label: 'Privacidade e dados',
          subtitle: 'Politica, consentimentos e exclusao',
          type: 'link',
          route: 'SettingsPrivacy',
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
          subtitle: 'Versao, legal e suporte',
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
          id: 'delete',
          label: 'Excluir Conta',
          subtitle: 'Exclusao permanente e irreversivel',
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
          <Text style={styles.chevron}>{'>'}</Text>
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
        <Text style={styles.title}>Configuracoes</Text>
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
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
});

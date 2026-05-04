import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';


import { colors } from '@constants/colors';
import { spacing } from '@constants/design';
import { useAuth } from '@hooks/useAuth';
import { ActionRow, ScreenHeader, SectionLabel } from '@components';

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
  disabled?: boolean;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    const result = await logout();
    setIsLoggingOut(false);

    if (!result.success) {
      Alert.alert('Erro ao sair', result.error || 'Nao foi possivel encerrar a sessao.');
    }
  }, [isLoggingOut, logout]);

  const confirmLogout = useCallback(() => {
    Alert.alert('Sair da conta', 'Voce quer encerrar a sessao neste dispositivo?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void handleLogout();
        },
      },
    ]);
  }, [handleLogout]);

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
        {
          id: 'logout',
          label: isLoggingOut ? 'Saindo...' : 'Sair da conta',
          subtitle: 'Encerrar sessao neste dispositivo',
          type: 'action',
          isDanger: true,
          disabled: isLoggingOut,
          onPress: confirmLogout,
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
      <ActionRow
        key={item.id}
        title={item.label}
        subtitle={item.subtitle}
        danger={item.isDanger}
        disabled={item.disabled}
        onPress={() => {
          if (item.onPress) {
            item.onPress();
          } else if (item.route) {
            navigation.push(item.route);
          }
        }}
      />
    );
  };

  const renderGroup = (group: SettingGroup) => (
    <React.Fragment key={group.id}>
      <SectionLabel label={group.title} />
      {group.items.map((item) => renderItem(item))}
    </React.Fragment>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Configuracoes" />

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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
});

import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '@constants/colors';
import { spacing } from '@constants/design';
import { openLegalDocument } from '@services/legal/LegalLinks';
import { ActionRow, InfoCard, ScreenHeader, SectionLabel } from '@components';

type PrivacyAction = {
  id: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
};

export default function SettingsPrivacyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const actions: PrivacyAction[] = [
    {
      id: 'privacy-policy',
      title: 'Politica de privacidade',
      subtitle: 'Veja como o Meu Agito trata dados pessoais.',
      onPress: () => {
        void openLegalDocument('privacy');
      },
    },
    {
      id: 'terms',
      title: 'Termos de uso',
      subtitle: 'Regras de uso do app e responsabilidades.',
      onPress: () => {
        void openLegalDocument('terms');
      },
    },
    {
      id: 'device-permissions',
      title: 'Permissoes do dispositivo',
      subtitle: 'Gerencie localizacao e notificacoes nas configuracoes do sistema.',
      onPress: () => {
        void Linking.openSettings();
      },
    },
    {
      id: 'delete-account',
      title: 'Excluir conta',
      subtitle: 'Solicita exclusao permanente da conta autenticada.',
      onPress: () => navigation.push('SettingsDeleteAccount'),
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Privacidade" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InfoCard title="Dados e consentimentos" tone="brand">
          <Text style={styles.cardText}>
            Esta area centraliza documentos legais, permissoes do dispositivo e exclusao de conta.
            Controles sociais avancados ficam fora do release atual ate existir backend compativel.
          </Text>
        </InfoCard>

        <SectionLabel label="Privacidade" />
        {actions.map((item) => (
          <ActionRow
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            onPress={item.onPress}
            danger={item.danger}
          />
        ))}
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
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 20,
  },
});

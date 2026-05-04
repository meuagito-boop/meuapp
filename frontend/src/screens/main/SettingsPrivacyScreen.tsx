import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { openLegalDocument } from '@services/legal/LegalLinks';

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados e consentimentos</Text>
          <Text style={styles.cardText}>
            Esta area centraliza documentos legais, permissoes do dispositivo e exclusao de conta.
            Controles sociais avancados ficam fora do release atual ate existir backend compativel.
          </Text>
        </View>

        <View style={styles.actionList}>
          {actions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.actionRow}
              onPress={item.onPress}
              accessibilityRole="button"
            >
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, item.danger && styles.dangerText]}>
                  {item.title}
                </Text>
                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>{'>'}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '700',
  },
  headerTitle: {
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
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  actionList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  dangerText: {
    color: '#E74C3C',
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
  },
});

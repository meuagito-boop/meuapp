import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

/**
 * SettingsSecurity - Sub-tela de Segurança
 * Tela 10 de T_CONFIG
 * Password, 2FA,Dispositivos, Histórico, Alertas
 */

export default function SettingsSecurityScreen() {
  const navigation = useNavigation<any>();
  const [alertNewAccess, setAlertNewAccess] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // Load security settings
    }, []),
  );

  const securityItems = [
    {
      id: 'password',
      label: 'Alterar Senha',
      subtitle: 'Atualize sua senha regularmente',
      route: 'SettingsChangePassword',
    },
    {
      id: '2fa',
      label: 'Autenticação 2FA',
      subtitle: 'SMS, App autenticador ou E-mail',
      route: 'Settings2FA',
    },
    {
      id: 'devices',
      label: 'Dispositivos',
      subtitle: 'Gerenciar dispositivos conectados',
      route: 'SettingsDevices',
    },
    {
      id: 'access-history',
      label: 'Histórico de Acessos',
      subtitle: 'Acessos recentes à sua conta',
      route: 'SettingsAccessHistory',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Segurança</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {securityItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => navigation.push(item.route)}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Alert Toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notificações de Segurança</Text>
          </View>
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Alerta de novo acesso</Text>
              <Text style={styles.itemSubtitle}>Notifique quando alguém acessar sua conta</Text>
            </View>
            <View style={styles.toggleDisabled}>
              <View style={styles.toggleSwitch} />
            </View>
          </View>
          <View style={styles.warningText}>
            <Text style={styles.warningTextContent}>
              Não pode ser desativado por policy de segurança
            </Text>
          </View>
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
    fontSize: 15,
    color: colors.text,
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
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
  toggleDisabled: {
    width: 38,
    height: 21,
    borderRadius: 11,
    backgroundColor: colors.primary,
    opacity: 0.5,
    justifyContent: 'center',
  },
  toggleSwitch: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: colors.text,
    marginLeft: 19,
  },
  warningText: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  warningTextContent: {
    fontSize: fontSize.xs,
    color: '#E74C3C',
    fontWeight: '700',
  },
});

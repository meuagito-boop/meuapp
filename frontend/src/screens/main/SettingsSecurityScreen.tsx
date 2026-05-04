import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { userService } from '@services/api';

export default function SettingsSecurityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    userService
      .getProfile()
      .then((profile) => {
        if (!isMounted) {
          return;
        }

        setTwoFactorEnabled(profile.twoFactorEnabled === true);
        setEmailVerified(profile.emailVerified ?? null);
        setStatusError(null);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o status de seguranca.';
        setStatusError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const securityItems = [
    {
      id: 'password',
      label: 'Alterar senha',
      subtitle: 'Atualize sua senha regularmente',
      route: 'SettingsChangePassword',
    },
    {
      id: '2fa',
      label: 'Autenticacao 2FA',
      subtitle: 'Aplicativo autenticador',
      route: 'Settings2FA',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>{'<-'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguranca</Text>
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
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Status da conta</Text>
          </View>
          <View style={styles.statusCard}>
            {isLoadingStatus ? (
              <View style={styles.statusLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.itemSubtitle}>Consultando backend...</Text>
              </View>
            ) : statusError ? (
              <Text style={styles.warningTextContent}>{statusError}</Text>
            ) : (
              <>
                <View style={styles.statusRow}>
                  <Text style={styles.itemLabel}>2FA</Text>
                  <Text style={[styles.statusValue, twoFactorEnabled && styles.statusValueActive]}>
                    {twoFactorEnabled ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.itemLabel}>E-mail verificado</Text>
                  <Text style={[styles.statusValue, emailVerified === true && styles.statusValueActive]}>
                    {emailVerified === null ? 'Nao informado' : emailVerified ? 'Sim' : 'Nao'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.itemLabel}>Alertas de seguranca</Text>
                  <Text style={styles.statusValueActive}>Obrigatorio</Text>
                </View>
              </>
            )}
            <View style={styles.warningText}>
              <Text style={styles.warningTextContent}>
                Alertas de seguranca nao sao configuracao local do app; ficam ativos por politica de conta.
              </Text>
            </View>
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
  statusCard: {
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statusLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusValue: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  statusValueActive: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
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

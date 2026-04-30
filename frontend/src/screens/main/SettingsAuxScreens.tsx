import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Input } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { useAuth } from '@hooks/useAuth';
import { userService } from '@services/api';
import { openLegalDocument, openSupportEmail } from '@services/legal/LegalLinks';

type SettingLine = {
  title: string;
  subtitle?: string;
  type?: 'switch';
  value?: boolean;
  onPress?: () => void;
};

function SettingsScaffold({
  title,
  description,
  lines,
  children,
}: {
  title: string;
  description: string;
  lines: SettingLine[];
  children?: React.ReactNode;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>{'<-'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>{description}</Text>
        {lines.length > 0 ? (
          <View style={styles.card}>
            {lines.map((line) => {
              if (line.type === 'switch') {
                return (
                  <View key={line.title} style={styles.line}>
                    <View style={styles.lineText}>
                      <Text style={styles.lineTitle}>{line.title}</Text>
                      {line.subtitle ? <Text style={styles.lineSubtitle}>{line.subtitle}</Text> : null}
                    </View>
                    <Switch
                      value={line.value}
                      disabled
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.text}
                    />
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={line.title}
                  activeOpacity={line.onPress ? 0.7 : 1}
                  disabled={!line.onPress}
                  style={styles.line}
                  onPress={line.onPress}
                >
                  <View style={styles.lineText}>
                    <Text style={styles.lineTitle}>{line.title}</Text>
                    {line.subtitle ? <Text style={styles.lineSubtitle}>{line.subtitle}</Text> : null}
                  </View>
                  {line.onPress ? <Text style={styles.chevron}>{'>'}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </View>
  );
}

export function SettingsLinkedAccountsScreen() {
  return (
    <SettingsScaffold
      title="Contas vinculadas"
      description="Gerencie provedores de login social."
      lines={[
        { title: 'Google', subtitle: 'Conectado' },
        { title: 'Apple', subtitle: 'Nao conectado' },
      ]}
    />
  );
}

export function SettingsSearchRadiusScreen() {
  return (
    <SettingsScaffold
      title="Raio de busca"
      description="Define a distancia padrao para recomendacoes."
      lines={[
        { title: '5 km (padrao)', subtitle: 'Ativo' },
        { title: '10 km' },
        { title: '25 km' },
      ]}
    />
  );
}

export function SettingsNotificationsPrefsScreen() {
  return (
    <SettingsScaffold
      title="Notificacoes"
      description="Controle o que voce recebe na central e push."
      lines={[
        { title: 'Novos momentos', type: 'switch', value: true },
        { title: 'Promocoes da cidade', type: 'switch', value: true },
        { title: 'Alertas de seguranca', type: 'switch', value: true },
      ]}
    />
  );
}

export function SettingsLanguageScreen() {
  return (
    <SettingsScaffold
      title="Idioma"
      description="Mudancas de idioma podem exigir reinicio do app."
      lines={[
        { title: 'Portugues (Brasil)', subtitle: 'Ativo' },
        { title: 'English (US)' },
        { title: 'Espanol' },
      ]}
    />
  );
}

export function SettingsAboutScreen() {
  return (
    <SettingsScaffold
      title="Sobre"
      description="Informacoes legais e canais de suporte."
      lines={[
        { title: 'Versao do app', subtitle: '1.0.0' },
        {
          title: 'Termos de uso',
          onPress: () => {
            void openLegalDocument('terms');
          },
        },
        {
          title: 'Politica de privacidade',
          onPress: () => {
            void openLegalDocument('privacy');
          },
        },
        {
          title: 'Suporte',
          subtitle: 'support@meuagito.com',
          onPress: () => {
            void openSupportEmail('support@meuagito.com');
          },
        },
      ]}
    />
  );
}

export function SettingsBlockedUsersScreen() {
  return (
    <SettingsScaffold
      title="Usuarios bloqueados"
      description="Gerencie quem nao pode interagir com voce."
      lines={[
        { title: 'Nenhum usuario bloqueado', subtitle: 'Lista vazia no momento' },
      ]}
    />
  );
}

export function SettingsChangePasswordScreen() {
  return (
    <SettingsScaffold
      title="Alterar senha"
      description="Recomendado trocar senha periodicamente."
      lines={[
        { title: 'Senha atual' },
        { title: 'Nova senha' },
        { title: 'Confirmar nova senha' },
      ]}
    />
  );
}

export function Settings2FAScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { setup2FA, verify2FA, disable2FA, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    let isMounted = true;

    userService
      .getProfile()
      .then((profile) => {
        if (isMounted) {
          setIsEnabled(profile.twoFactorEnabled === true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsEnabled(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerate = async () => {
    try {
      const response = await setup2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setCode('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar QR Code.';
      Alert.alert('Falha ao iniciar 2FA', message);
    }
  };

  const handleEnable = async () => {
    const normalizedCode = code.trim();
    if (!/^\d{6}$/.test(normalizedCode)) {
      Alert.alert('Codigo invalido', 'Informe o codigo de 6 digitos do autenticador.');
      return;
    }

    try {
      await verify2FA(normalizedCode);
      setIsEnabled(true);
      setQrCode(null);
      setSecret(null);
      setCode('');
      Alert.alert('2FA ativado', 'A autenticacao em dois fatores foi habilitada na sua conta.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao validar o codigo.';
      Alert.alert('Falha ao ativar 2FA', message);
    }
  };

  const handleDisable = async () => {
    try {
      await disable2FA();
      setIsEnabled(false);
      setQrCode(null);
      setSecret(null);
      setCode('');
      Alert.alert('2FA desativado', 'A autenticacao em dois fatores foi removida da sua conta.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao desativar 2FA.';
      Alert.alert('Falha ao desativar 2FA', message);
    }
  };

  return (
    <SettingsScaffold
      title="Autenticacao 2FA"
      description={
        isEnabled
          ? 'Sua conta ja exige codigo do aplicativo autenticador no login.'
          : 'Ative uma segunda camada de autenticacao baseada em aplicativo autenticador.'
      }
      lines={[]}
    >
      {isReady ? (
        <View style={styles.inlineCard}>
          <Text style={styles.lineTitle}>
            Status atual: {isEnabled ? '2FA habilitado' : '2FA desabilitado'}
          </Text>
          <Text style={styles.lineSubtitle}>
            O login do app ja respeita esse desafio quando a conta exige verificacao adicional.
          </Text>

          {isEnabled ? (
            <Button
              label="Desativar 2FA"
              onPress={handleDisable}
              variant="danger"
              loading={isLoading}
              fullWidth
              style={styles.actionButton}
            />
          ) : qrCode ? (
            <>
              <Text style={styles.qrHint}>1. Escaneie o QR Code abaixo no autenticador.</Text>
              <Image source={{ uri: qrCode }} style={styles.qrCode} />
              {secret ? <Text style={styles.secretText}>Chave manual: {secret}</Text> : null}
              <Input
                label="Codigo do autenticador"
                placeholder="000000"
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
              />
              <Button
                label="Confirmar ativacao"
                onPress={handleEnable}
                loading={isLoading}
                disabled={code.trim().length !== 6}
                fullWidth
                style={styles.actionButton}
              />
            </>
          ) : (
            <Button
              label="Gerar QR Code"
              onPress={handleGenerate}
              loading={isLoading}
              fullWidth
              style={styles.actionButton}
            />
          )}

          <Button
            label="Voltar"
            onPress={() => navigation.goBack()}
            variant="ghost"
            disabled={isLoading}
            fullWidth
            style={styles.actionButton}
          />
        </View>
      ) : (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.lineSubtitle}>Consultando status atual do segundo fator...</Text>
        </View>
      )}
    </SettingsScaffold>
  );
}

export function SettingsDevicesScreen() {
  return (
    <SettingsScaffold
      title="Dispositivos"
      description="Sessoes ativas com historico recente."
      lines={[
        { title: 'Windows Chrome', subtitle: 'Ativo agora' },
        { title: 'Android Pixel', subtitle: 'Ontem, 21:13' },
      ]}
    />
  );
}

export function SettingsAccessHistoryScreen() {
  return (
    <SettingsScaffold
      title="Historico de acessos"
      description="Ultimos acessos da sua conta."
      lines={[
        { title: 'Sao Paulo, BR', subtitle: 'Hoje, 08:40' },
        { title: 'Santos, BR', subtitle: 'Ontem, 22:11' },
      ]}
    />
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
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineText: {
    flex: 1,
  },
  lineTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  lineSubtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
    marginLeft: spacing.md,
  },
  inlineCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  qrHint: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  qrCode: {
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  secretText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
});

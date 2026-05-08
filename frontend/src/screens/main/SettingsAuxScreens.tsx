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

import { Button, HeaderBackButton, Input } from '@components';
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

const PASSWORD_MIN_LENGTH = 8;

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
        <HeaderBackButton onPress={() => navigation.goBack()} />
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
      lines={[]}
    >
      <View style={styles.inlineCard}>
        <Text style={styles.lineTitle}>Contas indisponiveis.</Text>
        <Text style={styles.lineSubtitle}>Nao ha provedores para exibir.</Text>
      </View>
    </SettingsScaffold>
  );
}

export function SettingsSearchRadiusScreen() {
  return (
    <SettingsScaffold
      title="Raio de busca"
      description="Define a distancia padrao para recomendacoes."
      lines={[]}
    >
      <View style={styles.inlineCard}>
        <Text style={styles.lineTitle}>Ajuste indisponivel.</Text>
        <Text style={styles.lineSubtitle}>Nao ha raio de busca para alterar.</Text>
      </View>
    </SettingsScaffold>
  );
}

export function SettingsNotificationsPrefsScreen() {
  return (
    <SettingsScaffold
      title="Notificacoes"
      description="Controle o que voce recebe na central e push."
      lines={[]}
    >
      <View style={styles.inlineCard}>
        <Text style={styles.lineTitle}>Preferencias indisponiveis.</Text>
        <Text style={styles.lineSubtitle}>Nao ha opcoes de notificacao para alterar.</Text>
      </View>
    </SettingsScaffold>
  );
}

export function SettingsLanguageScreen() {
  return (
    <SettingsScaffold
      title="Idioma"
      description="Mudancas de idioma podem exigir reinicio do app."
      lines={[]}
    >
      <View style={styles.inlineCard}>
        <Text style={styles.lineTitle}>Idioma indisponivel.</Text>
        <Text style={styles.lineSubtitle}>Nao ha idiomas para alterar.</Text>
      </View>
    </SettingsScaffold>
  );
}

export function SettingsAboutScreen() {
  return (
    <SettingsScaffold
      title="Sobre o Meu Agito"
      description="Informacoes do app, documentos legais e canais de suporte."
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
      lines={[]}
    >
      <View style={styles.inlineCard}>
        <Text style={styles.lineTitle}>Lista indisponivel.</Text>
        <Text style={styles.lineSubtitle}>Nao ha usuarios para exibir.</Text>
      </View>
    </SettingsScaffold>
  );
}

export function SettingsChangePasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { changePassword, isLoading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit =
    currentPassword.length >= PASSWORD_MIN_LENGTH &&
    newPassword.length >= PASSWORD_MIN_LENGTH &&
    confirmPassword.length >= PASSWORD_MIN_LENGTH &&
    !isLoading;

  const handleSubmit = async () => {
    setFormError(null);

    if (currentPassword.length < PASSWORD_MIN_LENGTH) {
      setFormError('Informe a senha atual com pelo menos 8 caracteres.');
      return;
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setFormError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('A confirmacao precisa ser igual a nova senha.');
      return;
    }

    if (newPassword === currentPassword) {
      setFormError('A nova senha precisa ser diferente da senha atual.');
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (!result.success) {
      setFormError(result.error || 'Nao foi possivel alterar a senha.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    Alert.alert('Senha alterada', 'Sua senha foi atualizada com sucesso.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SettingsScaffold
      title="Alterar senha"
      description="Atualize sua senha usando sua senha atual."
      lines={[]}
    >
      <View style={styles.formCard}>
        <Input
          label="Senha atual"
          placeholder="Digite sua senha atual"
          value={currentPassword}
          onChangeText={(value) => {
            setCurrentPassword(value);
            setFormError(null);
          }}
          isPassword
          autoCapitalize="none"
          textContentType="password"
          editable={!isLoading}
        />
        <Input
          label="Nova senha"
          placeholder="Digite a nova senha"
          value={newPassword}
          onChangeText={(value) => {
            setNewPassword(value);
            setFormError(null);
          }}
          isPassword
          autoCapitalize="none"
          textContentType="newPassword"
          editable={!isLoading}
        />
        <Input
          label="Confirmar nova senha"
          placeholder="Repita a nova senha"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setFormError(null);
          }}
          isPassword
          autoCapitalize="none"
          textContentType="newPassword"
          editable={!isLoading}
        />

        <Text style={styles.formHint}>Use pelo menos 8 caracteres.</Text>
        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <Button
          label="Alterar senha"
          onPress={() => {
            void handleSubmit();
          }}
          loading={isLoading}
          disabled={!canSubmit}
          fullWidth
          style={styles.actionButton}
        />
      </View>
    </SettingsScaffold>
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
      description="Sessoes ativas da sua conta."
      lines={[]}
    >
      <View style={styles.inlineCard}>
        <Text style={styles.lineTitle}>Dados de sessoes indisponiveis.</Text>
        <Text style={styles.lineSubtitle}>Nao ha dispositivos para exibir.</Text>
      </View>
    </SettingsScaffold>
  );
}

export function SettingsAccessHistoryScreen() {
  return (
    <SettingsScaffold
      title="Historico de acessos"
      description="Acessos recentes da sua conta."
      lines={[]}
    >
      <View style={styles.inlineCard}>
        <Text style={styles.lineTitle}>Historico indisponivel.</Text>
        <Text style={styles.lineSubtitle}>Nao ha acessos para exibir.</Text>
      </View>
    </SettingsScaffold>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
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
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  formHint: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  formError: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
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

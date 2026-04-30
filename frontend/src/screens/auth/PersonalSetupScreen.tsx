import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';




import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { authStore } from '@stores/authStore';

type SetupStep = 1 | 2 | 3 | 4;

const INTERESTS = [
  'Gastronomia',
  'Eventos',
  'Beleza',
  'Saude',
  'Hospedagem',
  'Fitness',
  'Pet',
  'Automotivo',
  'Compras',
  'Educacao',
  'Arte e cultura',
  'Turismo',
];

export default function PersonalSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const completeOnboarding = authStore((state) => state.completeOnboarding);
  const [step, setStep] = useState<SetupStep>(1);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const usernameNormalized = username.trim().replace(/^@/, '');
  const usernameValid = /^[a-zA-Z0-9._]{3,30}$/.test(usernameNormalized);
  const interestsCount = selectedInterests.length;

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return usernameValid && usernameAvailable === true;
    }
    if (step === 2) {
      return city.trim().length > 1;
    }
    if (step === 3) {
      return interestsCount >= 3;
    }
    return true;
  }, [city, interestsCount, step, usernameAvailable, usernameValid]);

  const checkUsername = async (value: string) => {
    setUsername(value);
    setUsernameAvailable(null);

    const normalized = value.trim().replace(/^@/, '');
    if (!/^[a-zA-Z0-9._]{3,30}$/.test(normalized)) {
      return;
    }

    setIsCheckingUsername(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsCheckingUsername(false);
    setUsernameAvailable(!normalized.includes('taken'));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as SetupStep);
      return;
    }
    void completeOnboarding();
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    setStep((prev) => (prev - 1) as SetupStep);
  };

  const handleSkip = () => {
    if (step === 4) {
      return;
    }
    setStep((prev) => (prev + 1) as SetupStep);
  };

  const handleUseGps = () => {
    setCity('Sao Paulo, SP');
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  };

  const renderStepIdentity = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Como voce quer aparecer?</Text>
      <Text style={styles.stepSubtitle}>Username unico e foto opcional.</Text>

      <TouchableOpacity style={styles.avatarArea} onPress={() => setHasAvatar((prev) => !prev)}>
        <View style={[styles.avatar, hasAvatar && styles.avatarFilled]}>
          <Text style={styles.avatarIcon}>{hasAvatar ? 'ðŸ™‚' : 'ðŸ“·'}</Text>
        </View>
        <Text style={styles.avatarHint}>Toque para {hasAvatar ? 'trocar' : 'adicionar'} foto</Text>
      </TouchableOpacity>

      <Text style={styles.inputLabel}>@username</Text>
      <TextInput
        value={username}
        onChangeText={(value) => void checkUsername(value)}
        placeholder="@seunome"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        autoCapitalize="none"
      />
      <Text style={styles.validationText}>
        {isCheckingUsername
          ? 'Verificando disponibilidade...'
          : username.length === 0
          ? 'Use entre 3 e 30 caracteres.'
          : usernameAvailable === true
          ? 'Username disponivel.'
          : usernameAvailable === false
          ? 'Username ja esta em uso.'
          : 'Use apenas letras, numeros, ponto e underscore.'}
      </Text>

      <Text style={styles.inputLabel}>Bio (opcional)</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Conte algo sobre voce..."
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, styles.textarea]}
        multiline
        maxLength={150}
      />
      <Text style={styles.validationText}>{bio.length}/150</Text>
    </View>
  );

  const renderStepLocation = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Onde voce esta?</Text>
      <Text style={styles.stepSubtitle}>Defina uma cidade para personalizar seu feed.</Text>

      <TouchableOpacity style={styles.secondaryAction} onPress={handleUseGps}>
        <Text style={styles.secondaryActionText}>Usar minha localizacao atual</Text>
      </TouchableOpacity>

      <Text style={styles.inputLabel}>Cidade</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Digite o nome da cidade"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
      />

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Raio padrao: 5km</Text>
      </View>
    </View>
  );

  const renderStepInterests = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>O que voce curte?</Text>
      <Text style={styles.stepSubtitle}>Selecione pelo menos 3 categorias.</Text>

      <View style={styles.chipsContainer}>
        {INTERESTS.map((interest) => {
          const active = selectedInterests.includes(interest);
          return (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{interest}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.counterText}>{interestsCount} selecionados</Text>
    </View>
  );

  const renderStepFinish = () => (
    <View style={styles.block}>
      <Text style={styles.finishIcon}>ðŸŽ‰</Text>
      <Text style={styles.stepTitle}>Tudo pronto!</Text>
      <Text style={styles.stepSubtitle}>Seu perfil foi configurado.</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo</Text>
        {usernameNormalized.length > 0 && <Text style={styles.summaryItem}>@{usernameNormalized}</Text>}
        {city.trim().length > 0 && <Text style={styles.summaryItem}>{city}</Text>}
        {selectedInterests.length > 0 && (
          <Text style={styles.summaryItem}>{selectedInterests.slice(0, 3).join(', ')}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.progressText}>Passo {step} de 4</Text>
      </View>

      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((value) => (
          <View
            key={value}
            style={[styles.progressSegment, value <= step ? styles.progressSegmentActive : undefined]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStepIdentity()}
        {step === 2 && renderStepLocation()}
        {step === 3 && renderStepInterests()}
        {step === 4 && renderStepFinish()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 4 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipAction}>
            <Text style={styles.skipActionText}>Pular por agora</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryAction, !canGoNext && step < 4 && styles.primaryActionDisabled]}
          onPress={handleNext}
          disabled={!canGoNext && step < 4}
        >
          <Text style={styles.primaryActionText}>
            {step === 4 ? 'Explorar o Meu Agito' : 'Proximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: fontSize.xxl,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  block: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  stepTitle: {
    color: colors.text,
    fontSize: fontSize.xxxl,
    fontWeight: '800',
  },
  stepSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  avatarArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFilled: {
    borderColor: colors.primary,
  },
  avatarIcon: {
    fontSize: 28,
  },
  avatarHint: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  input: {
    height: 42,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  textarea: {
    minHeight: 90,
    height: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  validationText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  infoRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: '#1A0F05',
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  counterText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  finishIcon: {
    fontSize: 56,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  summaryItem: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  skipAction: {
    alignItems: 'center',
  },
  skipActionText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryActionDisabled: {
    backgroundColor: colors.disabled,
  },
  primaryActionText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});

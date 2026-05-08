import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, HeaderBackButton } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { AuthBackground, authInsetStyle, authPanelStyle } from './authLayout';

type ProfileType = 'personal' | 'business';

const OPTIONS: Array<{
  id: ProfileType;
  icon: ImageSourcePropType;
  title: string;
  description: string;
}> = [
  {
    id: 'personal',
    icon: require('../../../assets/icon_personal.png'),
    title: 'Conta pessoal',
    description: 'Para pessoas que querem explorar e interagir com a cidade.',
  },
  {
    id: 'business',
    icon: require('../../../assets/icon_business.png'),
    title: 'Conta empresarial',
    description: 'Para negócios e estabelecimentos que querem ser encontrados.',
  },
];

export default function ProfileSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [selected, setSelected] = useState<ProfileType | null>(null);

  const canContinue = useMemo(() => selected !== null, [selected]);

  const handleContinue = () => {
    if (!selected) return;

    navigation.navigate('SignUp', {
      profileType: selected === 'business' ? 'ESTABLISHMENT' : 'USER',
      nextSetupScreen: selected === 'business' ? 'BusinessSetup' : 'PersonalSetup',
    });
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.container}>
        {/* VOLTAR */}
        <View style={styles.header}>
          <HeaderBackButton onPress={() => navigation.navigate('Login' as never)} />
        </View>

        <View style={styles.content}>
          <View style={styles.panel}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Escolha seu tipo de conta</Text>
              <Text style={styles.subtitle}>
                Defina como você deseja usar o aplicativo.
              </Text>
            </View>

            <View style={styles.cardsWrapper}>
              {OPTIONS.map((option) => {
                const isSelected = selected === option.id;
                const isOtherSelected = selected !== null && !isSelected;

                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.85}
                    style={[
                      styles.card,
                      isSelected && styles.cardSelected,
                      isOtherSelected && styles.cardInactive,
                    ]}
                    onPress={() => setSelected((prev) => (prev === option.id ? null : option.id))}
                  >
                    <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                      <Image
                        source={option.icon}
                        style={[
                          styles.iconImage,
                          isSelected && styles.iconImageSelected,
                        ]}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle}>{option.title}</Text>
                      <Text style={styles.cardDescription}>{option.description}</Text>
                    </View>

                    <View style={[styles.check, isSelected && styles.checkSelected]}>
                      <Text style={styles.checkText}>{isSelected ? '✓' : ''}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.footer}>
              <Button
                label="Continuar"
                onPress={handleContinue}
                disabled={!canContinue}
                fullWidth
                size="large"
                style={styles.button}
              />

              <Text style={styles.footerText}>
                Você pode criar outra conta com outro e-mail a qualquer momento.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  content: {
    flex: 1,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },

  panel: {
    ...authPanelStyle,
    gap: spacing.xl,
  },

  titleBlock: {
    alignItems: 'center',
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  cardsWrapper: {
    gap: spacing.md,
  },

  card: {
    ...authInsetStyle,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: spacing.lg,
  },

  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(232, 100, 10, 0.08)',
  },

  cardInactive: {
    opacity: 0.45,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  iconContainerSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  iconImage: {
    width: 28,
    height: 28,
    opacity: 1,
  },

  iconImageSelected: {
    opacity: 1,
  },

  cardBody: {
    flex: 1,
  },

  cardTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },

  cardDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 4,
  },

  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  footer: {
    gap: spacing.md,
  },

  button: {
    borderRadius: 999,
  },

  footerText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
});

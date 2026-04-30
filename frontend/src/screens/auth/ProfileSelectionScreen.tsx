import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';




import { Button } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';

type ProfileType = 'personal' | 'business';

const OPTIONS: Array<{
  id: ProfileType;
  icon: string;
  title: string;
  description: string;
}> = [
  {
    id: 'personal',
    icon: 'ðŸ‘¤',
    title: 'Conta pessoal',
    description: 'Para descobrir e interagir com o que esta acontecendo na cidade.',
  },
  {
    id: 'business',
    icon: 'ðŸ¢',
    title: 'Conta empresarial',
    description: 'Para negocios que querem ser encontrados e atrair clientes.',
  },
];

export default function ProfileSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [selected, setSelected] = useState<ProfileType | null>(null);

  const canContinue = useMemo(() => selected !== null, [selected]);

  const handleContinue = () => {
    if (!selected) {
      return;
    }

    navigation.navigate('SignUp', {
      profileType: selected === 'business' ? 'ESTABLISHMENT' : 'USER',
      nextSetupScreen: selected === 'business' ? 'BusinessSetup' : 'PersonalSetup',
    });
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Que tipo de conta voce quer criar?</Text>
        <Text style={styles.subtitle}>Cada tipo de conta usa um e-mail proprio.</Text>
      </View>

      <View style={styles.cardsWrapper}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          const isOtherSelected = selected !== null && !isSelected;

          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.9}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isOtherSelected && styles.cardInactive,
              ]}
              onPress={() => setSelected((prev) => (prev === option.id ? null : option.id))}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{option.icon}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>
              <View style={[styles.check, isSelected && styles.checkSelected]}>
                <Text style={styles.checkText}>{isSelected ? 'âœ“' : ''}</Text>
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
        />
        <Text style={styles.footerText}>
          Voce pode criar outra conta com um e-mail diferente a qualquer momento.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  cardsWrapper: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#1A0F05',
  },
  cardInactive: {
    opacity: 0.45,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  footer: {
    gap: spacing.md,
  },
  footerText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});

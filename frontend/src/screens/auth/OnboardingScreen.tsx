import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AsyncStorage from '@react-native-async-storage/async-storage';



import { Button } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';

const ONBOARDING_STORAGE_KEY = 'meuagito_onboarding_completo';

const SLIDES = [
  {
    id: '1',
    emoji: 'ðŸŒ†',
    title: 'Sua cidade esta viva aqui dentro',
    subtitle: 'Veja o que seus amigos estao descobrindo e compartilhando agora.',
    highlight: 'viva',
  },
  {
    id: '2',
    emoji: 'ðŸ¤',
    title: 'Compartilhe, marque e conecte',
    subtitle: 'Poste momentos, faca check-in e encontre novas recomendacoes perto de voce.',
    highlight: 'conecte',
  },
  {
    id: '3',
    emoji: 'ðŸŽ‰',
    title: 'Todo mundo sai ganhando',
    subtitle: 'Cada interacao fortalece o comercio local da sua cidade.',
    highlight: 'ganhando',
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const flatListRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    const isLastSlide = currentIndex === SLIDES.length - 1;
    if (isLastSlide) {
      void finishOnboarding();
      return;
    }

    flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderTitle = (title: string, highlight: string) => {
    const parts = title.split(highlight);

    return (
      <Text style={styles.title}>
        {parts.map((part, index) => (
          <Text key={`${part}-${index}`}>
            {part}
            {index < parts.length - 1 && <Text style={styles.highlight}>{highlight}</Text>}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => void finishOnboarding()}
              accessibilityRole="button"
            >
              <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>

            <View style={styles.hero}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            <View style={styles.textBlock}>
              {renderTitle(item.title, item.highlight)}
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.dots}>
                {SLIDES.map((slide, index) => (
                  <View
                    key={slide.id}
                    style={[styles.dot, index === currentIndex && styles.dotActive]}
                  />
                ))}
              </View>

              <Button
                label={currentIndex === SLIDES.length - 1 ? 'Fazer parte agora' : 'Proximo'}
                onPress={handleNext}
                fullWidth
                style={styles.nextButton}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: spacing.md,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  hero: {
    flex: 1,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 96,
  },
  textBlock: {
    marginBottom: spacing.xxxl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.huge,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  highlight: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  footer: {
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  nextButton: {
    marginTop: spacing.md,
  },
});

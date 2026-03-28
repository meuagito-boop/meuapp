import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

/**
 * OnboardingScreen - T02 Design Aprovado
 * 3 slides: Vida da cidade · Compartilhe e conecte · Todo mundo sai ganhando
 * Pode ser pulado em qualquer slide
 */

const SLIDES = [
  {
    id: '1',
    title: 'Sua cidade está viva aqui dentro',
    subtitle: 'Veja o que seus amigos estão descobrindo, curtindo e compartilhando agora.',
    emoji: '🌆',
    highlight: 'viva',
  },
  {
    id: '2',
    title: 'Compartilhe, marque e conecte',
    subtitle: 'Poste momentos, faça check-in e veja o que amigos estão recomendando perto de você.',
    emoji: '🤝',
    highlight: 'conecte',
  },
  {
    id: '3',
    title: 'Todo mundo sai ganhando',
    subtitle: 'Cada post, cada curtida, cada check-in move o comércio local. Você faz parte disso.',
    emoji: '🎉',
    highlight: 'ganhando',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem('meuagito_onboarding_completo', 'true');
    navigation.navigate('Login' as never);
  };

  const handleNext = () => {
    if (currentIndex === SLIDES.length - 1) {
      handleSkip();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderSlide = ({ item }: { item: (typeof SLIDES)[0] }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Botão Pular */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      {/* Área da ilustração */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      {/* Área de textos */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {item.title.split(item.highlight).map((part, i) => (
            <Text key={i}>
              {part}
              {i < item.title.split(item.highlight).length - 1 && (
                <Text style={styles.highlight}>{item.highlight}</Text>
              )}
            </Text>
          ))}
        </Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      {/* Dots e Botão */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          label={currentIndex === SLIDES.length - 1 ? 'Fazer parte agora 🚀' : 'Próximo'}
          onPress={handleNext}
          fullWidth
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
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
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emoji: {
    fontSize: 100,
  },
  textContainer: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.huge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  highlight: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    gap: spacing.lg,
  },
  dotsContainer: {
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
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});

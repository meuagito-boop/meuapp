import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapScreenWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa indisponivel no navegador</Text>
      <Text style={styles.subtitle}>
        Para testar o mapa completo, abra no app Android/iOS.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0D0D0D',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
});

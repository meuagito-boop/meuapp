import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
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

type CityState = 'initial' | 'search' | 'confirm';

const CITY_OPTIONS = ['Sao Paulo, SP', 'Santos, SP', 'Campinas, SP', 'Rio de Janeiro, RJ'];

export default function SettingsCityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [state, setState] = useState<CityState>('initial');
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [recentCities, setRecentCities] = useState<string[]>(['Santos, SP', 'Campinas, SP']);

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return CITY_OPTIONS;
    }
    return CITY_OPTIONS.filter((city) => city.toLowerCase().includes(normalizedQuery));
  }, [query]);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setState('confirm');
  };

  const handleConfirmCity = () => {
    if (!selectedCity) {
      return;
    }
    setRecentCities((prev) => {
      const next = [selectedCity, ...prev.filter((item) => item !== selectedCity)];
      return next.slice(0, 3);
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.headerButton}>
            <Text style={styles.headerButtonText}>âœ•</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trocar cidade</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {state !== 'confirm' && (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.gpsCard}
            onPress={() => handleSelectCity('Sao Paulo, SP')}
          >
            <View>
              <Text style={styles.gpsTitle}>Usar minha localizacao</Text>
              <Text style={styles.gpsSubtitle}>Detectar cidade automaticamente</Text>
            </View>
            <Text style={styles.chevron}>â€º</Text>
          </TouchableOpacity>

          <View style={styles.searchInputWrap}>
            <Text style={styles.searchIcon}>ðŸ”Ž</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome da cidade"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setState(text.length > 0 ? 'search' : 'initial');
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => {
                setQuery('');
                setState('initial');
              }}>
                <Text style={styles.clearIcon}>âœ•</Text>
              </TouchableOpacity>
            )}
          </View>

          {state === 'initial' && recentCities.length > 0 ? (
            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Buscas recentes</Text>
              {recentCities.map((city) => (
                <TouchableOpacity key={city} style={styles.listItem} onPress={() => handleSelectCity(city)}>
                  <Text style={styles.listItemIcon}>ðŸ•˜</Text>
                  <Text style={styles.listItemText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Resultados</Text>
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listItem} onPress={() => handleSelectCity(item)}>
                    <Text style={styles.listItemIcon}>ðŸ“</Text>
                    <Text style={styles.listItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      )}

      {state === 'confirm' && selectedCity && (
        <View style={styles.confirmContainer}>
          <Text style={styles.confirmTitle}>Confirmar cidade</Text>
          <Text style={styles.confirmCity}>{selectedCity}</Text>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmCity}>
            <Text style={styles.confirmButtonText}>Confirmar e atualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setState('search')} style={styles.chooseOther}>
            <Text style={styles.chooseOtherText}>Escolher outra cidade</Text>
          </TouchableOpacity>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  gpsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  gpsTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  gpsSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: fontSize.xxl,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: fontSize.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    paddingVertical: spacing.md,
  },
  clearIcon: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  listSection: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listItemIcon: {
    fontSize: fontSize.sm,
  },
  listItemText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  confirmTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  confirmCity: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  confirmButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  chooseOther: {
    paddingVertical: spacing.sm,
  },
  chooseOtherText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

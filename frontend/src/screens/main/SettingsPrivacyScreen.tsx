import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

/**
 * SettingsPrivacy - Sub-tela de Privacidade  
 * Tela 08 de T_CONFIG
 * Conta pública, mensagens, check-ins, bloqueados
 */

export default function SettingsPrivacyScreen() {
  const navigation = useNavigation<any>();
  const [publicAccount, setPublicAccount] = useState(false);
  const [messages, setMessages] = useState<'anyone' | 'following' | 'nobody'>('anyone');
  const [checkins, setCheckins] = useState<'all' | 'followers' | 'private'>('all');
  const [blockedCount, setBlockedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // Load privacy settings
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Conta Pública */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Conta Pública</Text>
          </View>
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Conta Pública</Text>
              <Text style={styles.itemSubtitle}>
                {publicAccount
                  ? 'Qualquer pessoa pode ver seu perfil'
                  : 'Apenas seguidores aprovados'}
              </Text>
            </View>
            <Switch
              value={publicAccount}
              onValueChange={setPublicAccount}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {/* Mensagens */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mensagens Diretas</Text>
          </View>
          <RadioOption
            label="Qualquer pessoa pode enviar"
            selected={messages === 'anyone'}
            onPress={() => setMessages('anyone')}
          />
          <RadioOption
            label="Só quem sigo"
            selected={messages === 'following'}
            onPress={() => setMessages('following')}
          />
          <RadioOption
            label="Ninguém"
            selected={messages === 'nobody'}
            onPress={() => setMessages('nobody')}
          />
        </View>

        {/* Check-ins */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visibilidade de Check-ins</Text>
          </View>
          <RadioOption
            label="Visíveis para todos"
            selected={checkins === 'all'}
            onPress={() => setCheckins('all')}
          />
          <RadioOption
            label="Só meus seguidores"
            selected={checkins === 'followers'}
            onPress={() => setCheckins('followers')}
          />
          <RadioOption
            label="Só eu"
            selected={checkins === 'private'}
            onPress={() => setCheckins('private')}
          />
        </View>

        {/* Bloqueados */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.item} onPress={() => navigation.push('SettingsBlockedUsers')}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Usuários Bloqueados</Text>
              <Text style={styles.itemSubtitle}>{blockedCount} usuários</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RadioOption = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Text style={styles.itemLabel}>{label}</Text>
    <View
      style={[
        styles.radioButton,
        selected && styles.radioButtonSelected,
      ]}
    >
      {selected && <View style={styles.radioButtonDot} />}
    </View>
  </TouchableOpacity>
);

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
    marginBottom: spacing.lg,
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
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
});

import React, { useState, useCallback, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@constants/colors';
import { borderRadius, spacing, typography } from '@constants/design';
import { Avatar } from '@components/Avatar';
import { Button } from '@components/Button';
import { HeaderBackButton } from '@components';
import { authStore } from '@stores/authStore';

type CreatePostRouteParams = {
  CreatePost: {
    quotedPostId?: string;
  };
};

export default function CreatePostScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<CreatePostRouteParams, 'CreatePost'>>();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const user = authStore((s) => s.user);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const charLimit = 280;
  const remaining = charLimit - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0 && !loading;

  const handlePost = useCallback(async () => {
    if (!canPost) return;
    setLoading(true);
    try {
      // TODO: integrate with feedStore.createPost({ text, quotedPostId: route.params?.quotedPostId })
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [canPost, navigation, route.params?.quotedPostId]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderBackButton
          onPress={() => navigation.goBack()}
          accessibilityLabel="Cancelar"
          style={styles.leftHeaderAction}
        />

        <Text style={styles.title}>Novo post</Text>

        <Button
          label="Publicar"
          onPress={handlePost}
          loading={loading}
          disabled={!canPost}
          size="small"
          style={styles.postBtn}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 52}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.row}>
            <Avatar
              uri={user?.avatar}
              name={user?.name ?? '?'}
              size="md"
            />
            <View style={styles.inputWrap}>
              <TextInput
                ref={inputRef}
                autoFocus
                multiline
                placeholder="O que está acontecendo?"
                placeholderTextColor={colors.textTertiary}
                style={styles.input}
                value={text}
                onChangeText={setText}
                maxLength={charLimit + 20}
              />
            </View>
          </View>

          {route.params?.quotedPostId ? (
            <View style={styles.quotedBadge}>
              <Feather name="repeat" size={13} color={colors.brand} />
              <Text style={styles.quotedText}>Citando post</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing[3]) }]}>
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.footerBtn} accessibilityRole="button" accessibilityLabel="Adicionar imagem">
              <Feather name="image" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerBtn} accessibilityRole="button" accessibilityLabel="Check-in">
              <Feather name="map-pin" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.charCount, remaining < 20 && { color: remaining < 0 ? colors.error : colors.brand }]}>
            {remaining}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
  },
  leftHeaderAction: {
    width: 70,
    alignItems: 'flex-start',
  },
  title: {
    ...typography.mdBold,
    color: colors.textPrimary,
  },
  postBtn: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  body: {
    padding: spacing[4],
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  inputWrap: {
    flex: 1,
    paddingTop: 4,
  },
  input: {
    ...typography.md,
    color: colors.textPrimary,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  quotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.brandMuted,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.2)',
  },
  quotedText: {
    ...typography.sm,
    color: colors.brand,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.bgSurface3,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  footerBtn: {
    padding: spacing[2],
  },
  charCount: {
    ...typography.sm,
    color: colors.textTertiary,
    fontWeight: '600',
  },
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@constants/colors';
import { borderRadius, spacing, typography } from '@constants/design';
import { ScreenHeader } from '@components/ScreenPrimitives';
import { Avatar } from '@components/Avatar';
import { Loading } from '@components/Loading';
import { EmptyState } from '@components/EmptyState';
import { authStore } from '@stores/authStore';

type PostDetailRouteParams = {
  PostDetail: {
    postId: string;
    autoFocus?: boolean;
  };
};

type PostDetailNavigationParams = {
  PostDetail: PostDetailRouteParams['PostDetail'];
  Profile: {
    userId: string;
  };
};

interface Comment {
  id: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
  };
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export default function PostDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PostDetailNavigationParams, 'PostDetail'>>();
  const route = useRoute<RouteProp<PostDetailRouteParams, 'PostDetail'>>();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const { postId, autoFocus } = route.params;
  const user = authStore((s) => s.user);

  const [comments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [autoFocus]);

  useEffect(() => {
    // TODO: fetch post + comments from API
    setLoading(false);
  }, [postId]);

  const handleReply = useCallback(async () => {
    if (!replyText.trim() || posting) return;
    setPosting(true);
    try {
      // TODO: integrate with API
      setReplyText('');
    } finally {
      setPosting(false);
    }
  }, [replyText, posting]);

  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScreenHeader title="Post" onBack={() => navigation.goBack()} />
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={[styles.root]}>
      <ScreenHeader title="Post" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon="message-circle"
                title="Sem respostas ainda"
                subtitle="Seja o primeiro a responder este post."
              />
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile', { userId: item.author.id })}
                style={styles.avatarWrap}
              >
                <Avatar uri={item.author.avatarUrl} name={item.author.displayName} size="sm" />
              </TouchableOpacity>
              <View style={styles.commentBody}>
                <Text style={styles.commentAuthor}>{item.author.displayName}</Text>
                <Text style={styles.commentUsername}>@{item.author.username}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: spacing[4] }}
        />

        {/* Reply composer */}
        <View style={[styles.replyBar, { paddingBottom: Math.max(insets.bottom, spacing[3]) }]}>
          <Avatar
            uri={user?.avatar}
            name={user?.name ?? '?'}
            size="xs"
          />
          <TextInput
            ref={inputRef}
            style={styles.replyInput}
            placeholder="Responder..."
            placeholderTextColor={colors.textTertiary}
            value={replyText}
            onChangeText={setReplyText}
            returnKeyType="send"
            onSubmitEditing={handleReply}
            multiline={false}
          />
          <TouchableOpacity
            onPress={handleReply}
            disabled={!replyText.trim() || posting}
            style={[styles.sendBtn, (!replyText.trim() || posting) && { opacity: 0.4 }]}
            accessibilityRole="button"
            accessibilityLabel="Enviar resposta"
          >
            <Feather name="send" size={20} color={colors.brand} />
          </TouchableOpacity>
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
  comment: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
  },
  avatarWrap: {
    paddingTop: 2,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  commentAuthor: {
    ...typography.baseSemibold,
    color: colors.textPrimary,
  },
  commentUsername: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  commentText: {
    ...typography.base,
    color: colors.textPrimary,
    marginTop: spacing[1],
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.bgSurface3,
    backgroundColor: colors.bgPrimary,
  },
  replyInput: {
    flex: 1,
    ...typography.base,
    color: colors.textPrimary,
    minHeight: 36,
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  sendBtn: {
    padding: spacing[2],
  },
});

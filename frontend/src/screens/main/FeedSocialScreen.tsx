import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@constants/colors';
import { componentSizes, fontSize, spacing } from '@constants/design';
import { feedStore, type Post } from '@stores/feedStore';

type FeedMode = 'mixed' | 'following' | 'global' | 'nearby';

const FEED_TABS: Array<{ id: FeedMode; label: string }> = [
  { id: 'mixed', label: 'Para voce' },
  { id: 'following', label: 'Seguindo' },
  { id: 'global', label: 'Global' },
  { id: 'nearby', label: 'Perto' },
];

function formatRelativeTime(value: string): string {
  const createdAt = new Date(value);
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 1000));

  if (deltaSeconds < 60) {
    return 'agora';
  }

  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) {
    return `${deltaMinutes}min`;
  }

  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}h`;
  }

  const deltaDays = Math.floor(deltaHours / 24);
  if (deltaDays < 7) {
    return `${deltaDays}d`;
  }

  return createdAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U';
}

function getPrimaryImage(post: Post): string | null {
  const images = post.imageUrls ?? post.images ?? [];
  return images[0] ?? null;
}

export default function FeedSocialScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {
    agitoPosts,
    agitoMode,
    agitoHasMore,
    isLoadingAgito,
    comments,
    error,
    getAgitoFeed,
    setAgitoMode,
    refreshAgitoFeed,
    loadMoreAgitoFeed,
    likePost,
    unlikePost,
    getComments,
    createComment,
    clearError,
  } = feedStore();

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const selectedPost = useMemo(
    () => agitoPosts.find((post) => post.id === selectedPostId) ?? null,
    [agitoPosts, selectedPostId],
  );
  const selectedComments = selectedPostId ? comments.get(selectedPostId)?.data ?? [] : [];

  useFocusEffect(
    useCallback(() => {
      if (agitoPosts.length === 0) {
        void getAgitoFeed(agitoMode, { reset: true });
      }
    }, [agitoMode, agitoPosts.length, getAgitoFeed]),
  );

  const handleRefresh = useCallback(() => {
    void refreshAgitoFeed();
  }, [refreshAgitoFeed]);

  const handleModeChange = useCallback(
    (mode: FeedMode) => {
      if (mode === agitoMode && agitoPosts.length > 0) {
        return;
      }

      clearError();
      setAgitoMode(mode);
      void getAgitoFeed(mode, { reset: true });
    },
    [agitoMode, agitoPosts.length, clearError, getAgitoFeed, setAgitoMode],
  );

  const handleToggleLike = useCallback(
    async (post: Post) => {
      if (post.isLiked) {
        await unlikePost(post.id);
        return;
      }

      await likePost(post.id);
    },
    [likePost, unlikePost],
  );

  const handleSharePost = useCallback(async (post: Post) => {
    const imageUrl = getPrimaryImage(post);
    const chunks = [post.content];

    if (post.locationName) {
      chunks.push(`Local: ${post.locationName}`);
    }

    if (imageUrl) {
      chunks.push(imageUrl);
    }

    await Share.share({
      message: chunks.filter(Boolean).join('\n'),
    });
  }, []);

  const openComments = useCallback(
    async (postId: string) => {
      setSelectedPostId(postId);
      setIsCommentModalVisible(true);
      await getComments(postId, 1, 20);
    },
    [getComments],
  );

  const closeComments = useCallback(() => {
    setIsCommentModalVisible(false);
    setSelectedPostId(null);
    setCommentDraft('');
  }, []);

  const submitComment = useCallback(async () => {
    const content = commentDraft.trim();
    if (!selectedPostId || content.length === 0 || isSubmittingComment) {
      return;
    }

    try {
      setIsSubmittingComment(true);
      await createComment(selectedPostId, content);
      setCommentDraft('');
    } finally {
      setIsSubmittingComment(false);
    }
  }, [commentDraft, createComment, isSubmittingComment, selectedPostId]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>M</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.headerActionText}>CHAT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.headerActionText}>ALERTAS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.headerActionText}>PAINEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModeTabs = () => (
    <View style={styles.modeTabs}>
      {FEED_TABS.map((tab) => {
        const isActive = tab.id === agitoMode;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.modeTab, isActive && styles.modeTabActive]}
            onPress={() => handleModeChange(tab.id)}
          >
            <Text style={[styles.modeTabText, isActive && styles.modeTabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderPostCard = ({ item }: { item: Post }) => {
    const imageUrl = getPrimaryImage(item);
    const isEstablishment = item.author.profileType === 'ESTABLISHMENT';

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={[styles.avatar, isEstablishment && styles.avatarSquare]}
            onPress={() =>
              navigation.navigate('Profile', {
                type: isEstablishment ? 'establishment' : 'user',
                userId: item.author.id,
              })
            }
          >
            {item.author.avatar ? (
              <Image source={{ uri: item.author.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{getInitials(item.author.name)}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.postMeta}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <View style={styles.metaRow}>
              {item.locationName ? <Text style={styles.locationText}>{item.locationName}</Text> : null}
              <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
          </View>
        </View>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
        ) : (
          <View style={styles.missingMediaState}>
            <Text style={styles.missingMediaText}>Midia indisponivel</Text>
          </View>
        )}

        <View style={styles.postBody}>
          <Text style={styles.captionText}>
            <Text style={styles.captionAuthor}>{item.author.name}</Text> {item.content}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => void handleToggleLike(item)}>
            <Text style={[styles.actionText, item.isLiked && styles.actionTextActive]}>
              {item.isLiked ? 'CURTIDO' : 'CURTIR'} {item.likesCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => void openComments(item.id)}>
            <Text style={styles.actionText}>COMENTAR {item.commentsCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => void handleSharePost(item)}>
            <Text style={styles.actionText}>COMPARTILHAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoadingAgito) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhum post encontrado</Text>
        <Text style={styles.emptyText}>
          {agitoMode === 'nearby'
            ? 'Ative localizacao e publique posts com local marcado para alimentar este modo.'
            : 'Este modo ainda nao retornou conteudo para a sua conta.'}
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleRefresh}>
          <Text style={styles.emptyButtonText}>Recarregar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderModeTabs()}

      {error ? (
        <TouchableOpacity style={styles.errorBanner} onPress={clearError}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={agitoPosts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContent}
        refreshControl={<RefreshControl refreshing={isLoadingAgito && agitoPosts.length === 0} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          isLoadingAgito && agitoPosts.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.footerSpacer} />
          )
        }
        onEndReachedThreshold={0.45}
        onEndReached={() => {
          if (agitoHasMore && !isLoadingAgito) {
            void loadMoreAgitoFeed();
          }
        }}
      />

      <Modal
        visible={isCommentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeComments}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <TouchableOpacity onPress={closeComments}>
                <Text style={styles.modalClose}>FECHAR</Text>
              </TouchableOpacity>
            </View>

            {selectedPost ? (
              <View style={styles.modalPostSummary}>
                <Text style={styles.modalPostAuthor}>{selectedPost.author.name}</Text>
                <Text style={styles.modalPostContent}>{selectedPost.content}</Text>
              </View>
            ) : null}

            <FlatList
              data={selectedComments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentList}
              ListEmptyComponent={
                <Text style={styles.emptyCommentsText}>Seja o primeiro a comentar este post.</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.commentCard}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{getInitials(item.author.name)}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <Text style={styles.commentAuthor}>{item.author.name}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <Text style={styles.commentMeta}>
                      {formatRelativeTime(item.createdAt)} · {item.likesCount} curtidas
                    </Text>
                  </View>
                </View>
              )}
            />

            <View style={styles.commentComposer}>
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder="Escreva um comentario"
                placeholderTextColor={colors.textTertiary}
                style={styles.commentInput}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.commentSendButton,
                  (commentDraft.trim().length === 0 || isSubmittingComment) &&
                    styles.commentSendButtonDisabled,
                ]}
                onPress={() => void submitComment()}
                disabled={commentDraft.trim().length === 0 || isSubmittingComment}
              >
                <Text style={styles.commentSendText}>
                  {isSubmittingComment ? '...' : 'ENVIAR'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoBox: {
    width: componentSizes.avatarLG,
    height: componentSizes.avatarLG,
    borderRadius: spacing.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerAction: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerActionText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  modeTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  modeTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeTabText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: colors.text,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: 'rgba(192, 57, 43, 0.18)',
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorBannerText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  feedContent: {
    paddingBottom: spacing.xxxl,
  },
  postCard: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: componentSizes.avatarMD,
    height: componentSizes.avatarMD,
    borderRadius: componentSizes.avatarMD / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarSquare: {
    borderRadius: spacing.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  postMeta: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  locationText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  timeText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  postImage: {
    width: '100%',
    height: 340,
    backgroundColor: colors.surface,
  },
  missingMediaState: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  missingMediaText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  postBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  captionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  captionAuthor: {
    color: colors.text,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.sm,
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  actionTextActive: {
    color: colors.primary,
  },
  footerLoader: {
    paddingVertical: spacing.xl,
  },
  footerSpacer: {
    height: spacing.xl,
  },
  emptyState: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.huge,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  modalSheet: {
    maxHeight: '82%',
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xxl,
    borderTopRightRadius: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  modalClose: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  modalPostSummary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.xs,
  },
  modalPostAuthor: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  modalPostContent: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  commentList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  commentCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  commentAvatar: {
    width: componentSizes.avatarSM,
    height: componentSizes.avatarSM,
    borderRadius: componentSizes.avatarSM / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentAvatarText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  commentBody: {
    flex: 1,
    gap: spacing.xs,
  },
  commentAuthor: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  commentText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  commentMeta: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  emptyCommentsText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
  commentSendButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  commentSendButtonDisabled: {
    opacity: 0.45,
  },
  commentSendText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});

import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';
import { borderRadius, spacing, typography } from '@constants/design';
import { feedStore } from '@stores/feedStore';
import { PostCard, StoriesBar, SkeletonLoader, EmptyState } from '@components';
import type { Post as FeedPost } from '@stores/feedStore';
import type { Post as PostCardPost } from '@components/PostCard';
import { isUiPreviewModeEnabled } from '@config/uiPreview';
import { previewStories } from '@dev/previewData';

type FeedMode = 'mixed' | 'following' | 'global' | 'nearby';

const FEED_TABS: { id: FeedMode; label: string }[] = [
  { id: 'mixed', label: 'Para você' },
  { id: 'following', label: 'Seguindo' },
  { id: 'global', label: 'Global' },
  { id: 'nearby', label: 'Perto' },
];

function adaptPost(p: FeedPost): PostCardPost {
  return {
    id: p.id,
    author: {
      id: p.author.id,
      displayName: p.author.name,
      username: p.author.username ?? p.author.name.toLowerCase().replace(/\s+/g, ''),
      avatarUrl: p.author.avatar ?? null,
      accountType: p.author.profileType === 'ESTABLISHMENT' ? 'ESTABLISHMENT' : 'USER',
    },
    text: p.content,
    imageUrls: p.imageUrls ?? p.images ?? [],
    type: 'post',
    createdAt: p.createdAt,
    likesCount: p.likesCount ?? 0,
    commentsCount: p.commentsCount ?? 0,
    repostsCount: p.repostsCount ?? p.sharesCount ?? 0,
    isLiked: p.isLiked ?? false,
    isOwner: false,
  };
}

export default function FeedSocialScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();

  const {
    agitoPosts,
    agitoMode,
    agitoHasMore,
    isLoadingAgito,
    error,
    getAgitoFeed,
    setAgitoMode,
    refreshAgitoFeed,
    loadMoreAgitoFeed,
    likePost,
    unlikePost,
    clearError,
  } = feedStore();

  const [activeTab, setActiveTab] = useState<FeedMode>(agitoMode ?? 'mixed');

  useFocusEffect(
    useCallback(() => {
      if (agitoPosts.length === 0) {
        void getAgitoFeed(activeTab, { reset: true });
      }
    }, [activeTab, agitoPosts.length, getAgitoFeed])
  );

  const handleTabChange = useCallback(
    (mode: FeedMode) => {
      if (mode === activeTab && agitoPosts.length > 0) return;
      setActiveTab(mode);
      clearError();
      setAgitoMode(mode);
      void getAgitoFeed(mode, { reset: true });
    },
    [activeTab, agitoPosts.length, clearError, getAgitoFeed, setAgitoMode]
  );

  const handleRefresh = useCallback(() => {
    void refreshAgitoFeed();
  }, [refreshAgitoFeed]);

  const handleLike = useCallback(
    async (_id: string, liked: boolean) => {
      if (liked) await likePost(_id);
      else await unlikePost(_id);
    },
    [likePost, unlikePost]
  );

  const renderHeader = () => (
    <View>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing[2] }]}>
        <Text style={styles.wordmark}>Meu Agito</Text>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => navigation.navigate('Chat')}
            accessibilityRole="button"
            accessibilityLabel="Mensagens"
          >
            <Feather name="message-circle" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories placeholder */}
      <StoriesBar
        stories={isUiPreviewModeEnabled() ? previewStories : []}
        onStoryPress={() => {}}
        onAddStoryPress={() => {}}
      />

      {/* Feed mode tabs */}
      <View style={styles.tabs}>
        {FEED_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => handleTabChange(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error banner */}
      {error ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={clearError}
          accessibilityRole="button"
          accessibilityLabel="Fechar erro"
        >
          <Feather name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      ) : null}

      {/* Skeleton while first load */}
      {isLoadingAgito && agitoPosts.length === 0 ? <SkeletonLoader.Feed count={3} /> : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={agitoPosts.map(adaptPost)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoadingAgito ? (
            <EmptyState
              icon="users"
              title="Nenhum post ainda"
              subtitle={
                activeTab === 'following'
                  ? 'Siga pessoas para ver o que estão postando.'
                  : activeTab === 'nearby'
                  ? 'Ative a localização para ver posts próximos.'
                  : 'Seja o primeiro a agitar esta cidade!'
              }
              actionLabel="Criar post"
              onAction={() => navigation.navigate('CreatePost')}
            />
          ) : null
        }
        ListFooterComponent={
          isLoadingAgito && agitoPosts.length > 0 ? (
            <View style={styles.footerLoader}>
              <SkeletonLoader.PostCard />
            </View>
          ) : (
            <View style={{ height: spacing[8] }} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoadingAgito && agitoPosts.length === 0}
            onRefresh={handleRefresh}
            tintColor={colors.brand}
          />
        }
        onEndReachedThreshold={0.45}
        onEndReached={() => {
          if (agitoHasMore && !isLoadingAgito) {
            void loadMoreAgitoFeed();
          }
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
  },
  wordmark: {
    ...typography.mdBold,
    color: colors.brand,
    letterSpacing: 0.3,
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  topBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
    gap: spacing[2],
  },
  tab: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.bgSurface3,
    backgroundColor: colors.bgSurface,
  },
  tabActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  tabText: {
    ...typography.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: {
    ...typography.sm,
    color: colors.error,
    flex: 1,
  },
  footerLoader: {
    paddingHorizontal: spacing[4],
  },
});

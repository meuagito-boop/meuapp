import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * FeedSocialScreen - T_AGITO Design Aprovado
 * Feed social com stories, posts infinitos, comentários aninhados
 * Posição 1 na barra de navegação
 */

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    emoji: string;
  };
  location?: string;
  timestamp: string;
  image: string;
  caption: string;
  reactions: {
    likes: number;
    dislikes: number;
    comments: number;
  };
  userReaction?: 'like' | 'dislike' | null;
  isRepost?: boolean;
  repostedBy?: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    emoji: string;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes: number;
  };
  userReaction?: 'like' | null;
  replies: Comment[];
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: { id: 'u1', name: 'Maria S.', emoji: '👩' },
    location: 'Pizzaria Do Nino',
    timestamp: '2h',
    image: '🍕',
    caption: 'Melhor pizza da cidade! Amei demais 🤤',
    reactions: { likes: 124, dislikes: 2, comments: 8 },
    comments: [
      {
        id: 'c1',
        author: { id: 'u2', name: 'João P.', emoji: '👨' },
        text: 'Que bom! Vou provar em breve!',
        timestamp: '1h',
        reactions: { likes: 5 },
        replies: [
          {
            id: 'c1r1',
            author: { id: 'u1', name: 'Maria S.', emoji: '👩' },
            text: 'Aproveita! Vai te amar 💕',
            timestamp: '40m',
            reactions: { likes: 2 },
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    author: { id: 'u3', name: 'Ana C.', emoji: '👱‍♀️' },
    timestamp: '4h',
    image: '☕',
    caption: 'Novo café abriu no bairro! ☕✨',
    reactions: { likes: 87, dislikes: 1, comments: 5 },
    isRepost: false,
    comments: [],
  },
  {
    id: '3',
    author: { id: 'u4', name: 'Pedro L.', emoji: '👨‍🦱' },
    location: 'Academia Fit',
    timestamp: '6h',
    image: '💪',
    caption: 'Check-in na academia! Nova série começando 🔥',
    reactions: { likes: 56, dislikes: 0, comments: 3 },
    isRepost: true,
    repostedBy: 'Carlos M.',
    comments: [],
  },
];

const MOCK_STORIES = [
  { id: '0', name: 'Sua história', emoji: '➕' },
  { id: '1', name: 'João Silva', emoji: '👤' },
  { id: '2', name: 'Ana Costa', emoji: '👩' },
  { id: '3', name: 'Pedro L.', emoji: '👨‍🦱' },
  { id: '4', name: 'Maria S.', emoji: '👩‍🦱' },
];

export default function FeedSocialScreen() {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [showNewBanner, setShowNewBanner] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Alternar like/dislike
  const handleReaction = useCallback(
    (postId: string, reaction: 'like' | 'dislike') => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const currentReaction = post.userReaction;
            let newReaction = reaction;

            // Se clicou na mesma reação, desfaz
            if (currentReaction === reaction) {
              newReaction = null as any;
            }

            return {
              ...post,
              userReaction: newReaction && (newReaction as 'like' | 'dislike'),
              reactions: {
                ...post.reactions,
                likes:
                  currentReaction === 'like'
                    ? post.reactions.likes - 1
                    : reaction === 'like'
                    ? post.reactions.likes + 1
                    : post.reactions.likes,
                dislikes:
                  currentReaction === 'dislike'
                    ? post.reactions.dislikes - 1
                    : reaction === 'dislike'
                    ? post.reactions.dislikes + 1
                    : post.reactions.dislikes,
              },
            };
          }
          return post;
        })
      );
    },
    []
  );

  // Header fixo
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>M</Text>
      </View>
      <TouchableOpacity>
        <Text style={styles.headerIcon}>💬</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.headerIcon}>🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.headerIcon}>⋯</Text>
      </TouchableOpacity>
    </View>
  );

  // Linha de stories fixa
  const renderStories = () => (
    <View style={styles.storiesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      >
        {MOCK_STORIES.map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyItem}>
            <View
              style={[
                styles.storyAvatar,
                story.id === '0' && styles.storyAvatarAdd,
              ]}
            >
              <Text style={styles.storyEmoji}>{story.emoji}</Text>
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
              {story.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Banner "Ver X novos"
  const renderNewBanner = () =>
    showNewBanner && (
      <TouchableOpacity
        style={styles.newBanner}
        onPress={() => setShowNewBanner(false)}
      >
        <Text style={styles.newBannerText}>↑ Ver 3 novos posts</Text>
      </TouchableOpacity>
    );

  // Card de post
  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Repost attribution */}
      {post.isRepost && (
        <View style={styles.repostBanner}>
          <Text style={styles.repostText}>↗️ Repostado por {post.repostedBy}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAuthorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorEmoji}>{post.author.emoji}</Text>
          </View>
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            {post.location && (
              <Text style={styles.postLocation}>📍 {post.location}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.postMenu}>
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Media */}
      <View style={styles.postMedia}>
        <Text style={styles.postImage}>{post.image}</Text>
      </View>

      {/* Caption */}
      <View style={styles.postCaption}>
        <Text style={styles.captionText}>{post.caption}</Text>
      </View>

      {/* Reactions bar */}
      <View style={styles.reactionsBar}>
        <TouchableOpacity
          style={[
            styles.reactionButton,
            post.userReaction === 'like' && styles.reactionButtonActive,
          ]}
          onPress={() => handleReaction(post.id, 'like')}
        >
          <Text style={styles.reactionIcon}>
            {post.userReaction === 'like' ? '👍' : '🤍'}
          </Text>
          <Text style={styles.reactionCount}>{post.reactions.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reactionButton,
            post.userReaction === 'dislike' && styles.reactionButtonActive,
          ]}
          onPress={() => handleReaction(post.id, 'dislike')}
        >
          <Text style={styles.reactionIcon}>👎</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reactionButton}
          onPress={() => {
            setSelectedPost(post);
            setShowCommentModal(true);
          }}
        >
          <Text style={styles.reactionIcon}>💬</Text>
          <Text style={styles.reactionCount}>{post.reactions.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reactionButton}>
          <Text style={styles.reactionIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      {/* Comments preview */}
      {post.comments.length > 0 && (
        <View style={styles.commentsPreview}>
          {post.comments.slice(0, 2).map((comment) => (
            <View key={comment.id} style={styles.commentPreview}>
              <Text style={styles.commentAuthor}>{comment.author.name}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
          {post.comments.length > 2 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedPost(post);
                setShowCommentModal(true);
              }}
            >
              <Text style={styles.viewMoreComments}>
                Ver mais {post.comments.length - 2} comentários
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.postDivider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderStories()}
            {renderNewBanner()}
          </>
        }
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      {/* Comment modal (simplified) */}
      <Modal
        visible={showCommentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comentários</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedPost && (
            <FlatList
              data={selectedPost.comments}
              renderItem={({ item: comment }) => (
                <View style={styles.commentFull}>
                  <View style={styles.commentAuthorAvatar}>
                    <Text style={styles.commentAuthorEmoji}>
                      {comment.author.emoji}
                    </Text>
                  </View>
                  <View style={styles.commentFullBody}>
                    <Text style={styles.commentFullAuthor}>
                      {comment.author.name}
                    </Text>
                    <Text style={styles.commentFullText}>{comment.text}</Text>
                    <Text style={styles.commentFullTime}>{comment.timestamp}</Text>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoBox: {
    width: componentSizes.avatarXL,
    height: componentSizes.avatarXL,
    borderRadius: spacing.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  headerIcon: {
    fontSize: 20,
  },

  // STORIES
  storiesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storiesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  storyItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarAdd: {
    borderColor: colors.textTertiary,
  },
  storyEmoji: {
    fontSize: 28,
  },
  storyName: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    width: 64,
  },

  // NEW BANNER
  newBanner: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  newBannerText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },

  // POST CARD
  postCard: {
    marginVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  repostBanner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  repostText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorEmoji: {
    fontSize: 24,
  },
  authorMeta: {
    gap: spacing.xs,
  },
  authorName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  postLocation: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  postMenu: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },

  postMedia: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    fontSize: 80,
  },

  postCaption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  captionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },

  reactionsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    gap: spacing.xs,
  },
  reactionButtonActive: {
    backgroundColor: colors.surface,
  },
  reactionIcon: {
    fontSize: 18,
  },
  reactionCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  commentsPreview: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  commentPreview: {
    gap: spacing.xs,
  },
  commentAuthor: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  commentText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  viewMoreComments: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },

  postDivider: {
    height: spacing.md,
  },

  // MODAL
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseIcon: {
    fontSize: 20,
    color: colors.text,
    width: 24,
  },
  modalTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },

  commentFull: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  commentAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAuthorEmoji: {
    fontSize: 20,
  },
  commentFullBody: {
    flex: 1,
    gap: spacing.xs,
  },
  commentFullAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  commentFullText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },
  commentFullTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});

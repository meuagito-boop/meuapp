import React, { memo, useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@constants/colors';
import { spacing, typography, borderRadius } from '@constants/design';
import { Avatar } from './Avatar';
import { BottomSheet } from './BottomSheet';

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function formatPostText(text: string): React.ReactNode {
  const parts = text.split(/(@\w+|#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@') || part.startsWith('#')) {
      return (
        <Text key={i} style={{ color: colors.brand }}>
          {part}
        </Text>
      );
    }
    return part;
  });
}

export interface PostAuthor {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  accountType?: 'USER' | 'ESTABLISHMENT';
  category?: string;
}

export interface PostCheckin {
  establishment: {
    id: string;
    name: string;
    neighborhood?: string;
    city?: string;
  };
}

export interface Post {
  id: string;
  author: PostAuthor;
  text?: string;
  imageUrls?: string[];
  type?: 'post' | 'checkin' | 'repost';
  checkin?: PostCheckin;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  isOwner?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (id: string, liked: boolean) => void;
  onSave?: (id: string, saved: boolean) => void;
  onRepost?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function PostCardComponent({ post, onLike, onSave, onRepost, onDelete }: PostCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [reposted, setReposted] = useState(post.isReposted ?? false);
  const [showOptions, setShowOptions] = useState(false);
  const [showRepostSheet, setShowRepostSheet] = useState(false);

  const handleLike = useCallback(() => {
    const next = !liked;
    setLiked(next);
    setLikesCount(c => next ? c + 1 : c - 1);
    onLike?.(post.id, next);
  }, [liked, onLike, post.id]);

  const handleSave = useCallback(() => {
    const next = !saved;
    setSaved(next);
    onSave?.(post.id, next);
  }, [saved, onSave, post.id]);

  const handleAuthorPress = useCallback(() => {
    if (post.author.accountType === 'ESTABLISHMENT') {
      navigation.navigate('Item', { id: post.author.id });
    } else {
      navigation.navigate('Profile', { userId: post.author.id });
    }
  }, [navigation, post.author]);

  const handlePostPress = useCallback(() => {
    navigation.navigate('PostDetail', { postId: post.id });
  }, [navigation, post.id]);

  const handleComment = useCallback(() => {
    navigation.navigate('PostDetail', { postId: post.id, autoFocus: true });
  }, [navigation, post.id]);

  const myOptions = [
    { label: 'Editar post', onPress: () => {} },
    { label: 'Fixar no perfil', onPress: () => {} },
    { label: 'Copiar link', onPress: () => {} },
    { label: 'Excluir post', onPress: () => { onDelete?.(post.id); }, destructive: true },
  ];

  const otherOptions = [
    { label: 'Salvar post', onPress: handleSave },
    { label: 'Copiar link', onPress: () => {} },
    { label: 'Não tenho interesse', onPress: () => {} },
    { label: 'Silenciar usuário', onPress: () => {} },
    { label: 'Denunciar', onPress: () => {}, destructive: true },
  ];

  const repostOptions = [
    {
      label: reposted ? 'Desfazer repost' : 'Repostar',
      onPress: () => { setReposted(v => !v); onRepost?.(post.id); },
    },
    {
      label: 'Citar post',
      onPress: () => navigation.navigate('CreatePost', { quotedPostId: post.id }),
    },
  ];

  return (
    <View style={styles.card}>
      {/* Checkin badge */}
      {post.type === 'checkin' && post.checkin && (
        <TouchableOpacity
          style={styles.checkinBadge}
          onPress={() => navigation.navigate('Item', { id: post.checkin!.establishment.id })}
          accessibilityRole="link"
        >
          <Feather name="map-pin" size={12} color={colors.brand} />
          <Text style={styles.checkinBadgeText}>
            Check-in em {post.checkin.establishment.name}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.row}>
        {/* Avatar */}
        <TouchableOpacity onPress={handleAuthorPress} style={styles.avatarWrap}>
          <Avatar uri={post.author.avatarUrl} name={post.author.displayName} size="sm" />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Author row */}
          <View style={styles.authorRow}>
            <TouchableOpacity onPress={handleAuthorPress} style={styles.authorInfo} activeOpacity={0.7}>
              <Text style={styles.displayName} numberOfLines={1}>
                {post.author.displayName}
              </Text>
              <Text style={styles.username}>
                @{post.author.username}
                {post.author.accountType === 'ESTABLISHMENT' && post.author.category
                  ? ` · ${post.author.category}`
                  : ''} · {formatRelativeTime(post.createdAt)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowOptions(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.menuBtn}
              accessibilityRole="button"
              accessibilityLabel="Opções do post"
            >
              <Feather name="more-horizontal" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Texto */}
          {post.text ? (
            <Pressable onPress={handlePostPress}>
              <Text style={styles.postText} numberOfLines={6}>
                {formatPostText(post.text)}
              </Text>
            </Pressable>
          ) : null}

          {/* Checkin card */}
          {post.type === 'checkin' && post.checkin && (
            <TouchableOpacity
              style={styles.checkinCard}
              onPress={() => navigation.navigate('Item', { id: post.checkin!.establishment.id })}
              accessibilityRole="link"
            >
              <Feather name="map-pin" size={16} color={colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkinName}>{post.checkin.establishment.name}</Text>
                {post.checkin.establishment.neighborhood ? (
                  <Text style={styles.checkinLocation}>
                    {post.checkin.establishment.neighborhood}
                    {post.checkin.establishment.city ? ` · ${post.checkin.establishment.city}` : ''}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}

          {/* Ações */}
          <View style={styles.actions}>
            <ActionButton
              icon="heart"
              count={likesCount}
              active={liked}
              activeColor={colors.likeActive}
              inactiveColor={colors.likeInactive}
              onPress={handleLike}
              accessibilityLabel={liked ? 'Descurtir' : 'Curtir'}
            />
            <ActionButton
              icon="message-circle"
              count={post.commentsCount}
              activeColor={colors.textSecondary}
              inactiveColor={colors.textSecondary}
              onPress={handleComment}
              accessibilityLabel="Comentar"
            />
            <ActionButton
              icon="repeat"
              count={post.repostsCount}
              active={reposted}
              activeColor={colors.repostActive}
              inactiveColor={colors.textSecondary}
              onPress={() => setShowRepostSheet(true)}
              accessibilityLabel="Repostar"
            />
            <ActionButton
              icon="bookmark"
              active={saved}
              activeColor={colors.saveActive}
              inactiveColor={colors.textSecondary}
              onPress={handleSave}
              accessibilityLabel={saved ? 'Remover dos salvos' : 'Salvar'}
            />
            <ActionButton
              icon="share-2"
              activeColor={colors.textSecondary}
              inactiveColor={colors.textSecondary}
              onPress={() => {}}
              accessibilityLabel="Compartilhar"
            />
          </View>
        </View>
      </View>

      <BottomSheet
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        options={post.isOwner ? myOptions : otherOptions}
      />
      <BottomSheet
        visible={showRepostSheet}
        onClose={() => setShowRepostSheet(false)}
        options={repostOptions}
      />
    </View>
  );
}

function ActionButton({
  icon,
  count,
  active = false,
  activeColor,
  inactiveColor,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Feather.glyphMap;
  count?: number;
  active?: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Feather name={icon} size={20} color={active ? activeColor : inactiveColor} />
      {count !== undefined && count > 0 ? (
        <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{count}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export const PostCard = memo(PostCardComponent);

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
  },
  checkinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing[2],
  },
  checkinBadgeText: {
    ...typography.xs,
    color: colors.brand,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  avatarWrap: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
    gap: spacing[2],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    ...typography.baseSemibold,
    color: colors.textPrimary,
  },
  username: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  menuBtn: {
    marginLeft: spacing[2],
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postText: {
    ...typography.base,
    color: colors.textPrimary,
  },
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.3)',
    marginTop: spacing[1],
  },
  checkinName: {
    ...typography.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  checkinLocation: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    marginTop: spacing[1],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'flex-start',
  },
  actionCount: {
    ...typography.sm,
  },
});

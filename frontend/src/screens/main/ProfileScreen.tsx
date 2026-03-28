import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * ProfileScreen - T_PERFIL Design Aprovado
 * Template universal para usuários e estabelecimentos
 * 5 abas: Tudo, Mídia, Depoimentos, Avaliações (estab), Serviços (estab)
 */

type ProfileType = 'user' | 'establishment';

interface ProfileData {
  id: string;
  type: ProfileType;
  name: string;
  emoji: string;
  stats: {
    followers: number;
    following?: number;
    posts?: number;
    rating?: number;
    reviews?: number;
    distance?: number;
  };
  bio: string;
  isFollowing: boolean;
  isSaved?: boolean;
}

const MOCK_USER_PROFILE: ProfileData = {
  id: '1',
  type: 'user',
  name: 'João Silva',
  emoji: '👤',
  stats: {
    followers: 1234,
    following: 567,
    posts: 89,
  },
  bio: 'Descobrindo os melhores lugares da cidade 🌆',
  isFollowing: false,
};

const MOCK_ESTABLISHMENT_PROFILE: ProfileData = {
  id: '2',
  type: 'establishment',
  name: 'Pizzaria Do Nino',
  emoji: '🍕',
  stats: {
    followers: 5432,
    rating: 4.8,
    reviews: 245,
    distance: 0.5,
  },
  bio: 'Autêntica pizza napolitana desde 2010 🇮🇹',
  isFollowing: false,
  isSaved: false,
};

const TABS = {
  user: ['Tudo', 'Mídia', 'Depoimentos'],
  establishment: ['Tudo', 'Mídia', 'Depoimentos', 'Avaliações', 'Serviços'],
};

export default function ProfileScreen() {
  const route = useRoute();
  const profileType: ProfileType = (route.params?.type as ProfileType) || 'establishment';
  const profile = profileType === 'user' ? MOCK_USER_PROFILE : MOCK_ESTABLISHMENT_PROFILE;

  const [activeTab, setActiveTab] = useState(0);
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  const [isSaved, setIsSaved] = useState(profile.isSaved || false);

  const mockPosts = [
    { id: '1', emoji: '📸', title: 'Post 1', description: 'Descrição curta' },
    { id: '2', emoji: '🎉', title: 'Post 2', description: 'Descrição curta' },
    { id: '3', emoji: '⭐', title: 'Post 3', description: 'Descrição curta' },
  ];

  const mockReviews = [
    { id: '1', author: 'Maria A.', rating: 5, text: 'Excelente! Comida deliciosa e atendimento perfeito.' },
    { id: '2', author: 'Pedro S.', rating: 4.5, text: 'Muito bom, só achei um pouco caro.' },
  ];

  const mockServices = [
    { id: '1', name: 'Dinescape de Gourmet', price: '$$$$' },
    { id: '2', name: 'Mesas Externas', price: '-' },
    { id: '3', name: 'Entrega', price: '-' },
  ];

  const tabs = TABS[profileType];

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <View
        style={[
          styles.avatar,
          profileType === 'establishment'
            ? styles.avatarSquare
            : styles.avatarCircular,
        ]}
      >
        <Text style={styles.avatarEmoji}>{profile.emoji}</Text>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileBio}>{profile.bio}</Text>

        <View style={styles.statsContainer}>
          {profileType === 'user' ? (
            <>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats.followers}</Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats.following}</Text>
                <Text style={styles.statLabel}>Seguindo</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats.followers}</Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  ⭐ {profile.stats.rating}
                </Text>
                <Text style={styles.statLabel}>{profile.stats.reviews} avaliações</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats.distance}km</Text>
                <Text style={styles.statLabel}>De você</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionsContainer}>
          {profileType === 'establishment' ? (
            <>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>☎️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>📍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>↗️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isSaved && styles.actionButtonActive,
                ]}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Text style={styles.actionButtonIcon}>{isSaved ? '💜' : '🤍'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followButtonActive,
              ]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {tabs.map((tab, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.tab, activeTab === idx && styles.tabActive]}
          onPress={() => setActiveTab(idx)}
        >
          <Text style={[styles.tabLabel, activeTab === idx && styles.tabLabelActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTudoTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={mockPosts}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.postCard}>
            <View style={styles.postImage}>
              <Text style={styles.postEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.postInfo}>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.md }}
      />
    </View>
  );

  const renderMidiaTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.gridContainer}>
        {Array.from({ length: 6 }).map((_, i) => (
          <TouchableOpacity key={i} style={styles.gridItem}>
            <Text style={styles.gridEmoji}>📸</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDepoimentosTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={Array.from({ length: 3 })}
        renderItem={() => (
          <View style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <View style={styles.testimonialAvatar}>
                <Text style={styles.testimonialAvatarEmoji}>👤</Text>
              </View>
              <View style={styles.testimonialMeta}>
                <Text style={styles.testimonialName}>Seguidor</Text>
                <Text style={styles.testimonialTime}>há 2 dias</Text>
              </View>
            </View>
            <Text style={styles.testimonialText}>
              "Adorei a experiência, tudo perfeito!"
            </Text>
          </View>
        )}
        keyExtractor={(_, i) => String(i)}
        scrollEnabled={false}
      />
    </View>
  );

  const renderAvaliacoesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.ratingSummary}>
        <Text style={styles.ratingValue}>4.8</Text>
        <Text style={styles.ratingLabel}>⭐ 245 avaliações</Text>
      </View>
      <FlatList
        data={mockReviews}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{item.author}</Text>
              <Text style={styles.reviewRating}>⭐ {item.rating}</Text>
            </View>
            <Text style={styles.reviewText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.md }}
      />
    </View>
  );

  const renderServicosTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={mockServices}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={styles.serviceDot} />
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );

  const getTabContent = () => {
    const tabName = tabs[activeTab];

    if (tabName === 'Tudo') return renderTudoTab();
    if (tabName === 'Mídia') return renderMidiaTab();
    if (tabName === 'Depoimentos') return renderDepoimentosTab();
    if (tabName === 'Avaliações') return renderAvaliacoesTab();
    if (tabName === 'Serviços') return renderServicosTab();

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        stickyHeaderIndices={[1]}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        {renderTabs()}
        {getTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: componentSizes.avatar.xlarge,
    height: componentSizes.avatar.xlarge,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircular: {
    borderRadius: componentSizes.avatar.xlarge / 2,
  },
  avatarSquare: {
    borderRadius: spacing.md,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  profileInfo: {
    gap: spacing.md,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profileBio: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
  },
  stat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  followButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    gap: spacing.md,
  },
  postImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postEmoji: {
    fontSize: 32,
  },
  postInfo: {
    flex: 1,
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  postTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  postDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridEmoji: {
    fontSize: 28,
  },
  testimonialCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialAvatarEmoji: {
    fontSize: 20,
  },
  testimonialMeta: {
    gap: spacing.xs,
  },
  testimonialName: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  testimonialTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  testimonialText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  ratingSummary: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  ratingLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewRating: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  reviewText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  serviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  serviceName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  servicePrice: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

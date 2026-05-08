import { authStore } from '@stores/authStore';
import { chatStore } from '@stores/chatStore';
import { feedStore } from '@stores/feedStore';
import { locationStore } from '@stores/locationStore';
import { userStore } from '@stores/userStore';
import {
  previewComments,
  previewConversations,
  previewEstablishments,
  previewEvents,
  previewMessages,
  previewPosts,
  previewReviews,
  previewUserAuth,
  previewUserProfile,
} from './previewData';

let hasBootstrapped = false;

const paginated = <T>(data: T[]) => ({
  data,
  total: data.length,
  page: 1,
  limit: Math.max(data.length, 1),
  totalPages: data.length > 0 ? 1 : 0,
});

export const bootstrapUiPreviewStores = (previewScreenName: string | null = null) => {
  if (hasBootstrapped) {
    return;
  }

  hasBootstrapped = true;
  const isTwoFactorPreview = previewScreenName === 'TwoFactorLogin';

  authStore.setState({
    user: previewUserAuth,
    tokens: null,
    isAuthenticated: true,
    needsOnboarding: false,
    pendingOnboardingScreen: null,
    postOnboardingTab: null,
    postOnboardingProfileParams: null,
    isLoading: false,
    error: null,
    require2FA: isTwoFactorPreview,
    tempEmail: isTwoFactorPreview ? previewUserAuth.email : null,
    tempUserId: isTwoFactorPreview ? previewUserAuth.id : null,
    tempToken: isTwoFactorPreview ? 'preview-temp-token' : null,
  });

  feedStore.setState({
    posts: previewPosts,
    agitoPosts: previewPosts,
    explorePosts: previewPosts,
    comments: new Map([
      ['preview-post-1', paginated(previewComments)],
      ['preview-post-2', paginated(previewComments.slice(0, 1))],
    ]),
    agitoMode: 'mixed',
    agitoCursor: null,
    agitoHasMore: false,
    feedPage: 1,
    explorePage: 1,
    feedHasMore: false,
    exploreHasMore: false,
    isLoadingFeed: false,
    isLoadingAgito: false,
    isLoadingExplore: false,
    error: null,
  });

  locationStore.setState({
    userLocation: {
      latitude: -23.4543,
      longitude: -46.5337,
      accuracy: 20,
    },
    events: previewEvents,
    establishments: previewEstablishments,
    eventDetails: new Map(previewEvents.map((item) => [item.id, item])),
    establishmentDetails: new Map(previewEstablishments.map((item) => [item.id, item])),
    eventReviews: new Map(previewEvents.map((item) => [item.id, paginated(previewReviews)])),
    establishmentReviews: new Map(
      previewEstablishments.map((item) => [item.id, paginated(previewReviews)]),
    ),
    favorites: ['preview-est-1'],
    isLoadingLocation: false,
    isLoadingEvents: false,
    isLoadingEstablishments: false,
    error: null,
  });

  userStore.setState({
    profile: previewUserProfile,
    followers: paginated([
      {
        ...previewUserProfile,
        id: 'preview-user-ana',
        email: 'ana@meuagito.local',
        name: 'Ana Lima',
        username: 'analima',
        isFollowing: true,
      },
    ]),
    following: paginated([
      {
        ...previewUserProfile,
        id: 'preview-user-carlos',
        email: 'carlos@meuagito.local',
        name: 'Carlos Mendes',
        username: 'cmendes_fotos',
        isFollowing: true,
      },
    ]),
    searchResults: paginated([previewUserProfile]),
    isLoading: false,
    error: null,
  });

  chatStore.setState({
    conversations: previewConversations,
    messages: new Map(Object.entries(previewMessages)),
    currentConversation: previewConversations[0],
    currentConversationMessages: previewMessages[previewConversations[0].id] || [],
    unreadCount: {
      total: 1,
      byConversation: {
        'preview-conversation-1': 1,
        'preview-conversation-2': 0,
      },
    },
    typingUsers: new Map(),
    isLoadingConversations: false,
    isLoadingMessages: false,
    isSendingMessage: false,
    error: null,
  });
};

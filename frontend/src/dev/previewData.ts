import type { NotificationItem } from '@services/api/NotificationsService';
import type { CatalogProduct } from '@services/api/CatalogService';
import type { Post as FeedPost, Comment as FeedComment } from '@stores/feedStore';
import type {
  Establishment as StoreEstablishment,
  Review as StoreReview,
} from '@stores/locationStore';
import type { Conversation, Message } from '@stores/chatStore';
import type { UserProfile } from '@stores/userStore';
import type { UserAuth } from '@stores/authStore';
import type { StoryItem } from '@components/StoriesBar';

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const previewUserAuth: UserAuth = {
  id: 'preview-user-1',
  email: 'preview@meuagito.local',
  name: 'Bruno Preview',
  avatar: undefined,
  profileType: 'USER',
};

export const previewUserProfile: UserProfile = {
  id: previewUserAuth.id,
  email: previewUserAuth.email,
  name: previewUserAuth.name,
  username: 'brunopreview',
  phoneNumber: '+55 11 99999-0000',
  bio: 'Perfil local para avaliar a nova UI do Meu Agito sem backend.',
  avatar: undefined,
  coverImage: image('photo-1517245386807-bb43f82c33c4'),
  location: 'Guarulhos, SP',
  website: 'meuagito.local',
  followersCount: 1240,
  followingCount: 318,
  postsCount: 42,
  isFollowing: false,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
};

const previewAuthors = {
  ana: {
    id: 'preview-user-ana',
    name: 'Ana Lima',
    username: 'analima',
    avatar: undefined,
    profileType: 'USER' as const,
  },
  carlos: {
    id: 'preview-user-carlos',
    name: 'Carlos Mendes',
    username: 'cmendes_fotos',
    avatar: undefined,
    profileType: 'USER' as const,
  },
  boteco: {
    id: 'preview-est-1',
    name: 'Boteco Avenida',
    username: 'botecoavenida',
    avatar: undefined,
    profileType: 'ESTABLISHMENT' as const,
  },
};

export const previewPosts: FeedPost[] = [
  {
    id: 'preview-post-1',
    content:
      'Sexta com roda de samba, comida boa e a casa cheia. Quem estiver por Guarulhos passa no Boteco Avenida hoje.',
    imageUrls: [image('photo-1519671482749-fd09be7ccebf')],
    locationName: 'Centro, Guarulhos',
    latitude: -23.4543,
    longitude: -46.5337,
    author: previewAuthors.boteco,
    likesCount: 142,
    commentsCount: 18,
    sharesCount: 7,
    repostsCount: 7,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    id: 'preview-post-2',
    content:
      'Achei uma exposicao pequena e muito boa perto da praça. Vale entrar sem pressa e depois tomar cafe ali do lado. #cultura #guarulhos',
    imageUrls: [image('photo-1519389950473-47ba0277781c')],
    locationName: 'Bosque Maia',
    latitude: -23.4598,
    longitude: -46.5281,
    author: previewAuthors.ana,
    likesCount: 89,
    commentsCount: 6,
    sharesCount: 3,
    repostsCount: 3,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'preview-post-3',
    content:
      'Alguem tem indicacao de show ao vivo neste fim de semana? Preferencia por lugares com reserva facil.',
    imageUrls: [],
    locationName: null,
    latitude: null,
    longitude: null,
    author: previewAuthors.carlos,
    likesCount: 24,
    commentsCount: 12,
    sharesCount: 1,
    repostsCount: 1,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const previewComments: FeedComment[] = [
  {
    id: 'preview-comment-1',
    content: 'Vou passar depois das 20h. Reserva ainda aberta?',
    author: {
      id: 'preview-user-ana',
      name: 'Ana Lima',
      avatar: undefined,
    },
    likesCount: 4,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'preview-comment-2',
    content: 'O som da sexta costuma ser muito bom.',
    author: {
      id: 'preview-user-carlos',
      name: 'Carlos Mendes',
      avatar: undefined,
    },
    likesCount: 2,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

export const previewEvents = [
  {
    id: 'preview-event-1',
    title: 'Samba no Boteco',
    name: 'Samba no Boteco',
    description: 'Roda de samba com entrada gratuita ate 20h e cardapio especial da casa.',
    latitude: -23.4543,
    longitude: -46.5337,
    address: 'Rua Dom Pedro II, 110 - Centro, Guarulhos',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString(),
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '23:30',
    category: 'nightlife',
    creator: previewAuthors.boteco,
    organizer: previewAuthors.boteco,
    attendeesCount: 86,
    attendees: 86,
    reviews: 12,
    rating: 4.8,
    maxAttendees: 140,
    isAttending: false,
    isPublic: true,
    image: image('photo-1501281668745-f7f57925c3b4'),
    imageUrl: image('photo-1501281668745-f7f57925c3b4'),
    distanceKm: 1.2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'preview-event-2',
    title: 'Feira Criativa do Bosque',
    name: 'Feira Criativa do Bosque',
    description: 'Moda autoral, comida de rua, fotografia e artistas locais no fim da tarde.',
    latitude: -23.4598,
    longitude: -46.5281,
    address: 'Bosque Maia - Guarulhos, SP',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 35).toISOString(),
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '21:00',
    category: 'cultural',
    creator: previewAuthors.ana,
    organizer: previewAuthors.ana,
    attendeesCount: 214,
    attendees: 214,
    reviews: 34,
    rating: 4.6,
    maxAttendees: 500,
    isAttending: true,
    isPublic: true,
    image: image('photo-1531058020387-3be344556be6'),
    imageUrl: image('photo-1531058020387-3be344556be6'),
    distanceKm: 2.6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

export const previewEstablishments: StoreEstablishment[] = [
  {
    id: 'preview-est-1',
    name: 'Boteco Avenida',
    description: 'Bar de bairro com musica ao vivo, porcoes grandes e reservas por mensagem.',
    category: 'bar',
    latitude: -23.4543,
    longitude: -46.5337,
    address: 'Rua Dom Pedro II, 110 - Centro, Guarulhos',
    phone: '+55 11 4002-8922',
    website: 'https://meuagito.local/botecoavenida',
    owner: {
      id: 'preview-owner-1',
      name: 'Marina Alves',
      avatar: undefined,
    },
    rating: 4.8,
    reviewsCount: 289,
    favoritesCount: 1040,
    isFavorited: true,
    image: image('photo-1514933651103-005eec06c04b'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
  },
  {
    id: 'preview-est-2',
    name: 'Cafe Prisma',
    description: 'Cafe, brunch e sobremesas em ambiente tranquilo para encontrar amigos.',
    category: 'cafe',
    latitude: -23.4587,
    longitude: -46.5292,
    address: 'Av. Paulo Faccini, 890 - Macedo, Guarulhos',
    phone: '+55 11 4002-8944',
    website: 'https://meuagito.local/cafeprisma',
    owner: {
      id: 'preview-owner-2',
      name: 'Rafael Costa',
      avatar: undefined,
    },
    rating: 4.7,
    reviewsCount: 173,
    favoritesCount: 612,
    isFavorited: false,
    image: image('photo-1554118811-1e0d58224f24'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  },
  {
    id: 'preview-est-3',
    name: 'Studio Flow',
    description: 'Aulas coletivas, yoga e experiencias de bem-estar no centro.',
    category: 'other',
    latitude: -23.4611,
    longitude: -46.5311,
    address: 'Rua Felicio Marcondes, 45 - Centro, Guarulhos',
    phone: '+55 11 4002-8955',
    website: 'https://meuagito.local/studioflow',
    owner: {
      id: 'preview-owner-3',
      name: 'Camila Torres',
      avatar: undefined,
    },
    rating: 4.5,
    reviewsCount: 88,
    favoritesCount: 240,
    isFavorited: false,
    image: image('photo-1544367567-0f2fcb009e0b'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
];

export const previewReviews: StoreReview[] = [
  {
    id: 'preview-review-1',
    rating: 5,
    comment: 'Atendimento rapido, som bom e porcao bem servida.',
    author: {
      id: 'preview-user-ana',
      name: 'Ana Lima',
      avatar: undefined,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'preview-review-2',
    rating: 4,
    comment: 'Lugar cheio no fim de semana, mas a experiencia compensa.',
    author: {
      id: 'preview-user-carlos',
      name: 'Carlos Mendes',
      avatar: undefined,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
  },
];

export const previewProducts: CatalogProduct[] = [
  {
    id: 'preview-product-1',
    establishmentId: 'preview-est-1',
    name: 'Combo Samba',
    description: 'Porcao mista, molho da casa e dois chopps para dividir.',
    category: 'Combos',
    price: 89.9,
    status: 'ACTIVE',
    imageUrl: image('photo-1544025162-d76694265947'),
    mainImageUrl: image('photo-1544025162-d76694265947'),
    establishment: {
      id: 'preview-est-1',
      name: 'Boteco Avenida',
    },
  },
  {
    id: 'preview-product-2',
    establishmentId: 'preview-est-1',
    name: 'Chopp da Casa',
    description: 'Caneca 500ml, servida gelada.',
    category: 'Bebidas',
    price: 14.9,
    status: 'ACTIVE',
    imageUrl: image('photo-1608270586620-248524c67de9'),
    mainImageUrl: image('photo-1608270586620-248524c67de9'),
    establishment: {
      id: 'preview-est-1',
      name: 'Boteco Avenida',
    },
  },
  {
    id: 'preview-product-3',
    establishmentId: 'preview-est-1',
    name: 'Mesa pro Samba',
    description: 'Reserva com consumo minimo para grupos de ate quatro pessoas.',
    category: 'Reservas',
    price: 120,
    status: 'ACTIVE',
    imageUrl: image('photo-1528605248644-14dd04022da1'),
    mainImageUrl: image('photo-1528605248644-14dd04022da1'),
    establishment: {
      id: 'preview-est-1',
      name: 'Boteco Avenida',
    },
  },
];

export const previewStories: StoryItem[] = [
  { id: 'preview-story-1', userId: 'preview-user-ana', username: 'Ana', seen: false },
  { id: 'preview-story-2', userId: 'preview-est-1', username: 'Boteco', seen: false },
  { id: 'preview-story-3', userId: 'preview-user-carlos', username: 'Carlos', seen: true },
];

export const previewConversations: Conversation[] = [
  {
    id: 'preview-conversation-1',
    recipient: {
      id: 'preview-user-ana',
      name: 'Ana Lima',
      avatar: undefined,
    },
    participants: [
      { id: previewUserAuth.id, name: previewUserAuth.name, avatar: undefined },
      { id: 'preview-user-ana', name: 'Ana Lima', avatar: undefined },
    ],
    lastMessage: {
      id: 'preview-message-2',
      senderId: 'preview-user-ana',
      senderName: 'Ana Lima',
      content: 'Fechado. Te encontro la as 20h.',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    unreadCount: 1,
    messagesCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'preview-conversation-2',
    recipient: {
      id: 'preview-est-1',
      name: 'Boteco Avenida',
      avatar: undefined,
    },
    participants: [
      { id: previewUserAuth.id, name: previewUserAuth.name, avatar: undefined },
      { id: 'preview-est-1', name: 'Boteco Avenida', avatar: undefined },
    ],
    lastMessage: {
      id: 'preview-message-4',
      senderId: 'preview-est-1',
      senderName: 'Boteco Avenida',
      content: 'Sua reserva esta confirmada para sexta.',
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    },
    unreadCount: 0,
    messagesCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
];

export const previewMessages: Record<string, Message[]> = {
  'preview-conversation-1': [
    {
      id: 'preview-message-1',
      conversationId: 'preview-conversation-1',
      content: 'Vai no samba hoje?',
      sender: {
        id: previewUserAuth.id,
        name: previewUserAuth.name,
        avatar: undefined,
      },
      readBy: [{ id: previewUserAuth.id }],
      isEdited: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'preview-message-2',
      conversationId: 'preview-conversation-1',
      content: 'Fechado. Te encontro la as 20h.',
      sender: {
        id: 'preview-user-ana',
        name: 'Ana Lima',
        avatar: undefined,
      },
      readBy: [],
      isEdited: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  'preview-conversation-2': [
    {
      id: 'preview-message-3',
      conversationId: 'preview-conversation-2',
      content: 'Boa tarde. Tem mesa para quatro pessoas?',
      sender: {
        id: previewUserAuth.id,
        name: previewUserAuth.name,
        avatar: undefined,
      },
      readBy: [{ id: previewUserAuth.id }],
      isEdited: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    },
    {
      id: 'preview-message-4',
      conversationId: 'preview-conversation-2',
      content: 'Sua reserva esta confirmada para sexta.',
      sender: {
        id: 'preview-est-1',
        name: 'Boteco Avenida',
        avatar: undefined,
      },
      readBy: [{ id: previewUserAuth.id }],
      isEdited: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    },
  ],
};

export const previewNotifications: NotificationItem[] = [
  {
    id: 'preview-notification-1',
    type: 'LIKE',
    title: 'Ana curtiu seu post',
    body: 'Seu post sobre o Boteco Avenida recebeu uma nova curtida.',
    entityType: 'post',
    entityId: 'preview-post-1',
    payload: { postId: 'preview-post-1' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    readAt: null,
    relatedUserId: 'preview-user-ana',
    relatedPostId: 'preview-post-1',
  },
  {
    id: 'preview-notification-2',
    type: 'MESSAGE',
    title: 'Nova mensagem',
    body: 'Boteco Avenida confirmou sua reserva.',
    entityType: 'conversation',
    entityId: 'preview-conversation-2',
    payload: { conversationId: 'preview-conversation-2' },
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    readAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    relatedUserId: 'preview-est-1',
    relatedPostId: null,
  },
];

export const previewActivityHistory = {
  checkins: [
    {
      id: 'preview-checkin-1',
      type: 'checkin' as const,
      placeId: 'preview-est-1',
      name: 'Boteco Avenida',
      meta: 'Sexta, 20h',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
  ],
  searches: [
    {
      id: 'preview-search-1',
      type: 'search' as const,
      query: 'samba hoje',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
  viewed: [
    {
      id: 'preview-viewed-1',
      type: 'viewed' as const,
      targetType: 'establishment' as const,
      targetId: 'preview-est-1',
      title: 'Boteco Avenida',
      meta: 'Bar',
      establishmentId: 'preview-est-1',
      establishmentName: 'Boteco Avenida',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
};

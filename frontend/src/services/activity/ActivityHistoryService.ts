import AsyncStorage from '@react-native-async-storage/async-storage';
import { isUiPreviewModeEnabled } from '@config/uiPreview';
import { previewActivityHistory } from '@dev/previewData';

const CHECKINS_KEY = 'meuagito_hist_checkins';
const SEARCHES_KEY = 'meuagito_hist_buscas';
const VIEWS_KEY = 'meuagito_hist_vistos';
const MAX_ITEMS_PER_SECTION = 30;

type PersistedItem = {
  id: string;
  createdAt: string;
};

export type ActivityCheckInHistoryItem = PersistedItem & {
  type: 'checkin';
  placeId: string;
  name: string;
  meta?: string;
};

export type ActivitySearchHistoryItem = PersistedItem & {
  type: 'search';
  query: string;
};

export type ActivityViewedTargetType = 'establishment' | 'product' | 'event';

export type ActivityViewedHistoryItem = PersistedItem & {
  type: 'viewed';
  targetType: ActivityViewedTargetType;
  targetId: string;
  title: string;
  meta?: string;
  establishmentId?: string;
  establishmentName?: string;
};

export type ActivityHistorySnapshot = {
  checkins: ActivityCheckInHistoryItem[];
  searches: ActivitySearchHistoryItem[];
  viewed: ActivityViewedHistoryItem[];
};

type SectionKey = typeof CHECKINS_KEY | typeof SEARCHES_KEY | typeof VIEWS_KEY;

const readList = async <T extends PersistedItem>(key: SectionKey): Promise<T[]> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string') : [];
  } catch {
    return [];
  }
};

const writeList = async <T extends PersistedItem>(key: SectionKey, items: T[]) => {
  await AsyncStorage.setItem(key, JSON.stringify(items.slice(0, MAX_ITEMS_PER_SECTION)));
};

const nowIso = () => new Date().toISOString();

class ActivityHistoryService {
  async getHistory(): Promise<ActivityHistorySnapshot> {
    if (isUiPreviewModeEnabled()) {
      return previewActivityHistory;
    }

    const [checkins, searches, viewed] = await Promise.all([
      readList<ActivityCheckInHistoryItem>(CHECKINS_KEY),
      readList<ActivitySearchHistoryItem>(SEARCHES_KEY),
      readList<ActivityViewedHistoryItem>(VIEWS_KEY),
    ]);

    return {
      checkins,
      searches,
      viewed,
    };
  }

  async recordSearch(query: string) {
    if (isUiPreviewModeEnabled()) {
      return;
    }

    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return;
    }

    const current = await readList<ActivitySearchHistoryItem>(SEARCHES_KEY);
    const nextItem: ActivitySearchHistoryItem = {
      id: `search:${normalizedQuery.toLowerCase()}`,
      type: 'search',
      query: normalizedQuery,
      createdAt: nowIso(),
    };

    await writeList(SEARCHES_KEY, [
      nextItem,
      ...current.filter((item) => item.query.toLowerCase() !== normalizedQuery.toLowerCase()),
    ]);
  }

  async recordViewed(input: Omit<ActivityViewedHistoryItem, 'id' | 'type' | 'createdAt'>) {
    if (isUiPreviewModeEnabled()) {
      return;
    }

    if (!input.targetId || !input.title.trim()) {
      return;
    }

    const current = await readList<ActivityViewedHistoryItem>(VIEWS_KEY);
    const nextItem: ActivityViewedHistoryItem = {
      ...input,
      id: `viewed:${input.targetType}:${input.targetId}`,
      type: 'viewed',
      title: input.title.trim(),
      createdAt: nowIso(),
    };

    await writeList(VIEWS_KEY, [
      nextItem,
      ...current.filter(
        (item) => !(item.targetType === input.targetType && item.targetId === input.targetId),
      ),
    ]);
  }

  async removeItems(ids: string[]) {
    if (isUiPreviewModeEnabled()) {
      return;
    }

    if (ids.length === 0) {
      return;
    }

    const selected = new Set(ids);
    const [checkins, searches, viewed] = await Promise.all([
      readList<ActivityCheckInHistoryItem>(CHECKINS_KEY),
      readList<ActivitySearchHistoryItem>(SEARCHES_KEY),
      readList<ActivityViewedHistoryItem>(VIEWS_KEY),
    ]);

    await Promise.all([
      writeList(CHECKINS_KEY, checkins.filter((item) => !selected.has(item.id))),
      writeList(SEARCHES_KEY, searches.filter((item) => !selected.has(item.id))),
      writeList(VIEWS_KEY, viewed.filter((item) => !selected.has(item.id))),
    ]);
  }
}

export const activityHistoryService = new ActivityHistoryService();
export default activityHistoryService;

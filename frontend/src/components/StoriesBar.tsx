import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@constants/colors';
import { spacing, typography } from '@constants/design';
import { Avatar } from './Avatar';

export interface StoryItem {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  seen: boolean;
  isOwn?: boolean;
}

interface StoriesBarProps {
  stories: StoryItem[];
  onStoryPress?: (story: StoryItem) => void;
  onAddStoryPress?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onStoryPress,
  onAddStoryPress,
}) => {
  const data: (StoryItem | { id: '__add__'; isAdd: true })[] = [
    { id: '__add__', isAdd: true },
    ...stories,
  ];

  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => {
        if ('isAdd' in item) {
          return (
            <TouchableOpacity
              style={styles.storyItem}
              onPress={onAddStoryPress}
              accessibilityRole="button"
              accessibilityLabel="Criar story"
            >
              <View style={styles.addRing}>
                <View style={styles.addCircle}>
                  <Feather name="plus" size={22} color={colors.textInverse} />
                </View>
              </View>
              <Text style={styles.label} numberOfLines={1}>Meu story</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            style={styles.storyItem}
            onPress={() => onStoryPress?.(item)}
            accessibilityRole="button"
            accessibilityLabel={`Story de ${item.username}`}
          >
            <View style={[styles.ring, item.seen ? styles.ringSeen : styles.ringUnseen]}>
              <Avatar uri={item.avatarUrl} name={item.username} size="sm" />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {item.isOwn ? 'Meu' : item.username}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[4],
  },
  storyItem: {
    alignItems: 'center',
    gap: spacing[1],
    width: 60,
  },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  ringUnseen: {
    borderWidth: 2,
    borderColor: colors.brand,
  },
  ringSeen: {
    borderWidth: 2,
    borderColor: colors.bgSurface3,
  },
  addRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bgSurface3,
    borderStyle: 'dashed',
  },
  addCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 56,
  },
});

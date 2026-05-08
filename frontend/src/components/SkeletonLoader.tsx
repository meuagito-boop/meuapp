import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@constants/colors';
import { borderRadius, spacing } from '@constants/design';

interface SkeletonBlockProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = 16,
  radius = borderRadius.md,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.bgSurface3, opacity },
        style,
      ]}
    />
  );
};

// Skeleton de card de post
export const PostCardSkeleton: React.FC = () => (
  <View style={styles.postCard}>
    <SkeletonBlock width={36} height={36} radius={18} />
    <View style={styles.postContent}>
      <SkeletonBlock width="60%" height={14} />
      <SkeletonBlock width="100%" height={12} style={{ marginTop: spacing[2] }} />
      <SkeletonBlock width="80%" height={12} style={{ marginTop: spacing[1] }} />
    </View>
  </View>
);

// Skeleton de lista de feed
export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </View>
);

export const SkeletonLoader = { Block: SkeletonBlock, PostCard: PostCardSkeleton, Feed: FeedSkeleton };

const styles = StyleSheet.create({
  postCard: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
  },
  postContent: {
    flex: 1,
    gap: spacing[2],
  },
});

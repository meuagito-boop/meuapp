import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@constants/colors';

export interface LoadingProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ fullScreen = false, size = 'large' }) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={colors.primary} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={colors.primary} />;
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

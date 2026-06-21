import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants';

interface Props {
  uri?: string | null;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch';
}

export default function ProductImage({ uri, style, resizeMode = 'cover' }: Props) {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View style={[styles.placeholder, style]}>
        <IonIcon name="image-outline" size={32} color={COLORS.grayMedium} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

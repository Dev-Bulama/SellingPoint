import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../../constants';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', iconName: 'bag-handle-outline', title: 'Shop Millions of Products', subtitle: 'Browse electronics, fashion, home & more from top brands' },
  { id: '2', iconName: 'car-outline', title: 'Fast & Reliable Delivery', subtitle: 'Get your orders delivered to your doorstep nationwide' },
  { id: '3', iconName: 'lock-closed-outline', title: 'Safe & Secure Payments', subtitle: 'Pay with cards, bank transfer or cash on delivery' },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Auth');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <IonIcon name={item.iconName} size={100} color={COLORS.primary} style={{ marginBottom: 32 }} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Auth')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji: { fontSize: 100, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.grayMedium, marginHorizontal: 4 },
  activeDot: { width: 24, backgroundColor: COLORS.primary },
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: SIZES.borderRadius, width: '100%', alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  skip: { color: COLORS.textSecondary, fontSize: 14 },
});

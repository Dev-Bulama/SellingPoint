import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants';

export default function MaintenanceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <IonIcon name="construct-outline" size={80} color={COLORS.primary} style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Under Maintenance</Text>
        <Text style={styles.subtitle}>
          We're making some improvements.{'\n'}Please check back shortly.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.screenPadding * 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../constants';

interface Props {
  navigation: any;
  title?: string;
  message?: string;
}

export default function GuestGate({
  navigation,
  title = 'Login Required',
  message = 'Please log in to access this feature.',
}: Props) {
  return (
    <View style={styles.container}>
      <IonIcon name="lock-closed-outline" size={64} color={COLORS.grayMedium} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
        <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: SIZES.borderRadius,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  link: { fontSize: 14, color: COLORS.textSecondary },
  linkBold: { color: COLORS.primary, fontWeight: '600' },
});

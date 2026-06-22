import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { authApi } from '../../api/auth';
import { COLORS, SIZES } from '../../constants';
import { getErrorMessage } from '../../utils/currency';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) { setError('Enter your email address'); return; }
    setError(''); setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <IonIcon name="arrow-back" size={22} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send you an OTP to reset your password.</Text>

      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>OTP sent! Check your email.</Text>
        </View>
      ) : (
        <>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input} placeholder="you@example.com"
            placeholderTextColor="#BDBDBD"
            keyboardType="email-address" autoCapitalize="none"
            value={email} onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.screenPadding, paddingTop: 60 },
  backBtn: { marginBottom: 32 },
  backText: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 32, lineHeight: 22 },
  errorBox: { backgroundColor: '#FEE', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: COLORS.danger, fontSize: 14 },
  successBox: { backgroundColor: '#E8F8EF', borderRadius: 8, padding: 16 },
  successText: { color: COLORS.success, fontSize: 15 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm,
    padding: 14, fontSize: 15, backgroundColor: COLORS.grayLight, marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 16, alignItems: 'center',
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

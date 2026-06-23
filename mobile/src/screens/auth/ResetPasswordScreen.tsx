import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { authApi } from '../../api/auth';
import { COLORS, SIZES } from '../../constants';
import { getErrorMessage } from '../../utils/currency';

export default function ResetPasswordScreen({ navigation, route }: any) {
  const { email } = route.params ?? {};
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!otp || !password || !passwordConfirmation) {
      setError('All fields are required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otp.trim(), password, passwordConfirmation);
      setSuccess(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <IonIcon name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successMessage}>
            Your password has been updated successfully. You can now log in with your new password.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {email} and choose a new password.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>OTP Code</Text>
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor="#BDBDBD"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Min. 8 characters"
            placeholderTextColor="#BDBDBD"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
            <IonIcon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat new password"
          placeholderTextColor="#BDBDBD"
          secureTextEntry={!showPassword}
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
        />

        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={isLoading}>
          {isLoading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.buttonText}>Reset Password</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendRow} onPress={() => navigation.goBack()}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Text style={styles.resendLink}>Resend OTP</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.screenPadding, paddingTop: 60 },
  backBtn: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 32, lineHeight: 22 },
  errorBox: { backgroundColor: '#FEE', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: COLORS.danger, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm,
    padding: 14, fontSize: 15, backgroundColor: COLORS.grayLight, marginBottom: 16, color: COLORS.text,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm, backgroundColor: COLORS.grayLight, marginBottom: 0 },
  eyeBtn: { paddingHorizontal: 14 },
  button: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  resendText: { color: COLORS.textSecondary, fontSize: 14 },
  resendLink: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' },
  // Success state
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.success + '18',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  successMessage: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
});

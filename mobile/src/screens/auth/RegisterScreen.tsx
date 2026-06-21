import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SIZES } from '../../constants';
import { getErrorMessage } from '../../utils/currency';

export default function RegisterScreen({ navigation }: any) {
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return; }
    if (form.password !== form.password_confirmation) { setError('Passwords do not match'); return; }
    setError('');
    try {
      await register(form);
      navigation.getParent()?.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const Field = ({ label, field, ...props }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={form[field as keyof typeof form]}
        onChangeText={(v) => update(field, v)} {...props} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join millions of shoppers on Sellingpoint</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <Field label="Full Name" field="name" placeholder="John Doe" />
        <Field label="Email Address" field="email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Phone Number" field="phone" placeholder="+234 800 000 0000" keyboardType="phone-pad" />
        <Field label="Password" field="password" placeholder="Min. 8 characters" secureTextEntry />
        <Field label="Confirm Password" field="password_confirmation" placeholder="Repeat password" secureTextEntry />

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.registerText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginLabel}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.screenPadding, paddingTop: 40 },
  backBtn: { marginBottom: 24 },
  backText: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 32 },
  errorBox: { backgroundColor: '#FEE', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: COLORS.danger, fontSize: 14 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm,
    padding: 14, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.grayLight,
  },
  registerBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 24,
  },
  registerText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  loginLabel: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' },
});

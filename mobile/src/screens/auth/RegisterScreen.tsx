import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SIZES } from '../../constants';
import { getErrorMessage } from '../../utils/currency';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
};

function Field({ label, value, onChangeText, ...props }: FieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} {...props} />
    </View>
  );
}

export default function RegisterScreen({ navigation }: any) {
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [registeredName, setRegisteredName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return; }
    if (form.password !== form.password_confirmation) { setError('Passwords do not match'); return; }
    setError('');
    try {
      const firstName = form.name.trim().split(' ')[0];
      await register(form);
      setRegisteredName(firstName);
      setShowSuccess(true);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const goShopping = () => {
    setShowSuccess(false);
    navigation.getParent()?.goBack();
  };

  const goAccount = () => {
    setShowSuccess(false);
    navigation.getParent()?.goBack();
    setTimeout(() => {
      try { navigation.navigate('AccountTab'); } catch {}
    }, 400);
  };

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IonIcon name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join millions of shoppers on Sellingpoint</Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Field label="Full Name" value={form.name} onChangeText={v => update('name', v)} placeholder="John Doe" />
          <Field label="Email Address" value={form.email} onChangeText={v => update('email', v)} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone Number" value={form.phone} onChangeText={v => update('phone', v)} placeholder="+234 800 000 0000" keyboardType="phone-pad" />
          <Field label="Password" value={form.password} onChangeText={v => update('password', v)} placeholder="Min. 8 characters" secureTextEntry />
          <Field label="Confirm Password" value={form.password_confirmation} onChangeText={v => update('password_confirmation', v)} placeholder="Repeat password" secureTextEntry />

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

      {/* Registration success modal — sits outside KeyboardAvoidingView so it renders on top */}
      <Modal visible={showSuccess} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconWrap}>
              <IonIcon name="checkmark-circle" size={52} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Welcome, {registeredName}! 🎉</Text>
            <Text style={styles.modalMessage}>
              Your account has been created successfully.{'\n'}You're now logged in and ready to shop.
            </Text>
            <TouchableOpacity style={styles.shopBtn} onPress={goShopping}>
              <IonIcon name="storefront-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn} onPress={goAccount}>
              <IonIcon name="person-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.profileBtnText}>Explore Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SIZES.screenPadding, paddingTop: 40 },
  backBtn: { marginBottom: 24 },
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
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 32,
    width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  successIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  shopBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 14, width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  shopBtnText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  profileBtn: {
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 13, width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  profileBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
});

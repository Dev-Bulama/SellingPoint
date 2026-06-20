import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { authApi } from '../../api/auth';
import { COLORS, SIZES } from '../../constants';
import { getErrorMessage } from '../../utils/currency';

export default function ChangePasswordScreen({ navigation }: any) {
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [isLoading, setIsLoading] = useState(false);
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (form.password !== form.password_confirmation) { Alert.alert('Error', 'Passwords do not match'); return; }
    setIsLoading(true);
    try {
      await authApi.changePassword(form);
      Alert.alert('Success', 'Password changed!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally { setIsLoading(false); }
  };

  const Field = ({ label, field }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} secureTextEntry value={form[field as keyof typeof form]} onChangeText={(v) => update(field, v)} placeholder="••••••••" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Field label="Current Password" field="current_password" />
        <Field label="New Password" field="password" />
        <Field label="Confirm New Password" field="password_confirmation" />
        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Update Password</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backText: { color: COLORS.primary, fontSize: 15 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  content: { padding: SIZES.screenPadding },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm, padding: 14, fontSize: 15, backgroundColor: COLORS.grayLight },
  btn: { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

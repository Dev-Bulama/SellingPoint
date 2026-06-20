import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Switch, Alert, ActivityIndicator,
} from 'react-native';
import apiClient from '../../api/client';
import { COLORS, SIZES } from '../../constants';

export default function AddAddressScreen({ navigation }: any) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postal_code: '',
    is_default: false,
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/addresses', form);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Address</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {[
          { key: 'full_name', label: 'Full Name *', placeholder: 'John Doe' },
          { key: 'phone', label: 'Phone Number *', placeholder: '+234 800 000 0000' },
          { key: 'address_line1', label: 'Address Line 1 *', placeholder: '12 Main Street' },
          { key: 'address_line2', label: 'Address Line 2', placeholder: 'Apartment, suite, etc.' },
          { key: 'city', label: 'City *', placeholder: 'Lagos' },
          { key: 'state', label: 'State *', placeholder: 'Lagos State' },
          { key: 'country', label: 'Country *', placeholder: 'Nigeria' },
          { key: 'postal_code', label: 'Postal Code', placeholder: '100001' },
        ].map(field => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              value={String(form[field.key as keyof typeof form])}
              onChangeText={v => set(field.key, v)}
              placeholderTextColor={COLORS.placeholder}
            />
          </View>
        ))}

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Set as default address</Text>
          <Switch
            value={form.is_default}
            onValueChange={v => set('is_default', v)}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnText}>Save Address</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  backText: { color: COLORS.primary, fontSize: 15 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  content: { padding: SIZES.screenPadding },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm,
    padding: 13, fontSize: 15, backgroundColor: COLORS.white, color: COLORS.text,
  },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius,
    padding: 16, marginBottom: 24,
  },
  switchLabel: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 16, alignItems: 'center',
  },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

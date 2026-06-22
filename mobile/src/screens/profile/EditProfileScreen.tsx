import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { COLORS, SIZES } from '../../constants';
import { getErrorMessage } from '../../utils/currency';
import AppAlert from '../../components/AppAlert';

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<{
    icon: string; iconColor: string; title: string; message: string;
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[];
  }>({ icon: '', iconColor: '', title: '', message: '' });

  const showAlert = (
    icon: string, iconColor: string, title: string, message: string,
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[],
  ) => {
    setAlertProps({ icon, iconColor, title, message, buttons });
    setAlertVisible(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (phone) formData.append('phone', phone);
      const res = await authApi.updateProfile(formData);
      updateUser(res.data.user);
      showAlert('checkmark-circle', COLORS.success, 'Success', 'Profile updated!', [
        { text: 'OK', style: 'primary', onPress: () => { setAlertVisible(false); navigation.goBack(); } },
      ]);
    } catch (e) {
      showAlert('close-circle', COLORS.danger, 'Error', getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <AppAlert
          visible={alertVisible}
          icon={alertProps.icon}
          iconColor={alertProps.iconColor}
          title={alertProps.title}
          message={alertProps.message}
          buttons={alertProps.buttons}
          onDismiss={() => setAlertVisible(false)}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IonIcon name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+234 800 000 0000" keyboardType="phone-pad" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={user?.email} editable={false} />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  content: { padding: SIZES.screenPadding },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm, padding: 14, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.grayLight },
  disabledInput: { backgroundColor: COLORS.grayMedium, color: COLORS.textSecondary },
  helperText: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

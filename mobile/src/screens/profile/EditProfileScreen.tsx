import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { COLORS, SIZES } from '../../constants';
import { getErrorMessage } from '../../utils/currency';
import AppAlert from '../../components/AppAlert';

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<{
    icon: string; iconColor: string; title: string; message: string;
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[];
  }>({ icon: '', iconColor: '', title: '', message: '' });

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'U';
  const displayAvatar = avatarUri || user?.avatar_url || null;

  const showAlert = (
    icon: string, iconColor: string, title: string, message: string,
    buttons?: { text: string; onPress?: () => void; style?: 'primary' | 'outline' }[],
  ) => {
    setAlertProps({ icon, iconColor, title, message, buttons });
    setAlertVisible(true);
  };

  const handlePickPhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset?.uri) setAvatarUri(asset.uri);
      },
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (phone) formData.append('phone', phone);
      if (avatarUri) {
        const filename = avatarUri.split('/').pop() ?? 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('avatar', { uri: avatarUri, name: filename, type } as any);
      }
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
          {/* Avatar picker */}
          <TouchableOpacity style={styles.avatarWrap} onPress={handlePickPhoto} activeOpacity={0.8}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <IonIcon name="camera" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor="#BDBDBD" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+234 800 000 0000" placeholderTextColor="#BDBDBD" keyboardType="phone-pad" />
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
  content: { padding: SIZES.screenPadding, alignItems: 'center' },
  avatarWrap: { marginBottom: 8, position: 'relative' },
  avatarImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: COLORS.primary },
  avatarCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 34, fontWeight: 'bold', color: COLORS.white },
  avatarEditBadge: { position: 'absolute', bottom: 2, right: 0, backgroundColor: COLORS.primary, borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
  avatarHint: { fontSize: 13, color: COLORS.textMuted, marginBottom: 24 },
  inputGroup: { marginBottom: 20, width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm, padding: 14, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.grayLight },
  disabledInput: { backgroundColor: COLORS.grayMedium, color: COLORS.textSecondary },
  helperText: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, paddingVertical: 16, alignItems: 'center', marginTop: 12, width: '100%' },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

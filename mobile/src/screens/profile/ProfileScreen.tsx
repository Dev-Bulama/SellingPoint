import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, TextInput, ActivityIndicator } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { COLORS, SIZES } from '../../constants';

const MenuItem = ({ iconName, label, onPress, color = COLORS.text, badge }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <IonIcon name={iconName} size={20} color={color} style={styles.menuIcon} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    {badge ? (
      <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{badge}</Text></View>
    ) : (
      <IonIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError('Please enter your password'); return; }
    setDeletingAccount(true);
    setDeleteError('');
    try {
      await authApi.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      logout();
    } catch (e: any) {
      setDeleteError(e?.response?.data?.message ?? 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header / Avatar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.85}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <IonIcon name="camera" size={12} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuGroup}>
          <MenuItem iconName="create-outline" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem iconName="lock-closed-outline" label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
          <MenuItem iconName="location-outline" label="Manage Addresses" onPress={() => navigation.navigate('Addresses')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <View style={styles.menuGroup}>
          <MenuItem iconName="cube-outline" label="My Orders" onPress={() => navigation.navigate('Orders')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <View style={styles.menuGroup}>
          <MenuItem iconName="headset-outline" label="Contact Support" onPress={() => navigation.navigate('Support')} />
          <MenuItem iconName="help-circle-outline" label="FAQ" onPress={() => navigation.navigate('FAQ')} />
          <MenuItem iconName="document-text-outline" label="Terms & Conditions" onPress={() => navigation.navigate('Page', { slug: 'terms-and-conditions', title: 'Terms & Conditions' })} />
          <MenuItem iconName="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('Page', { slug: 'privacy-policy', title: 'Privacy Policy' })} />
          <MenuItem iconName="information-circle-outline" label="About Us" onPress={() => navigation.navigate('Page', { slug: 'about-us', title: 'About Us' })} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuGroup}>
          <MenuItem iconName="log-out-outline" label="Logout" onPress={() => setShowLogoutModal(true)} color={COLORS.danger} />
          <MenuItem iconName="trash-outline" label="Delete Account" onPress={() => { setDeletePassword(''); setDeleteError(''); setShowDeleteModal(true); }} color={COLORS.danger} />
        </View>
      </View>

      <Text style={styles.version}>Sellingpoint v1.0.0</Text>
      <View style={{ height: 32 }} />

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, { backgroundColor: COLORS.danger + '15' }]}>
              <IonIcon name="trash-outline" size={32} color={COLORS.danger} />
            </View>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalMessage}>
              This is permanent. All your data will be deleted and this action cannot be undone. Please enter your password to confirm.
            </Text>
            <TextInput
              style={styles.deleteInput}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.placeholder}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            {deleteError ? <Text style={styles.deleteError}>{deleteError}</Text> : null}
            <TouchableOpacity
              style={[styles.modalLogoutBtn, { backgroundColor: COLORS.danger }]}
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.modalLogoutText}>Yes, Delete My Account</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <IonIcon name="log-out-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout of your account?</Text>
            <TouchableOpacity style={styles.modalLogoutBtn} onPress={() => { setShowLogoutModal(false); logout(); }}>
              <Text style={styles.modalLogoutText}>Yes, Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowLogoutModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    alignItems: 'center', backgroundColor: COLORS.white,
    paddingTop: 56, paddingBottom: 28, paddingHorizontal: SIZES.screenPadding,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: COLORS.primary, marginBottom: 12,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  avatarEditBadge: {
    position: 'absolute', bottom: 14, right: 0,
    backgroundColor: COLORS.primary, borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white,
  },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  userEmail: { fontSize: 14, color: COLORS.textSecondary },
  userPhone: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  section: { marginTop: 16, paddingHorizontal: SIZES.screenPadding },
  sectionTitle: { fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  menuGroup: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, overflow: 'hidden', elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  menuIcon: { marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15 },
  menuBadge: { backgroundColor: COLORS.danger, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  menuBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 28,
    width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
  },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  modalMessage: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalLogoutBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  modalLogoutText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  modalCancelBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadius, paddingVertical: 13, width: '100%', alignItems: 'center' },
  modalCancelText: { color: COLORS.text, fontSize: 15 },
  deleteInput: {
    width: '100%', borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm,
    padding: 13, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.grayLight, marginBottom: 8,
  },
  deleteError: { color: COLORS.danger, fontSize: 13, marginBottom: 12, alignSelf: 'flex-start' },
});

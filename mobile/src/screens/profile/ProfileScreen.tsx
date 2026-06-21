import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SIZES } from '../../constants';

const MenuItem = ({ iconName, label, onPress, color = COLORS.text }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <IonIcon name={iconName} size={20} color={color} style={styles.menuIcon} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    <IonIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
        </View>
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
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuGroup}>
          <MenuItem iconName="help-circle-outline" label="FAQ" onPress={() => navigation.navigate('FAQ')} />
          <MenuItem iconName="document-text-outline" label="Terms & Conditions" onPress={() => navigation.navigate('Page', { slug: 'terms-and-conditions', title: 'Terms & Conditions' })} />
          <MenuItem iconName="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('Page', { slug: 'privacy-policy', title: 'Privacy Policy' })} />
          <MenuItem iconName="information-circle-outline" label="About Us" onPress={() => navigation.navigate('Page', { slug: 'about-us', title: 'About Us' })} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuGroup}>
          <MenuItem iconName="log-out-outline" label="Logout" onPress={() => setShowLogoutModal(true)} color={COLORS.danger} />
        </View>
      </View>

      <Text style={styles.version}>Sellingpoint v1.0.0</Text>
      <View style={{ height: 32 }} />

      {/* ── Logout Modal ── */}
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
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  userEmail: { fontSize: 14, color: COLORS.textSecondary },
  userPhone: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  section: { marginTop: 16, paddingHorizontal: SIZES.screenPadding },
  sectionTitle: { fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  menuGroup: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, overflow: 'hidden', elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  menuIcon: { marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15 },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 24 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 28,
    width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  modalMessage: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalLogoutBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalLogoutText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  modalCancelBtn: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadius,
    paddingVertical: 13, width: '100%', alignItems: 'center',
  },
  modalCancelText: { color: COLORS.text, fontSize: 15 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

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
          <MenuItem iconName="log-out-outline" label="Logout" onPress={handleLogout} color={COLORS.danger} />
        </View>
      </View>

      <Text style={styles.version}>Sellingpoint v1.0.0</Text>
      <View style={{ height: 32 }} />
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
});

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import apiClient from '../../api/client';
import { Address } from '../../types';
import { COLORS, SIZES } from '../../constants';

export default function AddressesScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiClient.get('/addresses');
      setAddresses(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Address', 'Remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await apiClient.delete(`/addresses/${id}`);
        setAddresses(prev => prev.filter(a => a.id !== id));
      }},
    ]);
  };

  const setDefault = async (id: number) => {
    await apiClient.post(`/addresses/${id}/set-default`);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><IonIcon name="arrow-back" size={22} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}><Text style={styles.addText}>+ Add</Text></TouchableOpacity>
      </View>
      <FlatList
        data={addresses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: SIZES.screenPadding }}
        renderItem={({ item }) => (
          <View style={[styles.card, item.is_default && styles.defaultCard]}>
            {item.is_default && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>}
            <Text style={styles.addressName}>{item.full_name}</Text>
            <Text style={styles.addressPhone}>{item.phone}</Text>
            <Text style={styles.addressText}>{item.address_line1}</Text>
            <Text style={styles.addressText}>{item.city}, {item.state}, {item.country}</Text>
            <View style={styles.cardActions}>
              {!item.is_default && (
                <TouchableOpacity onPress={() => setDefault(item.id)} style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, styles.deleteBtn]}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IonIcon name="location-outline" size={64} color={COLORS.textMuted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <TouchableOpacity style={styles.addAddrBtn} onPress={() => navigation.navigate('AddAddress')}>
              <Text style={styles.addAddrBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16, backgroundColor: COLORS.white },
  backText: { color: COLORS.primary, fontSize: 15 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  addText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, padding: 16, marginBottom: 12, elevation: 1, borderWidth: 1, borderColor: COLORS.border },
  defaultCard: { borderColor: COLORS.primary, borderWidth: 2 },
  defaultBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  defaultBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  addressName: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 2 },
  addressPhone: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  addressText: { fontSize: 13, color: COLORS.textSecondary },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary },
  actionBtnText: { color: COLORS.primary, fontSize: 13 },
  deleteBtn: { borderColor: COLORS.danger },
  deleteBtnText: { color: COLORS.danger, fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  addAddrBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: SIZES.borderRadius },
  addAddrBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
});

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Switch, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import apiClient from '../../api/client';
import { COLORS, SIZES } from '../../constants';
import AppAlert from '../../components/AppAlert';

const COUNTRIES = ['Nigeria'];

const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const STATE_CITIES: Record<string, string[]> = {
  Lagos: ['Ikeja', 'Lagos Island', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba', 'Ikorodu', 'Badagry', 'Epe', 'Apapa', 'Agege', 'Mushin', 'Oshodi'],
  Abuja: ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Nyanya', 'Karu', 'Kubwa'],
  FCT: ['Abuja', 'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Nyanya', 'Karu', 'Kubwa'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Ikwerre', 'Etche'],
  Kano: ['Kano', 'Dala', 'Fagge', 'Gwale', 'Kumbotso', 'Nasarawa', 'Tarauni'],
  Oyo: ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki'],
  Kaduna: ['Kaduna', 'Kafanchan', 'Zaria'],
  Delta: ['Asaba', 'Warri', 'Sapele', 'Agbor', 'Ughelli'],
  Anambra: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'],
  Enugu: ['Enugu', 'Nsukka', 'Agbani', 'Oji River'],
  Edo: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi'],
  Imo: ['Owerri', 'Orlu', 'Okigwe', 'Oguta'],
  Abia: ['Umuahia', 'Aba', 'Ohafia'],
  Akwa_Ibom: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'],
  Bauchi: ['Bauchi', 'Azare', 'Misau', 'Ningi'],
  Borno: ['Maiduguri', 'Biu', 'Kukawa'],
  Cross_River: ['Calabar', 'Obudu', 'Ogoja', 'Ikom'],
  Osun: ['Osogbo', 'Ife', 'Ilesa', 'Iwo'],
  Ogun: ['Abeokuta', 'Sagamu', 'Ijebu-Ode', 'Ota'],
  Kwara: ['Ilorin', 'Offa', 'Omu-Aran'],
  Ekiti: ['Ado-Ekiti', 'Ikere-Ekiti', 'Emure-Ekiti'],
  Niger: ['Minna', 'Bida', 'Suleja', 'Kontagora'],
  Kogi: ['Lokoja', 'Okene', 'Kabba', 'Idah'],
  Plateau: ['Jos', 'Bukuru', 'Shendam'],
  Sokoto: ['Sokoto', 'Birnin Kebbi', 'Tambuwal'],
  Kebbi: ['Birnin Kebbi', 'Argungu', 'Yauri'],
  Zamfara: ['Gusau', 'Kaura Namoda', 'Talata Mafara'],
  Yobe: ['Damaturu', 'Potiskum', 'Gashua'],
  Taraba: ['Jalingo', 'Wukari', 'Bali'],
  Adamawa: ['Yola', 'Mubi', 'Numan'],
  Gombe: ['Gombe', 'Kaltungo', 'Deba'],
  Bayelsa: ['Yenagoa', 'Brass', 'Nembe'],
  Nasarawa: ['Lafia', 'Keffi', 'Akwanga'],
  Ebonyi: ['Abakaliki', 'Afikpo', 'Ezza'],
  Jigawa: ['Dutse', 'Hadejia', 'Birnin Kudu'],
  Katsina: ['Katsina', 'Daura', 'Funtua'],
  Benue: ['Makurdi', 'Gboko', 'Otukpo'],
};

function getCitiesForState(state: string): string[] {
  const key = state.replace(/\s+/g, '_') as keyof typeof STATE_CITIES;
  return STATE_CITIES[key] ?? STATE_CITIES[state] ?? [];
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}

function PickerModal({ visible, title, options, selected, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.sheetHeader}>
          <Text style={pickerStyles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><IonIcon name="close" size={22} color={COLORS.text} /></TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[pickerStyles.option, item === selected && pickerStyles.selectedOption]}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={[pickerStyles.optionText, item === selected && pickerStyles.selectedOptionText]}>{item}</Text>
              {item === selected && <IonIcon name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  selectedOption: { backgroundColor: COLORS.primary + '10' },
  optionText: { fontSize: 15, color: COLORS.text },
  selectedOptionText: { color: COLORS.primary, fontWeight: '600' },
});

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
  const [picker, setPicker] = useState<'country' | 'state' | 'city' | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<{
    icon: string; iconColor: string; title: string; message: string;
  }>({ icon: '', iconColor: '', title: '', message: '' });

  const showAlert = (icon: string, iconColor: string, title: string, message: string) => {
    setAlertProps({ icon, iconColor, title, message });
    setAlertVisible(true);
  };

  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state) {
      showAlert('alert-circle', COLORS.warning, 'Required Fields', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/addresses', form);
      navigation.goBack();
    } catch (e: any) {
      showAlert('close-circle', COLORS.danger, 'Error', e?.response?.data?.message ?? 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const cities = getCitiesForState(form.state);

  return (
    <View style={styles.container}>
      <AppAlert
        visible={alertVisible}
        icon={alertProps.icon}
        iconColor={alertProps.iconColor}
        title={alertProps.title}
        message={alertProps.message}
        onDismiss={() => setAlertVisible(false)}
      />

      <PickerModal
        visible={picker === 'country'}
        title="Select Country"
        options={COUNTRIES}
        selected={form.country}
        onSelect={v => { set('country', v); set('state', ''); set('city', ''); }}
        onClose={() => setPicker(null)}
      />
      <PickerModal
        visible={picker === 'state'}
        title="Select State"
        options={NIGERIA_STATES}
        selected={form.state}
        onSelect={v => { set('state', v); set('city', ''); }}
        onClose={() => setPicker(null)}
      />
      <PickerModal
        visible={picker === 'city'}
        title="Select City"
        options={cities}
        selected={form.city}
        onSelect={v => set('city', v)}
        onClose={() => setPicker(null)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
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

        {/* Country */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country *</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setPicker('country')}>
            <Text style={[styles.dropdownText, !form.country && styles.placeholder]}>{form.country || 'Select Country'}</Text>
            <IonIcon name="chevron-down" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* State */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>State *</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setPicker('state')}>
            <Text style={[styles.dropdownText, !form.state && styles.placeholder]}>{form.state || 'Select State'}</Text>
            <IonIcon name="chevron-down" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* City */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          {cities.length > 0 ? (
            <TouchableOpacity
              style={[styles.dropdown, !form.state && styles.dropdownDisabled]}
              onPress={() => form.state && setPicker('city')}
            >
              <Text style={[styles.dropdownText, !form.city && styles.placeholder]}>{form.city || (form.state ? 'Select City' : 'Select a state first')}</Text>
              <IonIcon name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter your city"
              value={form.city}
              onChangeText={v => set('city', v)}
              placeholderTextColor={COLORS.placeholder}
            />
          )}
        </View>

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
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  content: { padding: SIZES.screenPadding },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm,
    padding: 13, fontSize: 15, backgroundColor: COLORS.white, color: COLORS.text,
  },
  dropdown: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm,
    padding: 13, backgroundColor: COLORS.white, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  dropdownDisabled: { backgroundColor: COLORS.grayLight },
  dropdownText: { fontSize: 15, color: COLORS.text, flex: 1 },
  placeholder: { color: COLORS.placeholder },
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

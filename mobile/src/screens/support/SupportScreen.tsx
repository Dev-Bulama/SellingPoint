import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../api/client';
import { COLORS, SIZES } from '../../constants';

interface CmsSettings {
  whatsapp_number?: string;
  support_email?: string;
  business_hours?: string;
}

const ISSUE_TYPES = [
  'Order Issue',
  'Payment Problem',
  'Delivery Delay',
  'Wrong Item Received',
  'Damaged Item',
  'Refund Request',
  'Account Issue',
  'App Bug',
  'Other',
];

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (issueType: string, description: string) => void;
  submitting: boolean;
}

function ReportIssueModal({ visible, onClose, onSubmit, submitting }: ReportIssueModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Select Issue Type', 'Please select an issue type before submitting.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Describe your issue', 'Please provide a description of at least 10 characters.');
      return;
    }
    onSubmit(selectedType, description.trim());
  };

  const handleClose = () => {
    setSelectedType('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Report an Issue</Text>
          <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalSectionLabel}>Issue Type</Text>
          <View style={styles.issueTypeGrid}>
            {ISSUE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.issueTypeChip,
                  selectedType === type && styles.issueTypeChipSelected,
                ]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.issueTypeChipText,
                    selectedType === type && styles.issueTypeChipTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalSectionLabel}>Describe Your Issue</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Please describe your issue in detail so we can help you faster..."
            placeholderTextColor={COLORS.placeholder}
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length} characters</Text>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: SIZES.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, title, subtitle, onPress, rightElement }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ?? <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SupportScreen({ navigation }: any) {
  const [settings, setSettings] = useState<CmsSettings>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await apiClient.get('/cms/settings');
      const data = res.data?.data ?? res.data ?? {};
      setSettings(data);
    } catch {
      // Use defaults silently
    } finally {
      setSettingsLoading(false);
    }
  };

  const openWhatsApp = async () => {
    const phone = settings.whatsapp_number ?? '';
    if (!phone) {
      Alert.alert('Unavailable', 'WhatsApp support is not configured yet.');
      return;
    }
    const cleaned = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleaned}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature.');
      }
    } catch {
      Alert.alert('Error', 'Could not open WhatsApp. Please try again.');
    }
  };

  const openEmail = async () => {
    const email = settings.support_email ?? 'support@sellingpoint.com';
    const url = `mailto:${email}?subject=Support%20Request`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', `Could not open email client. Please email us at ${email}`);
    }
  };

  const handleSubmitReport = async (issueType: string, description: string) => {
    setSubmittingReport(true);
    try {
      await apiClient.post('/support/issues', { issue_type: issueType, description });
      setShowReportModal(false);
      Alert.alert(
        'Report Submitted',
        'Thank you! Our team will review your issue and get back to you shortly.',
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Submission Failed', 'We could not submit your report. Please try again or contact us via email.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const businessHours = settings.business_hours ?? 'Mon–Fri, 9 AM – 6 PM WAT';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroIcon}>🎧</Text>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSubtitle}>Contact us anytime</Text>
          {settingsLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" style={{ marginTop: SIZES.xs }} />
          ) : (
            <Text style={styles.businessHours}>{businessHours}</Text>
          )}
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="💬"
              title="WhatsApp Support"
              subtitle={
                settings.whatsapp_number
                  ? `Chat on ${settings.whatsapp_number}`
                  : 'Chat with our team'
              }
              onPress={openWhatsApp}
            />
            <View style={styles.separator} />
            <MenuItem
              icon="📧"
              title="Email Support"
              subtitle={settings.support_email ?? 'support@sellingpoint.com'}
              onPress={openEmail}
            />
          </View>
        </View>

        {/* Self-Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Self-Service</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="❓"
              title="FAQ"
              subtitle="Find answers to common questions"
              onPress={() => navigation.navigate('FAQ')}
            />
            <View style={styles.separator} />
            <MenuItem
              icon="🐛"
              title="Report an Issue"
              subtitle="Tell us what went wrong"
              onPress={() => setShowReportModal(true)}
            />
          </View>
        </View>

        {/* Response Time Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>⏱️</Text>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Typical Response Time</Text>
            <Text style={styles.noticeText}>
              WhatsApp: Under 2 hours{'\n'}
              Email: Within 24 hours{'\n'}
              Issue reports: Within 48 hours
            </Text>
          </View>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>

      <ReportIssueModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitReport}
        submitting={submittingReport}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: COLORS.text, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  headerSpacer: { width: 36 },
  heroBanner: {
    backgroundColor: COLORS.primary,
    padding: SIZES.xl,
    alignItems: 'center',
    paddingBottom: SIZES.xxl,
  },
  heroIcon: { fontSize: 48, marginBottom: SIZES.sm },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  businessHours: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  section: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: SIZES.base,
    paddingBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SIZES.sm,
  },
  menuGroup: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.base,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  menuIcon: { fontSize: 18 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  menuArrow: { fontSize: 20, color: COLORS.textMuted },
  separator: { height: 1, backgroundColor: COLORS.divider, marginLeft: 68 },
  noticeCard: {
    flexDirection: 'row',
    margin: SIZES.screenPadding,
    backgroundColor: '#EFF8FF',
    borderRadius: SIZES.borderRadius,
    padding: SIZES.base,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  noticeIcon: { fontSize: 22, marginRight: SIZES.sm },
  noticeContent: { flex: 1 },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: COLORS.info, marginBottom: 4 },
  noticeText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  // Modal styles
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalCloseButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  modalCloseIcon: { fontSize: 16, color: COLORS.grayDark, fontWeight: '600' },
  modalScroll: { flex: 1, padding: SIZES.screenPadding },
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.base,
    marginBottom: SIZES.sm,
  },
  issueTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.base },
  issueTypeChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadiusLg,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs + 2,
    backgroundColor: COLORS.white,
  },
  issueTypeChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF3E0',
  },
  issueTypeChipText: { fontSize: 13, color: COLORS.textSecondary },
  issueTypeChipTextSelected: { color: COLORS.primary, fontWeight: '600' },
  descriptionInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.sm,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 120,
    lineHeight: 20,
  },
  charCount: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginTop: 4, marginBottom: SIZES.xl },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

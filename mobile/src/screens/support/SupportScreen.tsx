import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import apiClient from '../../api/client';
import { COLORS, SIZES } from '../../constants';
import AppAlert from '../../components/AppAlert';

interface CmsSettings {
  whatsapp_number?: string;
  support_email?: string;
  business_hours?: string;
  support_chat_script?: string;
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
  const [localAlertVisible, setLocalAlertVisible] = useState(false);
  const [localAlertProps, setLocalAlertProps] = useState({ icon: '', iconColor: '', title: '', message: '' });

  const showLocalAlert = (icon: string, iconColor: string, title: string, message: string) => {
    setLocalAlertProps({ icon, iconColor, title, message });
    setLocalAlertVisible(true);
  };

  const handleSubmit = () => {
    if (!selectedType) {
      showLocalAlert('alert-circle', COLORS.warning, 'Select Issue Type', 'Please select an issue type before submitting.');
      return;
    }
    if (description.trim().length < 10) {
      showLocalAlert('alert-circle', COLORS.warning, 'Describe Your Issue', 'Please provide a description of at least 10 characters.');
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
        <AppAlert
          visible={localAlertVisible}
          icon={localAlertProps.icon}
          iconColor={localAlertProps.iconColor}
          title={localAlertProps.title}
          message={localAlertProps.message}
          onDismiss={() => setLocalAlertVisible(false)}
        />
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Report an Issue</Text>
          <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
            <IonIcon name="close" size={20} color={COLORS.grayDark} />
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
            placeholderTextColor="#BDBDBD"
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
  iconName: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
}

function MenuItem({ iconName, iconColor, title, subtitle, onPress, rightElement }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        <IonIcon name={iconName} size={20} color={iconColor ?? COLORS.text} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ?? <IonIcon name="chevron-forward" size={18} color={COLORS.textMuted} />}
    </TouchableOpacity>
  );
}

export default function SupportScreen({ navigation }: any) {
  const [settings, setSettings] = useState<CmsSettings>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<{
    icon: string; iconColor: string; title: string; message: string;
  }>({ icon: '', iconColor: '', title: '', message: '' });

  const showAlert = (icon: string, iconColor: string, title: string, message: string) => {
    setAlertProps({ icon, iconColor, title, message });
    setAlertVisible(true);
  };

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
    } finally {
      setSettingsLoading(false);
    }
  };

  const openWhatsApp = async () => {
    const phone = settings.whatsapp_number ?? '';
    if (!phone) {
      showAlert('information-circle', COLORS.primary, 'Unavailable', 'WhatsApp support is not configured yet.');
      return;
    }
    const cleaned = phone.replace(/\D/g, '');
    // Use wa.me — opens WhatsApp if installed, falls back to web.whatsapp.com in browser
    await Linking.openURL(`https://wa.me/${cleaned}`).catch(() => {
      showAlert('close-circle', COLORS.danger, 'Error', 'Could not open WhatsApp. Please try again.');
    });
  };

  const openEmail = async () => {
    const email = settings.support_email ?? 'support@sellingpoint.com';
    const url = `mailto:${email}?subject=Support%20Request`;
    try {
      await Linking.openURL(url);
    } catch {
      showAlert('mail-outline', COLORS.primary, 'Error', `Could not open email client. Please email us at ${email}`);
    }
  };

  const handleSubmitReport = async (issueType: string, description: string) => {
    setSubmittingReport(true);
    try {
      await apiClient.post('/support/issues', { issue_type: issueType, description });
      setShowReportModal(false);
      showAlert('checkmark-circle', COLORS.success, 'Report Submitted', 'Thank you! Our team will review your issue and get back to you shortly.');
    } catch {
      showAlert('close-circle', COLORS.danger, 'Submission Failed', 'We could not submit your report. Please try again or contact us via email.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const businessHours = settings.business_hours ?? 'Mon–Fri, 9 AM – 6 PM WAT';
  const chatScript = settings.support_chat_script ?? '';

  // Extract the script's origin domain to use as baseUrl so the widget's
  // API calls are not blocked by same-origin restrictions in the WebView.
  const chatBaseUrl = useMemo(() => {
    if (!chatScript) return '';
    const m = chatScript.match(/src=["'](https?:\/\/[^/"']+)/i);
    return m ? m[1] : '';
  }, [chatScript]);

  const chatHtml = chatScript
    ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;height:100%;background:#fff;}</style></head><body>${chatScript}</body></html>`
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <AppAlert
        visible={alertVisible}
        icon={alertProps.icon}
        iconColor={alertProps.iconColor}
        title={alertProps.title}
        message={alertProps.message}
        onDismiss={() => setAlertVisible(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <IonIcon name="headset-outline" size={48} color={COLORS.white} style={{ marginBottom: SIZES.sm }} />
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
              iconName="logo-whatsapp"
              iconColor="#25D366"
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
              iconName="mail-outline"
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
              iconName="alert-circle-outline"
              title="Report an Issue"
              subtitle="Tell us what went wrong"
              onPress={() => setShowReportModal(true)}
            />
          </View>
        </View>

        {/* Response Time Notice */}
        <View style={styles.noticeCard}>
          <IonIcon name="time-outline" size={22} color={COLORS.info} style={{ marginRight: SIZES.sm }} />
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

      {/* Live Chat FAB — only shown when a chat script is configured */}
      {!!chatScript && !showReportModal && (
        <TouchableOpacity style={styles.chatFab} onPress={() => setShowChatModal(true)} activeOpacity={0.85}>
          <IonIcon name="chatbubbles-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}

      {/* Chatbot modal — full screen WebView above the bottom nav */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChatModal(false)}
      >
        <SafeAreaView style={styles.chatModalContainer} edges={['top']}>
          <View style={styles.chatModalHeader}>
            <Text style={styles.chatModalTitle}>Live Chat</Text>
            <TouchableOpacity onPress={() => setShowChatModal(false)} style={styles.chatModalClose}>
              <IonIcon name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: chatHtml, baseUrl: chatBaseUrl || 'about:blank' }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            mixedContentMode="always"
            allowFileAccess
            allowUniversalAccessFromFileURLs
            onShouldStartLoadWithRequest={(req) => {
              if (req.navigationType === 'click' && req.url !== 'about:blank') {
                Linking.openURL(req.url).catch(() => {});
                return false;
              }
              return true;
            }}
          />
        </SafeAreaView>
      </Modal>
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  headerSpacer: { width: 36 },
  heroBanner: {
    backgroundColor: COLORS.primary,
    padding: SIZES.xl,
    alignItems: 'center',
    paddingBottom: SIZES.xxl,
  },
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
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
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
  // Live chat
  chatFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  chatModalContainer: { flex: 1, backgroundColor: COLORS.white },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chatModalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.text },
  chatModalClose: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});

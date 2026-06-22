import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../../constants';
import AppAlert from '../../components/AppAlert';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.sellingpoint';

interface ForceUpdateScreenProps {
  route: {
    params: {
      currentVersion: string;
      requiredVersion: string;
    };
  };
}

export default function ForceUpdateScreen({ route }: ForceUpdateScreenProps) {
  const { currentVersion, requiredVersion } = route?.params ?? {
    currentVersion: '1.0.0',
    requiredVersion: '1.0.1',
  };

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState({ icon: '', iconColor: '', title: '', message: '' });

  const showAlert = (icon: string, iconColor: string, title: string, message: string) => {
    setAlertProps({ icon, iconColor, title, message });
    setAlertVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const supported = await Linking.canOpenURL(PLAY_STORE_URL);
      if (supported) {
        await Linking.openURL(PLAY_STORE_URL);
      } else {
        showAlert('refresh-circle', COLORS.primary, 'Update Required', 'Please visit the Play Store to update the app.');
      }
    } catch {
      showAlert('close-circle', COLORS.danger, 'Error', 'Unable to open the Play Store. Please update manually.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <AppAlert
        visible={alertVisible}
        icon={alertProps.icon}
        iconColor={alertProps.iconColor}
        title={alertProps.title}
        message={alertProps.message}
        onDismiss={() => setAlertVisible(false)}
      />

      <View style={styles.headerBand}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SP</Text>
          </View>
          <Text style={styles.brandName}>SellingPoint</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.updateIconContainer}>
          <IonIcon name="refresh-circle" size={72} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.subtitle}>
          A new version of Sellingpoint is available. Please update to continue using the app.
        </Text>

        <View style={styles.versionCard}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Your version</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>v{currentVersion}</Text>
            </View>
          </View>
          <View style={styles.versionDivider} />
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Required version</Text>
            <View style={[styles.versionBadge, styles.versionBadgeNew]}>
              <Text style={[styles.versionBadgeText, styles.versionBadgeNewText]}>
                v{requiredVersion}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.featureHeading}>What's new in this update:</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Performance improvements and bug fixes</Text>
          <Text style={styles.featureItem}>• Enhanced security features</Text>
          <Text style={styles.featureItem}>• Better checkout experience</Text>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.85}>
          <Text style={styles.updateButtonText}>Update Now</Text>
          <IonIcon name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <Text style={styles.footnote}>
          You will be redirected to the Google Play Store
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBand: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SIZES.sm,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  logoText: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  brandName: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, letterSpacing: 0.5 },
  content: { flex: 1, paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.xxl, alignItems: 'center' },
  updateIconContainer: { marginBottom: SIZES.base },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: SIZES.sm },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SIZES.xl, paddingHorizontal: SIZES.sm },
  versionCard: {
    alignSelf: 'stretch', backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius, padding: SIZES.base,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.xl,
  },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.xs },
  versionDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SIZES.xs },
  versionLabel: { fontSize: 14, color: COLORS.textSecondary },
  versionBadge: { backgroundColor: COLORS.grayLight, borderRadius: SIZES.borderRadiusSm, paddingHorizontal: SIZES.sm, paddingVertical: 4 },
  versionBadgeText: { fontSize: 13, fontWeight: '600', color: COLORS.grayDark },
  versionBadgeNew: { backgroundColor: '#E8F5E9' },
  versionBadgeNewText: { color: COLORS.success },
  featureHeading: { alignSelf: 'flex-start', fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SIZES.xs },
  featureList: { alignSelf: 'stretch', marginBottom: SIZES.xl },
  featureItem: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 22 },
  updateButton: {
    flexDirection: 'row', backgroundColor: COLORS.primary,
    alignSelf: 'stretch', height: 52, borderRadius: SIZES.borderRadius,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
    marginBottom: SIZES.sm,
  },
  updateButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  footnote: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: SIZES.xs },
});

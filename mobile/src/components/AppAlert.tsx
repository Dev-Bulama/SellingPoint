import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../constants';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'primary' | 'outline';
};

type Props = {
  visible: boolean;
  icon?: string;
  iconColor?: string;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
};

export default function AppAlert({ visible, icon, iconColor, title, message, buttons, onDismiss }: Props) {
  const resolvedIcon = icon ?? 'information-circle';
  const resolvedColor = iconColor ?? COLORS.primary;
  const resolvedButtons: AlertButton[] = buttons && buttons.length > 0
    ? buttons
    : [{ text: 'OK', onPress: onDismiss, style: 'primary' }];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: resolvedColor + '18' }]}>
            <IonIcon name={resolvedIcon} size={48} color={resolvedColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttons}>
            {resolvedButtons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.btn,
                  btn.style === 'outline' ? styles.btnOutline : styles.btnPrimary,
                  resolvedButtons.length > 1 && { flex: 1 },
                ]}
                onPress={btn.onPress}
              >
                <Text style={btn.style === 'outline' ? styles.btnOutlineText : styles.btnPrimaryText}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 28,
    width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  btn: { borderRadius: SIZES.borderRadius, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: COLORS.primary, flex: 1 },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.primary, flex: 1 },
  btnPrimaryText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  btnOutlineText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
});

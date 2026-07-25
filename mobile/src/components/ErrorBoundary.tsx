import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.props.fallbackTitle ?? 'Something went wrong'}</Text>
        <Text style={styles.body}>
          An unexpected error occurred. Tap below to try again.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, backgroundColor: COLORS.background,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  body: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  btn: {
    backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 40,
    borderRadius: SIZES.borderRadius,
  },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
});

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { cmsApi } from '../../api/cms';
import { COLORS, SIZES } from '../../constants';

export default function FaqScreen({ navigation }: any) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    cmsApi.faqs().then(res => setFaqs(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 60 }} />
      </View>
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} /> : (
        <ScrollView contentContainerStyle={{ padding: SIZES.screenPadding }}>
          {faqs.map((faq, i) => (
            <View key={i} style={styles.faqItem}>
              <TouchableOpacity style={styles.question} onPress={() => setExpanded(expanded === i ? null : i)}>
                <Text style={styles.questionText}>{faq.question}</Text>
                <Text style={styles.chevron}>{expanded === i ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expanded === i && <Text style={styles.answer}>{faq.answer}</Text>}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16, backgroundColor: COLORS.white },
  backText: { color: COLORS.primary, fontSize: 15 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  faqItem: { backgroundColor: COLORS.white, borderRadius: SIZES.borderRadius, marginBottom: 10, overflow: 'hidden', elevation: 1 },
  question: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  questionText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
  chevron: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 },
  answer: { paddingHorizontal: 16, paddingBottom: 16, fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
});

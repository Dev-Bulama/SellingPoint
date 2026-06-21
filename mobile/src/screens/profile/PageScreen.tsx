import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { cmsApi } from '../../api/cms';
import { COLORS, SIZES } from '../../constants';

export default function PageScreen({ route, navigation }: any) {
  const { slug, title } = route.params;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsApi.page(slug).then(res => setContent(res.data.data.content)).catch(() => setContent('<p>Content not available.</p>')).finally(() => setLoading(false));
  }, [slug]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <IonIcon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} /> : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.rawContent}>{content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  content: { padding: SIZES.screenPadding },
  rawContent: { fontSize: 15, color: COLORS.text, lineHeight: 24 },
});

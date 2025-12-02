import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import palette from '../../styles/palette';
import { decideApplication } from '../../services/notifications';

const NotificationDetailScreen = ({ route, navigation }) => {
  const { notification } = route.params || {};
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.muted}>Notification not found.</Text>
      </SafeAreaView>
    );
  }

  const data = notification.data || {};
  const handleDecision = async (action) => {
    if (!data.applicationId) return;
    setIsSubmitting(true);
    try {
      await decideApplication(data.applicationId, action, user?.id);
      Alert.alert(
        'Updated',
        `Application ${action === 'accept' ? 'accepted' : 'denied'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDecide = Boolean(data.applicationId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.body}>{notification.body}</Text>
        {data.contractorName && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contractor</Text>
            <Text style={styles.meta}>{data.contractorName}</Text>
            {data.contractorEmail ? <Text style={styles.meta}>{data.contractorEmail}</Text> : null}
            {data.contractorPhone ? <Text style={styles.meta}>{data.contractorPhone}</Text> : null}
          </View>
        )}
        {data.projectTitle && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Project</Text>
            <Text style={styles.meta}>{data.projectTitle}</Text>
          </View>
        )}
      </ScrollView>
      {canDecide && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.deny]}
            onPress={() => handleDecision('deny')}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Deny</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.accept]}
            onPress={() => handleDecision('accept')}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: palette.text },
  body: { color: palette.text },
  muted: { color: palette.muted, padding: 20 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  meta: { color: palette.muted, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.surface,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  accept: { backgroundColor: palette.primary },
  deny: { backgroundColor: '#EF4444' },
});

export default NotificationDetailScreen;

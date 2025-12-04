import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import palette from '../../styles/palette';

const ProjectOverviewScreen = ({ route, navigation }) => {
  const { project, role = 'homeowner' } = route.params || {};
  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.muted}>Project not found.</Text>
      </SafeAreaView>
    );
  }

  const milestones = project.milestones || [];
  const progress = milestones.length
    ? Math.round(
        (milestones.filter((m) => m.status === 'approved' || m.status === 'completed').length /
          milestones.length) *
          100
      )
    : 0;

  const handleEdit = () => {
    if (role === 'homeowner') {
      navigation.navigate('CreateProject', { project, origin: 'Dashboard' });
    } else {
      navigation.navigate('ContractorProjectDetails', { project, canApply: false, canLeave: true });
    }
  };

  const goPersonnel = () => {
    navigation.navigate('ProjectPersonnel', { project, role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.subtitle}>{project.projectType || 'Project'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{project.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          {milestones.length === 0 ? (
            <Text style={styles.muted}>No milestones yet.</Text>
          ) : (
            milestones.map((m, idx) => (
              <View key={m.id || idx} style={styles.milestoneRow}>
                <View style={styles.milestoneBullet} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.milestoneName}>{m.name}</Text>
                  <Text style={styles.milestoneMeta}>
                    {m.status || 'Pending'} • ${Number(m.amount || 0).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.personnelButton]} onPress={goPersonnel}>
            <Text style={styles.personnelText}>Personnel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, gap: 14 },
  header: { gap: 6 },
  title: { fontSize: 24, fontWeight: '700', color: palette.text },
  subtitle: { color: palette.muted },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
  body: { color: palette.text, lineHeight: 20 },
  progressBar: {
    height: 8,
    backgroundColor: '#EEE7FF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: palette.primary },
  progressValue: { color: palette.primary, fontWeight: '700' },
  milestoneRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 6 },
  milestoneBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
  milestoneName: { fontWeight: '700', color: palette.text },
  milestoneMeta: { color: palette.muted, fontSize: 12 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: { backgroundColor: palette.primary },
  personnelButton: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  buttonText: { color: '#fff', fontWeight: '700' },
  personnelText: { color: palette.text, fontWeight: '700' },
  muted: { color: palette.muted },
});

export default ProjectOverviewScreen;

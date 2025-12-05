import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import palette from '../../styles/palette';

const WorkerGigsScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { workerAssignments, workerProjects } = useSelector((state) => state.projects);
  const assignments = (workerAssignments || []).filter((a) => a.workerId === user?.id);
  const projects = (workerProjects || []).filter((p) => p);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>My Gigs</Text>
        {(!projects || projects.length === 0) && (
          <Text style={styles.muted}>No gigs assigned yet.</Text>
        )}
        {projects.map((proj) => (
          <TouchableOpacity
            key={proj.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('WorkerProject', {
                projectId: proj.id,
              })
            }
          >
            <Text style={styles.cardTitle}>{proj.title || 'Project'}</Text>
            <Text style={styles.cardMeta}>{proj.description || 'No description provided.'}</Text>
            <Text style={styles.cardMeta}>
              Assigned work: {assignments.filter((a) => a.projectId === proj.id).length}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: palette.text },
  muted: { color: palette.muted },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 4,
  },
  cardTitle: { fontWeight: '700', color: palette.text },
  cardMeta: { color: palette.muted, fontSize: 12 },
});

export default WorkerGigsScreen;

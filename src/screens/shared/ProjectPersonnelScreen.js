import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import palette from '../../styles/palette';

const buildPersonnel = (project) => {
  const people = [];
  if (project?.assignedContractor) {
    people.push({
      id: project.assignedContractor.id,
      name: project.assignedContractor.fullName,
      role: 'contractor',
      email: project.assignedContractor.email,
      phone: project.assignedContractor.phone,
      photo: project.assignedContractor.profilePhotoUrl,
    });
  }
  // Simple placeholders to show hierarchy if data is missing
  people.push(
    {
      id: 'sub-1',
      name: 'Subcontractor Crew',
      role: 'subcontractor',
      email: 'subs@example.com',
      phone: '555-202-1000',
    },
    {
      id: 'foreman-1',
      name: 'Site Foreman',
      role: 'foreman',
      email: 'foreman@example.com',
      phone: '555-202-2000',
    },
    {
      id: 'labor-1',
      name: 'Laborer A',
      role: 'laborer',
      email: 'laborer@example.com',
      phone: '555-202-3000',
    },
    {
      id: 'labor-2',
      name: 'Laborer B',
      role: 'laborer',
      email: 'laborer@example.com',
      phone: '555-202-3001',
    }
  );

  const order = ['contractor', 'subcontractor', 'foreman', 'laborer'];
  return people.sort(
    (a, b) => order.indexOf(a.role || 'laborer') - order.indexOf(b.role || 'laborer')
  );
};

const roleLabel = (role) => {
  switch ((role || '').toLowerCase()) {
    case 'contractor':
      return 'General Contractor';
    case 'subcontractor':
      return 'Subcontractor';
    case 'foreman':
      return 'Foreman';
    default:
      return 'Laborer';
  }
};

const ProjectPersonnelScreen = ({ route, navigation }) => {
  const { project } = route.params || {};
  const personnel = useMemo(() => buildPersonnel(project), [project]);
  const [selectedId, setSelectedId] = useState(null);
  const toggleSelect = (id) => setSelectedId((prev) => (prev === id ? null : id));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Project Personnel</Text>
            <Text style={styles.subtitle}>{project?.title || ''}</Text>
          </View>
        </View>

        {personnel.map((person) => {
          const isSelected = selectedId === person.id;
          return (
            <TouchableOpacity
              key={person.id}
              style={[styles.card, isSelected ? styles.cardActive : null]}
              onPress={() => toggleSelect(person.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardTop}>
                {person.photo ? (
                  <Image source={{ uri: person.photo }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{person.name?.[0] || '?'}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{person.name}</Text>
                  <Text style={styles.role}>{roleLabel(person.role)}</Text>
                </View>
                <Text style={styles.chevron}>{isSelected ? '▲' : '▼'}</Text>
              </View>
              {isSelected && (
                <View style={styles.details}>
                  <Text style={styles.detailText}>Email: {person.email || 'N/A'}</Text>
                  <Text style={styles.detailText}>Phone: {person.phone || 'N/A'}</Text>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => navigation.navigate('Chat', { project })}
                  >
                    <Text style={styles.messageText}>Message</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  backText: { fontSize: 22, color: palette.text },
  title: { fontSize: 20, fontWeight: '700', color: palette.text },
  subtitle: { color: palette.muted },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardActive: { borderColor: palette.primary },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eee' },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontWeight: '700', color: palette.primary },
  name: { fontSize: 16, fontWeight: '700', color: palette.text },
  role: { color: palette.muted, fontSize: 12 },
  chevron: { color: palette.muted, fontWeight: '700' },
  details: { marginTop: 10, gap: 6 },
  detailText: { color: palette.text },
  messageButton: {
    marginTop: 6,
    backgroundColor: palette.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageText: { color: '#fff', fontWeight: '700' },
});

export default ProjectPersonnelScreen;

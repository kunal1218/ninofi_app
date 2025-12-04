import React, { useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import palette from '../../styles/palette';

const buildPersonnel = (project) => {
  const people = [];
  if (project?.owner) {
    people.push({
      id: project.owner.id,
      name: project.owner.fullName,
      role: 'owner',
      email: project.owner.email,
      phone: project.owner.phone,
      photo: project.owner.profilePhotoUrl,
    });
  }
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

  const order = ['owner', 'contractor', 'subcontractor', 'foreman', 'laborer'];
  return people.sort(
    (a, b) => order.indexOf(a.role || 'laborer') - order.indexOf(b.role || 'laborer')
  );
};

const roleLabel = (role) => {
  switch ((role || '').toLowerCase()) {
    case 'owner':
      return 'Homeowner';
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
  const { project, role = 'homeowner' } = route.params || {};
  const basePeople = useMemo(() => buildPersonnel(project), [project]);
  const [people, setPeople] = useState(basePeople);
  const [selectedId, setSelectedId] = useState(null);
  const isContractor = role === 'contractor';

  const availableEmployees = useMemo(
    () => [
      { id: 'emp-1', name: 'Taylor Foreman', role: 'foreman', email: 'taylor@example.com', phone: '555-333-1000' },
      { id: 'emp-2', name: 'Jordan Mason', role: 'laborer', email: 'jordan@example.com', phone: '555-333-2000' },
      { id: 'emp-3', name: 'Riley Sparks', role: 'laborer', email: 'riley@example.com', phone: '555-333-3000' },
    ],
    []
  );

  const toggleSelect = (id) => setSelectedId((prev) => (prev === id ? null : id));

  const handleAdd = (employee) => {
    if (!employee) return;
    if (people.find((p) => p.id === employee.id)) return;
    const next = [...people, employee];
    const order = ['owner', 'contractor', 'subcontractor', 'foreman', 'laborer'];
    setPeople(
      next.sort(
        (a, b) => order.indexOf(a.role || 'laborer') - order.indexOf(b.role || 'laborer')
      )
    );
  };

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

        {people.map((person) => {
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

        {isContractor ? (
          <View style={styles.addSection}>
            <Text style={styles.addTitle}>Add Personnel</Text>
            <View style={styles.employeeList}>
              {availableEmployees.map((emp) => (
                <TouchableOpacity
                  key={emp.id}
                  style={styles.employeeChip}
                  onPress={() => handleAdd(emp)}
                >
                  <Text style={styles.employeeChipText}>{emp.name}</Text>
                  <Text style={styles.employeeRole}>{roleLabel(emp.role)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
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
  addSection: {
    marginTop: 12,
    padding: 14,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
  },
  addTitle: { fontWeight: '700', color: palette.text },
  employeeList: { gap: 8 },
  employeeChip: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5FF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  employeeChipText: { fontWeight: '700', color: palette.text },
  employeeRole: { color: palette.muted, fontSize: 12 },
});

export default ProjectPersonnelScreen;

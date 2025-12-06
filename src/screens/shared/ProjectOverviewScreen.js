import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import palette from '../../styles/palette';
import { deleteContract, fetchContractsForProject } from '../../services/contracts';

const ProjectOverviewScreen = ({ route, navigation }) => {
  const { project, role = 'homeowner' } = route.params || {};
  const { user } = useSelector((state) => state.auth);
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState(null);

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
    }
  };

  const goPersonnel = () => {
    navigation.navigate('ProjectPersonnel', { project, role });
  };

  const handleProposeContract = () => {
    navigation.navigate('ContractWizard', { project, role });
  };

  const loadContracts = useCallback(async () => {
    if (!project?.id) return;
    setContractsLoading(true);
    setContractsError(null);
    const res = await fetchContractsForProject(project.id);
    if (res.success) {
      setContracts(res.data || []);
    } else {
      setContractsError(res.error || 'Failed to load contracts');
    }
    setContractsLoading(false);
  }, [project?.id]);

  useFocusEffect(
    useCallback(() => {
      loadContracts();
    }, [loadContracts])
  );

  const handleDelete = async (contract) => {
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please log in.');
      return;
    }
    Alert.alert(
      'Delete contract?',
      `This will delete "${contract.title || 'Contract'}" if it is pending.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteContract({ contractId: contract.id, userId: user.id });
            if (!res.success) {
              Alert.alert('Error', res.error);
              return;
            }
            await loadContracts();
          },
        },
      ]
    );
  };

  const isContractor = role === 'contractor';
  const showEdit = role === 'homeowner';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{project.projectType || 'Project'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{project.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detailText}>Address: {project.address || 'Not set'}</Text>
          <Text style={styles.detailText}>
            Budget: ${Number(project.estimatedBudget || 0).toLocaleString()}
          </Text>
          <Text style={styles.detailText}>Timeline: {project.timeline || 'Not set'}</Text>
          {project.owner?.fullName ? (
            <Text style={styles.detailText}>Owner: {project.owner.fullName}</Text>
          ) : null}
          {project.assignedContractor?.fullName ? (
            <Text style={styles.detailText}>
              Contractor: {project.assignedContractor.fullName}
            </Text>
          ) : (
            <Text style={styles.detailText}>Contractor: Unassigned</Text>
          )}
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
              <View key={`${m.id || 'milestone'}-${idx}`} style={styles.milestoneRow}>
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

        {role !== 'worker' && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Proposed Contracts</Text>
              {contractsLoading ? <Text style={styles.muted}>Loading…</Text> : null}
            </View>
            {contractsError ? <Text style={styles.errorText}>{contractsError}</Text> : null}
            {!contractsLoading && !contractsError && (!contracts || contracts.length === 0) ? (
              <Text style={styles.muted}>No contracts yet.</Text>
            ) : null}
            {contracts?.map((c) => {
              const statusLabel = (c.status || 'pending').toUpperCase();
              return (
                <View key={c.id} style={styles.contractCard}>
                  <View style={styles.contractHeader}>
                    <Text style={styles.contractTitle}>{c.title || 'Contract'}</Text>
                    <Text style={styles.contractMeta}>Status: {statusLabel}</Text>
                    {typeof c.signatureCount === 'number' ? (
                      <Text style={styles.contractMeta}>Signatures: {c.signatureCount}</Text>
                    ) : null}
                  </View>
                  <View style={styles.contractActions}>
                    <TouchableOpacity onPress={() => navigation.navigate('ContractView', { contract: c })}>
                      <Text style={styles.actionLink}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ContractSignature', { contract: c })}>
                      <Text style={styles.actionLink}>{statusLabel === 'SIGNED' ? 'View' : 'Sign'}</Text>
                    </TouchableOpacity>
                    {statusLabel === 'PENDING' ? (
                      <TouchableOpacity onPress={() => handleDelete(c)}>
                        <Text style={styles.actionLink}>Delete</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })}
            <TouchableOpacity style={[styles.button, styles.refreshButton]} onPress={loadContracts}>
              <Text style={styles.personnelText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.personnelButton]} onPress={goPersonnel}>
            <Text style={styles.personnelText}>People</Text>
          </TouchableOpacity>
          {showEdit ? (
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
          {isContractor ? (
            <TouchableOpacity
              style={[styles.button, styles.contractButton]}
              onPress={() => navigation.navigate('PostWork', { project, role })}
            >
              <Text style={styles.contractText}>Post Work</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {role !== 'worker' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.contractButton]}
              onPress={handleProposeContract}
            >
              <Text style={styles.contractText}>Propose Contract</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { padding: 22, gap: 18 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 6,
  },
  title: { fontSize: 26, fontWeight: '800', color: palette.text, flexShrink: 1 },
  typeTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: palette.primary,
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  typeText: { color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: palette.text, letterSpacing: 0.2 },
  body: { color: palette.text, lineHeight: 22, fontSize: 15 },
  detailText: { color: palette.text, lineHeight: 22, fontSize: 15 },
  progressBar: {
    height: 10,
    backgroundColor: '#E7E9FB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: palette.primary },
  progressValue: { color: palette.primary, fontWeight: '700', fontSize: 14 },
  milestoneRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 8 },
  milestoneBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.primary,
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  milestoneName: { fontWeight: '700', color: palette.text, fontSize: 15 },
  milestoneMeta: { color: palette.muted, fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  editButton: { backgroundColor: palette.primary },
  personnelButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 },
  personnelText: { color: palette.text, fontWeight: '700', fontSize: 15 },
  muted: { color: palette.muted },
  contractButton: { backgroundColor: palette.primary },
  contractText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  contractCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 12,
    backgroundColor: palette.surface,
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  contractHeader: { flex: 1, gap: 2 },
  contractTitle: { fontWeight: '700', color: palette.text, fontSize: 16 },
  contractMeta: { color: palette.muted, fontSize: 13 },
  contractActions: { flexDirection: 'row', gap: 18, alignItems: 'center', marginTop: 6 },
  signButton: { backgroundColor: palette.primary, paddingHorizontal: 14, paddingVertical: 10 },
  refreshButton: {
    marginTop: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  errorText: { color: '#c1121f', fontSize: 13 },
  actionLink: { color: palette.primary, fontWeight: '700', fontSize: 14, letterSpacing: 0.2 },
});

export default ProjectOverviewScreen;

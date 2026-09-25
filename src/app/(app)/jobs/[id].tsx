import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Badge, Button, MapPlaceholder } from '@/components/ui';
import { useJobDetails, useAcceptJob, useActiveJob } from '@/features/jobs/useJobs';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: job, isLoading } = useJobDetails(id as string);
  const { data: activeJob } = useActiveJob();
  const acceptJobMutation = useAcceptJob();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading delivery job details...</Text>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Job Not Found</Text>
          <Button title="Back to Available Jobs" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAcceptJob = () => {
    if (activeJob) {
      Alert.alert(
        'Active Job Pending',
        'You already have an active job in progress. Complete or cancel it before accepting a new job.'
      );
      return;
    }

    acceptJobMutation.mutate(job.id, {
      onSuccess: () => {
        Alert.alert('Job Accepted!', 'Delivery job has been assigned to you.', [
          {
            text: 'Go to Active Screen',
            onPress: () => router.replace('/(app)/active'),
          },
        ]);
      },
      onError: (error) => {
        Alert.alert('Unable to Accept Job', error.message || 'An error occurred.');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Job Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.orderIdText}>{job.orderId}</Text>
            <Badge label={job.status} type={job.status} />
          </View>
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsLabel}>Total Pay</Text>
            <Text style={styles.earningsAmount}>${job.totalEarnings.toFixed(2)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaBadge}>📍 {job.distanceKm} km distance</Text>
            <Text style={styles.metaBadge}>⏱️ ~{job.estimatedDurationMins} mins est.</Text>
          </View>
        </Card>

        {/* Navigation Map */}
        <MapPlaceholder />

        {/* Pickup Information */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>🟢</Text>
            <Text style={styles.sectionTitle}>Pickup Details</Text>
          </View>
          <Text style={styles.locationName}>{job.pickup.locationName}</Text>
          <Text style={styles.addressText}>{job.pickup.address.formattedAddress}</Text>

          {job.pickup.address.instructions ? (
            <View style={styles.instructionBox}>
              <Text style={styles.instructionLabel}>Pickup Instructions:</Text>
              <Text style={styles.instructionText}>{job.pickup.address.instructions}</Text>
            </View>
          ) : null}

          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Contact:</Text>
            <Text style={styles.contactValue}>
              {job.pickup.contactPerson} ({job.pickup.contactPhone})
            </Text>
          </View>
        </Card>

        {/* Delivery Information */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>🔴</Text>
            <Text style={styles.sectionTitle}>Delivery Destination</Text>
          </View>
          <Text style={styles.locationName}>{job.delivery.customer.name}</Text>
          <Text style={styles.addressText}>{job.delivery.address.formattedAddress}</Text>

          {job.delivery.address.instructions ? (
            <View style={styles.instructionBox}>
              <Text style={styles.instructionLabel}>Customer Delivery Instructions:</Text>
              <Text style={styles.instructionText}>{job.delivery.address.instructions}</Text>
            </View>
          ) : null}

          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Customer Phone:</Text>
            <Text style={styles.contactValue}>{job.delivery.customer.phone}</Text>
          </View>
        </Card>

        {/* Items List */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items ({job.items.length})</Text>
          {job.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemQtyBadge}>
                <Text style={styles.itemQtyText}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemDetail}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.category && <Text style={styles.itemCategory}>{item.category}</Text>}
              </View>
            </View>
          ))}
        </Card>

        {/* Special Notes */}
        {job.specialNotes && (
          <Card style={styles.notesCard}>
            <Text style={styles.notesTitle}>Special Handling Notes</Text>
            <Text style={styles.notesText}>{job.specialNotes}</Text>
          </Card>
        )}
      </ScrollView>

      {/* Accept Action Footer */}
      {job.status === 'ASSIGNED' && (
        <View style={styles.footerBar}>
          <Button
            title="Accept Delivery Job"
            onPress={handleAcceptJob}
            isLoading={acceptJobMutation.isPending}
            style={styles.acceptButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backButtonText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 16,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748B',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#0F172A',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  earningsContainer: {
    marginBottom: 12,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaBadge: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 6,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  instructionBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 13,
    color: '#78350F',
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  contactLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginRight: 6,
  },
  contactValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemQtyBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  itemQtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemDetail: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemCategory: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#78350F',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 10,
  },
  acceptButton: {
    width: '100%',
  },
});

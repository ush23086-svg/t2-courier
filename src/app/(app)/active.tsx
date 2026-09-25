import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Badge, Button, StatusStepper, MapPlaceholder } from '@/components/ui';
import { useActiveJob, useUpdateJobStatus } from '@/features/jobs/useJobs';
import { DeliveryStatus } from '@/types';

export default function ActiveDeliveryScreen() {
  const router = useRouter();
  const { data: job, isLoading, refetch } = useActiveJob();
  const updateStatusMutation = useUpdateJobStatus();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Fetching active delivery details...</Text>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛵</Text>
          <Text style={styles.emptyTitle}>No Active Delivery Job</Text>
          <Text style={styles.emptySubtitle}>
            You currently have no delivery in progress. Check available jobs to accept a new delivery task.
          </Text>
          <Button
            title="Browse Available Jobs"
            onPress={() => router.push('/(app)/jobs')}
            style={styles.browseButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call Error', `Unable to open dialer for ${phone}`);
    });
  };

  const handleStatusTransition = (nextStatus: DeliveryStatus, title: string) => {
    Alert.alert('Confirm Status Change', `Are you sure you want to transition status to "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          updateStatusMutation.mutate(
            { jobId: job.id, status: nextStatus },
            {
              onSuccess: () => {
                if (nextStatus === 'DELIVERED') {
                  Alert.alert('Delivery Complete!', 'Great work! Job completed successfully.', [
                    { text: 'OK', onPress: () => router.replace('/(app)') },
                  ]);
                } else {
                  refetch();
                }
              },
              onError: (err) => {
                Alert.alert('Status Update Failed', err.message || 'Error updating status');
              },
            }
          );
        },
      },
    ]);
  };

  const renderStatusAction = () => {
    switch (job.status) {
      case 'ACCEPTED':
        return (
          <Button
            title="Pickup Confirmed"
            onPress={() => handleStatusTransition('PICKED_UP', 'Picked Up')}
            isLoading={updateStatusMutation.isPending}
            style={styles.actionButton}
          />
        );
      case 'PICKED_UP':
        return (
          <Button
            title="Start Delivery"
            onPress={() => handleStatusTransition('DELIVERING', 'Delivering')}
            isLoading={updateStatusMutation.isPending}
            style={styles.actionButton}
          />
        );
      case 'DELIVERING':
        return (
          <Button
            title="Delivered"
            variant="success"
            onPress={() => handleStatusTransition('DELIVERED', 'Delivered')}
            isLoading={updateStatusMutation.isPending}
            style={styles.actionButton}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <Text style={styles.headerOrderId}>{job.orderId}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Pipeline Stepper */}
        <Card style={styles.stepperCard}>
          <Text style={styles.stepperTitle}>Delivery Pipeline</Text>
          <StatusStepper currentStatus={job.status} />
        </Card>

        {/* Live Route Map */}
        <MapPlaceholder />

        {/* Current Phase Details */}
        {['ACCEPTED', 'PICKED_UP'].includes(job.status) ? (
          <Card style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Badge label={`STATUS: ${job.status}`} type={job.status} />
              <Text style={styles.estText}>Est: {job.pickup.estimatedPickupTime}</Text>
            </View>

            <Text style={styles.phaseLocationName}>{job.pickup.locationName}</Text>
            <Text style={styles.phaseAddress}>{job.pickup.address.formattedAddress}</Text>

            {job.pickup.address.instructions && (
              <View style={styles.instructionCard}>
                <Text style={styles.instructionLabel}>Pickup Instructions:</Text>
                <Text style={styles.instructionText}>{job.pickup.address.instructions}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => handleCall(job.pickup.contactPhone)}
              >
                <Text style={styles.contactBtnText}>📞 Call Merchant ({job.pickup.contactPerson})</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Badge label={`STATUS: ${job.status}`} type={job.status} />
              <Text style={styles.estText}>Est: {job.delivery.estimatedDeliveryTime}</Text>
            </View>

            <Text style={styles.phaseLocationName}>{job.delivery.customer.name}</Text>
            <Text style={styles.phaseAddress}>{job.delivery.address.formattedAddress}</Text>

            {job.delivery.address.instructions && (
              <View style={styles.instructionCard}>
                <Text style={styles.instructionLabel}>Customer Instructions:</Text>
                <Text style={styles.instructionText}>{job.delivery.address.instructions}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => handleCall(job.delivery.customer.phone)}
              >
                <Text style={styles.contactBtnText}>📞 Call Customer ({job.delivery.customer.name})</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Order Contents Overview */}
        <Card style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Items to Deliver ({job.items.length})</Text>
          {job.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemBadge}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* Action Bar Footer */}
      <View style={styles.footerBar}>{renderStatusAction()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerOrderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    width: '100%',
  },
  stepperCard: {
    marginBottom: 12,
  },
  stepperTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  phaseCard: {
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  estText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  phaseLocationName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  phaseAddress: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  instructionCard: {
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
  actionRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  contactBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  itemsCard: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
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
  actionButton: {
    width: '100%',
  },
});

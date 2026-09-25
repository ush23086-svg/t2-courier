import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Badge, Button, MapPlaceholder } from '@/components/ui';
import { useAuthStore } from '@/features/auth/useAuthStore';
import {
  useActiveJob,
  useAvailableJobs,
  useCourierMetrics,
  useUpdateCourierStatus,
} from '@/features/jobs/useJobs';

export default function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const courier = session?.courier;

  const { data: activeJob, isLoading: isActiveLoading, refetch: refetchActive } = useActiveJob();
  const { data: availableJobs, isLoading: isJobsLoading, refetch: refetchJobs } = useAvailableJobs();
  const { data: metrics, refetch: refetchMetrics } = useCourierMetrics();
  const updateStatusMutation = useUpdateCourierStatus();

  const isOnline = courier?.status !== 'OFFLINE';

  const handleToggleOnline = (value: boolean) => {
    updateStatusMutation.mutate(value ? 'AVAILABLE' : 'OFFLINE');
  };

  const handleRefresh = () => {
    refetchActive();
    refetchJobs();
    refetchMetrics();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isActiveLoading || isJobsLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.courierName}>{courier?.name || 'Courier'}</Text>
          </View>
          <View style={styles.statusToggleCard}>
            <Text style={styles.statusToggleLabel}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Today Earnings</Text>
            <Text style={styles.metricValue}>
              ${metrics?.todayEarnings ? metrics.todayEarnings.toFixed(2) : '0.00'}
            </Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Completed</Text>
            <Text style={styles.metricValue}>
              {metrics?.todayCompletedCount || 0} jobs
            </Text>
          </Card>
        </View>

        {/* Active Delivery Shortcut */}
        {activeJob ? (
          <Card style={styles.activeJobCard}>
            <View style={styles.activeCardHeader}>
              <Badge label="IN PROGRESS" type={activeJob.status} />
              <Text style={styles.activeOrderId}>{activeJob.orderId}</Text>
            </View>

            <Text style={styles.activeTitle}>{activeJob.pickup.locationName}</Text>
            <Text style={styles.activeAddress}>
              ➔ {activeJob.delivery.address.formattedAddress}
            </Text>

            <MapPlaceholder />

            <Button
              title="Go to Active Delivery Screen"
              onPress={() => router.push('/(app)/active')}
              style={styles.activeButton}
            />
          </Card>
        ) : (
          <Card style={styles.noActiveCard}>
            <Text style={styles.noActiveTitle}>No Active Delivery</Text>
            <Text style={styles.noActiveSubtitle}>
              {isOnline
                ? 'You are online! New delivery jobs will appear here.'
                : 'Turn your status ONLINE to start receiving delivery jobs.'}
            </Text>
          </Card>
        )}

        {/* Available Jobs Quick Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Jobs Nearby</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/jobs')}>
            <Text style={styles.seeAllText}>View All ({availableJobs?.length || 0})</Text>
          </TouchableOpacity>
        </View>

        {availableJobs && availableJobs.length > 0 ? (
          availableJobs.slice(0, 2).map((job) => (
            <TouchableOpacity
              key={job.id}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(app)/jobs/[id]', params: { id: job.id } })}
            >
              <Card style={styles.jobPreviewCard}>
                <View style={styles.jobPreviewHeader}>
                  <Text style={styles.pickupName}>{job.pickup.locationName}</Text>
                  <Text style={styles.earningText}>${job.totalEarnings.toFixed(2)}</Text>
                </View>
                <Text style={styles.jobPreviewSub} numberOfLines={1}>
                  Pick up: {job.pickup.address.formattedAddress}
                </Text>
                <Text style={styles.jobPreviewSub} numberOfLines={1}>
                  Deliver: {job.delivery.address.formattedAddress}
                </Text>
                <View style={styles.jobPreviewMeta}>
                  <Text style={styles.metaText}>{job.distanceKm} km</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{job.estimatedDurationMins} mins</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No available delivery jobs at this moment.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
  },
  courierName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusToggleLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
    color: '#0F172A',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    backgroundColor: '#0F172A',
  },
  metricLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  activeJobCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginBottom: 20,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeOrderId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  activeAddress: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  activeButton: {
    marginTop: 8,
  },
  noActiveCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  noActiveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  noActiveSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
  },
  jobPreviewCard: {
    marginBottom: 10,
  },
  jobPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pickupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  earningText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  jobPreviewSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  jobPreviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metaDot: {
    marginHorizontal: 6,
    color: '#CBD5E1',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});

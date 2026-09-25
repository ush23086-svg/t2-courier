import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Badge } from '@/components/ui';
import { useAvailableJobs } from '@/features/jobs/useJobs';
import { DeliveryJob } from '@/types';

export default function JobsListScreen() {
  const router = useRouter();
  const { data: jobs, isLoading, isRefetching, refetch } = useAvailableJobs();

  const renderJobItem = ({ item }: { item: DeliveryJob }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/(app)/jobs/[id]', params: { id: item.id } })}
      >
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Badge label="OPEN JOB" type="ASSIGNED" />
            <Text style={styles.earningText}>${item.totalEarnings.toFixed(2)}</Text>
          </View>

          <View style={styles.addressSection}>
            <View style={styles.addressRow}>
              <Text style={styles.icon}>🟢</Text>
              <View style={styles.addressTextCol}>
                <Text style={styles.locationTitle}>{item.pickup.locationName}</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.pickup.address.formattedAddress}
                </Text>
              </View>
            </View>

            <View style={styles.addressLine} />

            <View style={styles.addressRow}>
              <Text style={styles.icon}>🔴</Text>
              <View style={styles.addressTextCol}>
                <Text style={styles.locationTitle}>Delivery Location</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.delivery.address.formattedAddress}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.badgeGroup}>
              <Text style={styles.footerInfo}>📏 {item.distanceKm} km</Text>
              <Text style={styles.footerInfo}>⏱️ ~{item.estimatedDurationMins} min</Text>
            </View>
            <Text style={styles.actionPrompt}>View Details ➔</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Available Delivery Jobs</Text>
        <Text style={styles.pageSubtitle}>
          Select a job to view details and accept
        </Text>
      </View>

      <FlatList
        data={jobs || []}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Card style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Available Jobs</Text>
              <Text style={styles.emptySubtitle}>
                New delivery jobs from TwinTwo customer orders will appear here automatically. Pull down to refresh.
              </Text>
            </Card>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  earningText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  addressSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 12,
    marginRight: 8,
  },
  addressTextCol: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
  },
  addressLine: {
    height: 12,
    width: 2,
    backgroundColor: '#CBD5E1',
    marginLeft: 13,
    marginVertical: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  footerInfo: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  actionPrompt: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});

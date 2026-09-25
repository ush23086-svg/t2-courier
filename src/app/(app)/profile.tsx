import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCourierMetrics } from '@/features/jobs/useJobs';

export default function CourierProfileScreen() {
  const router = useRouter();
  const { session, logout } = useAuthStore();
  const { data: metrics } = useCourierMetrics();

  const courier = session?.courier;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from T2 Courier?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {courier?.name ? courier.name.charAt(0) : 'C'}
            </Text>
          </View>
          <Text style={styles.courierName}>{courier?.name || 'Courier'}</Text>
          <Text style={styles.courierEmail}>{courier?.email}</Text>
          <Text style={styles.courierPhone}>{courier?.phone}</Text>

          <View style={styles.badgeRow}>
            <Badge label={courier?.status || 'AVAILABLE'} type={courier?.status} />
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>⭐ {courier?.rating?.toFixed(2) || '5.00'}</Text>
            </View>
          </View>
        </Card>

        {/* Courier Lifetime Performance Stats */}
        <Text style={styles.sectionTitle}>Performance & Stats</Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{courier?.completedDeliveries || 0}</Text>
            <Text style={styles.statLabel}>Total Delivered</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{metrics?.acceptanceRatePercentage || 98}%</Text>
            <Text style={styles.statLabel}>Acceptance Rate</Text>
          </Card>
        </View>

        {/* Vehicle Information */}
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        <Card style={styles.vehicleCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle Type</Text>
            <Text style={styles.infoValue}>{courier?.vehicleType || 'Motorcycle'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Model</Text>
            <Text style={styles.infoValue}>{courier?.vehicleModel || 'Honda Super Cub 125'}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>License Plate</Text>
            <Text style={styles.infoValue}>{courier?.vehiclePlate || 'T2-778-CA'}</Text>
          </View>
        </Card>

        {/* Ecosystem Integration Info */}
        <Card style={styles.ecosystemCard}>
          <Text style={styles.ecoTitle}>TwinTwo (T2) Ecosystem</Text>
          <Text style={styles.ecoText}>
            T2 Courier application operates independently for couriers, receiving job assignments from the TwinTwo merchant and customer platforms.
          </Text>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
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
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    backgroundColor: '#0F172A',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  courierName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  courierEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  courierPhone: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBox: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  vehicleCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  ecosystemCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    marginBottom: 24,
  },
  ecoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  ecoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  logoutButton: {
    marginBottom: 24,
  },
});

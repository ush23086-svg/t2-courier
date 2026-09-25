import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi, profileApi } from '@/services/api';
import { useAuthStore } from '../auth/useAuthStore';
import { DeliveryStatus, CourierProfile } from '@/types';

export const JOB_KEYS = {
  all: ['jobs'] as const,
  available: () => [...JOB_KEYS.all, 'available'] as const,
  detail: (id: string) => [...JOB_KEYS.all, 'detail', id] as const,
  active: (courierId: string) => [...JOB_KEYS.all, 'active', courierId] as const,
  profile: (courierId: string) => ['profile', courierId] as const,
  metrics: (courierId: string) => ['metrics', courierId] as const,
};

export function useAvailableJobs() {
  return useQuery({
    queryKey: JOB_KEYS.available(),
    queryFn: () => deliveryApi.getAvailableJobs(),
    refetchInterval: 10000,
  });
}

export function useJobDetails(jobId: string) {
  return useQuery({
    queryKey: JOB_KEYS.detail(jobId),
    queryFn: () => deliveryApi.getJobById(jobId),
    enabled: !!jobId,
  });
}

export function useActiveJob() {
  const session = useAuthStore((state) => state.session);
  const courierId = session?.courier.id || '';

  return useQuery({
    queryKey: JOB_KEYS.active(courierId),
    queryFn: () => deliveryApi.getActiveJob(courierId),
    enabled: !!courierId,
    refetchInterval: 5000,
  });
}

export function useAcceptJob() {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const updateCourierProfile = useAuthStore((state) => state.updateCourierProfile);

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!session?.courier.id) throw new Error('Courier not authenticated');
      return deliveryApi.acceptJob(jobId, session.courier.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.metrics(session?.courier.id || '') });
      updateCourierProfile({ status: 'ON_DELIVERY' });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const updateCourierProfile = useAuthStore((state) => state.updateCourierProfile);

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: DeliveryStatus }) => {
      return deliveryApi.updateJobStatus(jobId, status);
    },
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.all });
      if (session?.courier.id) {
        queryClient.invalidateQueries({ queryKey: JOB_KEYS.metrics(session.courier.id) });
        queryClient.invalidateQueries({ queryKey: JOB_KEYS.profile(session.courier.id) });
      }
      if (updatedJob.status === 'DELIVERED') {
        updateCourierProfile({ status: 'AVAILABLE' });
      }
    },
  });
}

export function useCourierProfile() {
  const session = useAuthStore((state) => state.session);
  const courierId = session?.courier.id || '';

  return useQuery({
    queryKey: JOB_KEYS.profile(courierId),
    queryFn: () => profileApi.getCourierProfile(courierId),
    enabled: !!courierId,
  });
}

export function useCourierMetrics() {
  const session = useAuthStore((state) => state.session);
  const courierId = session?.courier.id || '';

  return useQuery({
    queryKey: JOB_KEYS.metrics(courierId),
    queryFn: () => profileApi.getCourierMetrics(courierId),
    enabled: !!courierId,
  });
}

export function useUpdateCourierStatus() {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const updateCourierProfile = useAuthStore((state) => state.updateCourierProfile);

  return useMutation({
    mutationFn: async (status: CourierProfile['status']) => {
      if (!session?.courier.id) throw new Error('Courier not authenticated');
      return profileApi.updateStatus(session.courier.id, status);
    },
    onSuccess: (updatedProfile) => {
      updateCourierProfile({ status: updatedProfile.status });
      if (session?.courier.id) {
        queryClient.invalidateQueries({ queryKey: JOB_KEYS.profile(session.courier.id) });
      }
    },
  });
}

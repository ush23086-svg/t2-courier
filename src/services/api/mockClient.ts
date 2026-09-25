import { IDeliveryApi, IAuthApi, IProfileApi } from './interfaces';
import {
  DeliveryJob,
  DeliveryStatus,
  CourierProfile,
  AuthSession,
  LoginCredentials,
  CourierMetrics,
} from '@/types';
import { initialMockJobs } from './mockData';

const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  ASSIGNED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['DELIVERING', 'CANCELLED'],
  DELIVERING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

class MockApiClient implements IDeliveryApi, IAuthApi, IProfileApi {
  private jobs: DeliveryJob[] = JSON.parse(JSON.stringify(initialMockJobs));
  private profile: CourierProfile = {
    id: 'courier-001',
    name: 'Alex Vance',
    email: 'alex.vance@t2courier.com',
    phone: '+1 (555) 777-8899',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rating: 4.92,
    completedDeliveries: 148,
    status: 'AVAILABLE',
    vehicleType: 'MOTORCYCLE',
    vehiclePlate: 'T2-778-CA',
    vehicleModel: 'Honda Super Cub 125',
    createdAt: '2024-01-15T08:00:00.000Z',
  };

  private async simulateDelay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- Auth API ---
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await this.simulateDelay(200);

    if (!credentials.email || !credentials.pin) {
      throw new Error('Email and PIN are required');
    }

    const session: AuthSession = {
      token: `t2-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      courier: this.profile,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    return session;
  }

  async logout(): Promise<void> {
    await this.simulateDelay(100);
  }

  async validateSession(token: string): Promise<AuthSession | null> {
    await this.simulateDelay(100);
    if (!token) return null;
    return {
      token,
      courier: this.profile,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
  }

  // --- Delivery API ---
  async getAvailableJobs(): Promise<DeliveryJob[]> {
    await this.simulateDelay(200);
    return this.jobs.filter((j) => j.status === 'ASSIGNED');
  }

  async getJobById(jobId: string): Promise<DeliveryJob | null> {
    await this.simulateDelay(150);
    const job = this.jobs.find((j) => j.id === jobId);
    return job ? JSON.parse(JSON.stringify(job)) : null;
  }

  async getActiveJob(courierId: string): Promise<DeliveryJob | null> {
    await this.simulateDelay(150);
    const activeJob = this.jobs.find(
      (j) =>
        j.courierId === courierId &&
        ['ACCEPTED', 'PICKED_UP', 'DELIVERING'].includes(j.status)
    );
    return activeJob ? JSON.parse(JSON.stringify(activeJob)) : null;
  }

  async acceptJob(jobId: string, courierId: string): Promise<DeliveryJob> {
    await this.simulateDelay(200);
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'ASSIGNED') {
      throw new Error(`Job ${jobId} is no longer available`);
    }

    job.status = 'ACCEPTED';
    job.courierId = courierId;
    job.acceptedAt = new Date().toISOString();
    this.profile.status = 'ON_DELIVERY';

    return JSON.parse(JSON.stringify(job));
  }

  async updateJobStatus(jobId: string, status: DeliveryStatus): Promise<DeliveryJob> {
    await this.simulateDelay(200);
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const allowedNext = VALID_TRANSITIONS[job.status] || [];
    if (!allowedNext.includes(status)) {
      throw new Error(
        `Invalid status transition from ${job.status} to ${status}. Allowed next states: ${allowedNext.join(', ')}`
      );
    }

    const now = new Date().toISOString();
    job.status = status;

    if (status === 'PICKED_UP') {
      job.pickedUpAt = now;
    } else if (status === 'DELIVERED') {
      job.deliveredAt = now;
      this.profile.completedDeliveries += 1;
      this.profile.status = 'AVAILABLE';
    }

    return JSON.parse(JSON.stringify(job));
  }

  // --- Profile API ---
  async getCourierProfile(courierId: string): Promise<CourierProfile> {
    await this.simulateDelay(150);
    return JSON.parse(JSON.stringify(this.profile));
  }

  async getCourierMetrics(courierId: string): Promise<CourierMetrics> {
    await this.simulateDelay(150);
    const activeJob = await this.getActiveJob(courierId);
    return {
      todayEarnings: 84.70,
      todayCompletedCount: 5,
      activeJobId: activeJob?.id,
      acceptanceRatePercentage: 96,
    };
  }

  async updateStatus(
    courierId: string,
    status: CourierProfile['status']
  ): Promise<CourierProfile> {
    await this.simulateDelay(200);
    this.profile.status = status;
    return JSON.parse(JSON.stringify(this.profile));
  }
}

export const mockApiClient = new MockApiClient();
export const deliveryApi: IDeliveryApi = mockApiClient;
export const authApi: IAuthApi = mockApiClient;
export const profileApi: IProfileApi = mockApiClient;

import { DeliveryJob, DeliveryStatus, CourierProfile, AuthSession, LoginCredentials, CourierMetrics } from '@/types';

export interface IDeliveryApi {
  getAvailableJobs(): Promise<DeliveryJob[]>;
  getJobById(jobId: string): Promise<DeliveryJob | null>;
  getActiveJob(courierId: string): Promise<DeliveryJob | null>;
  acceptJob(jobId: string, courierId: string): Promise<DeliveryJob>;
  updateJobStatus(jobId: string, status: DeliveryStatus): Promise<DeliveryJob>;
}

export interface IAuthApi {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  validateSession(token: string): Promise<AuthSession | null>;
}

export interface IProfileApi {
  getCourierProfile(courierId: string): Promise<CourierProfile>;
  getCourierMetrics(courierId: string): Promise<CourierMetrics>;
  updateStatus(courierId: string, status: CourierProfile['status']): Promise<CourierProfile>;
}

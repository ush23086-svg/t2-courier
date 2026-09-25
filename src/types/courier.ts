export type CourierStatus = 'OFFLINE' | 'AVAILABLE' | 'ON_DELIVERY';

export type VehicleType = 'BICYCLE' | 'SCOOTER' | 'MOTORCYCLE' | 'CAR' | 'VAN';

export interface CourierProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  rating: number;
  completedDeliveries: number;
  status: CourierStatus;
  vehicleType: VehicleType;
  vehiclePlate?: string;
  vehicleModel?: string;
  createdAt: string;
}

export interface CourierMetrics {
  todayEarnings: number;
  todayCompletedCount: number;
  activeJobId?: string;
  acceptanceRatePercentage: number;
}

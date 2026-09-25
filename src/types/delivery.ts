export type DeliveryStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  instructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface PickupInfo {
  locationName: string;
  address: Address;
  contactPerson: string;
  contactPhone: string;
  instructions?: string;
  estimatedPickupTime: string;
}

export interface DeliveryInfo {
  address: Address;
  customer: Customer;
  instructions?: string;
  estimatedDeliveryTime: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  notes?: string;
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  courierId?: string;
  pickup: PickupInfo;
  delivery: DeliveryInfo;
  items: DeliveryItem[];
  totalEarnings: number;
  currency: string;
  distanceKm: number;
  estimatedDurationMins: number;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  specialNotes?: string;
}

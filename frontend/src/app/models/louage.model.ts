export type VehicleStatus = 'BOARDING' | 'FREE' | 'FULL' | 'DEPARTED';

export interface Vehicle {
  id: string;
  matricule: string;          // e.g. "198 تونس 4521"
  driverName: string;         // e.g. "Ammi Salah" / "عمّي صالح"
  destination: string;        // e.g. "Sousse"
  destinationAr: string;      // e.g. "سوسة"
  status: VehicleStatus;
  totalSeats: number;         // 8 seats standard in Tunisian Louage
  occupiedSeats: number;      // 0 - 8
  departureTime: string;      // e.g. "14:25"
  stationId: string;          // e.g. "bab-alioua"
  positionInQueue: number;
  lastUpdated: number;        // timestamp in ms
}

export interface RouteFare {
  id: string;
  fromStationId: string;
  destination: string;
  destinationAr: string;
  fareTnd: number;            // e.g. 5.500
  estimatedDurationMin: number;
  distanceKm: number;
  frequencyMinutes: number;
  activeLouagesCount: number;
  isPopular?: boolean;
}

export interface Station {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  address: string;
  operatingHours: string;
  phone: string;
  latitude: number;
  longitude: number;
  destinations: string[];
  destinationsAr: string[];
}

export interface OfflineAction {
  id: string;
  type: 'UPDATE_SEATS' | 'REORDER_QUEUE' | 'DEPART_VEHICLE' | 'JOIN_QUEUE';
  payload: any;
  timestamp: number;
  synced: boolean;
}

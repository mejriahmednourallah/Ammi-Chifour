import { Injectable, signal, computed } from '@angular/core';
import { Vehicle, RouteFare, Station } from '../models/louage.model';
import { OfflineQueueService } from '../services/offline-queue.service';

export const TUNISIAN_STATIONS: Station[] = [
  {
    id: 'bab-alioua',
    name: 'Gare Louage Bab Alioua (Tunis Sud)',
    nameAr: 'محطة لواج باب عليوة (تونس الجنوبية)',
    city: 'Tunis',
    cityAr: 'تونس',
    address: 'Place Bab Alioua, Avenue Moncef Bey, Tunis',
    operatingHours: '04:30 - 22:30 (7j/7)',
    phone: '+216 71 391 220',
    latitude: 36.7865,
    longitude: 10.1812,
    destinations: ['Sousse', 'Sfax', 'Kairouan', 'Monastir', 'Mahdia', 'Gabès', 'Médenine', 'El Jem'],
    destinationsAr: ['سوسة', 'صفاقس', 'القيروان', 'المنستير', 'المهدية', 'قابس', 'مدنين', 'الجم']
  },
  {
    id: 'bab-saadoun',
    name: 'Gare Louage Bab Saadoun (Tunis Nord)',
    nameAr: 'محطة لواج باب سعدون (تونس الشمالية)',
    city: 'Tunis',
    cityAr: 'تونس',
    address: 'Place Bab Saadoun, Boulevard 9 Avril, Tunis',
    operatingHours: '05:00 - 22:00 (7j/7)',
    phone: '+216 71 560 310',
    latitude: 36.8089,
    longitude: 10.1584,
    destinations: ['Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Tabarka', 'Siliana', 'Mateur'],
    destinationsAr: ['بنزرت', 'باجة', 'جندوبة', 'الكاف', 'طبرقة', 'سليانة', 'ماطر']
  },
  {
    id: 'moncef-bey',
    name: 'Gare Louage Moncef Bey (Cap Bon)',
    nameAr: 'محطة لواج منصف باي (الوطن القبلي)',
    city: 'Tunis',
    cityAr: 'تونس',
    address: 'Rue d\'Italie / Avenue Moncef Bey, Tunis',
    operatingHours: '05:30 - 21:30 (7j/7)',
    phone: '+216 71 345 880',
    latitude: 36.7942,
    longitude: 10.1856,
    destinations: ['Nabeul', 'Hammamet', 'Kélibia', 'Menzel Temime', 'Zaghouan', 'Grombalia'],
    destinationsAr: ['نابل', 'الحمامات', 'قليبية', 'منزل تميم', 'زغوان', 'قرمبالية']
  },
  {
    id: 'sousse-sud',
    name: 'Gare Louage Sousse Sud (Bab Jdid)',
    nameAr: 'محطة لواج سوسة الجنوبية (باب جديد)',
    city: 'Sousse',
    cityAr: 'سوسة',
    address: 'Avenue Léopold Senghor, Sousse',
    operatingHours: '05:00 - 22:00 (7j/7)',
    phone: '+216 73 224 110',
    latitude: 35.8245,
    longitude: 10.6346,
    destinations: ['Tunis', 'Sfax', 'Kairouan', 'Monastir', 'Mahdia'],
    destinationsAr: ['تونس', 'صفاقس', 'القيروان', 'المنستير', 'المهدية']
  },
  {
    id: 'sfax-elghorba',
    name: 'Gare Louage Sfax (Sidi Mansour / El Ghorba)',
    nameAr: 'محطة لواج صفاقس (الغربة / سيدي منصور)',
    city: 'Sfax',
    cityAr: 'صفاقس',
    address: 'Route de Gabès Km 1.5, Sfax',
    operatingHours: '04:30 - 23:00 (7j/7)',
    phone: '+216 74 402 700',
    latitude: 34.7304,
    longitude: 10.7482,
    destinations: ['Tunis', 'Sousse', 'Gabès', 'Kairouan', 'Gafsa', 'Zarzis'],
    destinationsAr: ['تونس', 'سوسة', 'قابس', 'القيروان', 'قفصة', 'جرجيس']
  }
];

export const INITIAL_FARES: RouteFare[] = [
  {
    id: 'fare_tunis_sousse',
    fromStationId: 'bab-alioua',
    destination: 'Sousse',
    destinationAr: 'سوسة',
    fareTnd: 12.200,
    estimatedDurationMin: 95,
    distanceKm: 142,
    frequencyMinutes: 10,
    activeLouagesCount: 14,
    isPopular: true
  },
  {
    id: 'fare_tunis_sfax',
    fromStationId: 'bab-alioua',
    destination: 'Sfax',
    destinationAr: 'صفاقس',
    fareTnd: 22.800,
    estimatedDurationMin: 180,
    distanceKm: 270,
    frequencyMinutes: 15,
    activeLouagesCount: 9,
    isPopular: true
  },
  {
    id: 'fare_tunis_kairouan',
    fromStationId: 'bab-alioua',
    destination: 'Kairouan',
    destinationAr: 'القيروان',
    fareTnd: 13.500,
    estimatedDurationMin: 110,
    distanceKm: 155,
    frequencyMinutes: 20,
    activeLouagesCount: 6,
    isPopular: true
  },
  {
    id: 'fare_tunis_monastir',
    fromStationId: 'bab-alioua',
    destination: 'Monastir',
    destinationAr: 'المنستير',
    fareTnd: 13.800,
    estimatedDurationMin: 115,
    distanceKm: 165,
    frequencyMinutes: 25,
    activeLouagesCount: 5,
    isPopular: false
  },
  {
    id: 'fare_tunis_bizerte',
    fromStationId: 'bab-saadoun',
    destination: 'Bizerte',
    destinationAr: 'بنزرت',
    fareTnd: 6.800,
    estimatedDurationMin: 55,
    distanceKm: 65,
    frequencyMinutes: 8,
    activeLouagesCount: 18,
    isPopular: true
  },
  {
    id: 'fare_tunis_nabeul',
    fromStationId: 'moncef-bey',
    destination: 'Nabeul',
    destinationAr: 'نابل',
    fareTnd: 6.200,
    estimatedDurationMin: 60,
    distanceKm: 68,
    frequencyMinutes: 12,
    activeLouagesCount: 11,
    isPopular: true
  },
  {
    id: 'fare_tunis_hammamet',
    fromStationId: 'moncef-bey',
    destination: 'Hammamet',
    destinationAr: 'الحمامات',
    fareTnd: 5.500,
    estimatedDurationMin: 50,
    distanceKm: 62,
    frequencyMinutes: 15,
    activeLouagesCount: 8,
    isPopular: true
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-101',
    matricule: '215 تونس 8841',
    driverName: 'Ammi Hedi (عمّي الهادي)',
    destination: 'Sousse',
    destinationAr: 'سوسة',
    status: 'BOARDING',
    totalSeats: 8,
    occupiedSeats: 6,
    departureTime: '14:20',
    stationId: 'bab-alioua',
    positionInQueue: 1,
    lastUpdated: Date.now() - 3000
  },
  {
    id: 'veh-102',
    matricule: '189 تونس 4310',
    driverName: 'Chifour Salah (صالح القروي)',
    destination: 'Sousse',
    destinationAr: 'سوسة',
    status: 'FREE',
    totalSeats: 8,
    occupiedSeats: 0,
    departureTime: '14:35',
    stationId: 'bab-alioua',
    positionInQueue: 2,
    lastUpdated: Date.now() - 15000
  },
  {
    id: 'veh-103',
    matricule: '230 تونس 1904',
    driverName: 'Ammi Moncef (عمّي منصف)',
    destination: 'Sousse',
    destinationAr: 'سوسة',
    status: 'FREE',
    totalSeats: 8,
    occupiedSeats: 0,
    departureTime: '14:50',
    stationId: 'bab-alioua',
    positionInQueue: 3,
    lastUpdated: Date.now() - 25000
  },
  {
    id: 'veh-201',
    matricule: '194 تونس 7622',
    driverName: 'Chifour Kamel (كمال الصفاقسي)',
    destination: 'Sfax',
    destinationAr: 'صفاقس',
    status: 'BOARDING',
    totalSeats: 8,
    occupiedSeats: 4,
    departureTime: '14:30',
    stationId: 'bab-alioua',
    positionInQueue: 1,
    lastUpdated: Date.now() - 8000
  },
  {
    id: 'veh-202',
    matricule: '208 تونس 5519',
    driverName: 'Si Ridha (سي رضا)',
    destination: 'Sfax',
    destinationAr: 'صفاقس',
    status: 'FREE',
    totalSeats: 8,
    occupiedSeats: 0,
    departureTime: '14:55',
    stationId: 'bab-alioua',
    positionInQueue: 2,
    lastUpdated: Date.now() - 40000
  },
  {
    id: 'veh-301',
    matricule: '182 تونس 3998',
    driverName: 'Ammi Habib (عمّي الحبيب)',
    destination: 'Kairouan',
    destinationAr: 'القيروان',
    status: 'BOARDING',
    totalSeats: 8,
    occupiedSeats: 7,
    departureTime: '14:15',
    stationId: 'bab-alioua',
    positionInQueue: 1,
    lastUpdated: Date.now() - 4000
  },
  {
    id: 'veh-401',
    matricule: '221 تونس 6120',
    driverName: 'Chifour Tarek (طارق المستيري)',
    destination: 'Monastir',
    destinationAr: 'المنستير',
    status: 'FREE',
    totalSeats: 8,
    occupiedSeats: 2,
    departureTime: '14:40',
    stationId: 'bab-alioua',
    positionInQueue: 1,
    lastUpdated: Date.now() - 12000
  }
];

@Injectable({
  providedIn: 'root'
})
export class BoardStore {
  // State signals
  readonly currentStationId = signal<string>('bab-alioua');
  readonly selectedDestinationFilter = signal<string>('All');
  readonly vehicles = signal<Vehicle[]>(INITIAL_VEHICLES);
  readonly fares = signal<RouteFare[]>(INITIAL_FARES);
  readonly stations = signal<Station[]>(TUNISIAN_STATIONS);
  readonly isLoading = signal<boolean>(false);
  readonly isConnected = signal<boolean>(false);
  readonly lastMessageTimestamp = signal<number>(Date.now());
  readonly favorites = signal<string[]>(['Sousse', 'Bizerte']);

  // Undo memory stack for staff actions
  private undoSnapshot: Vehicle[] | null = null;

  // Stream references
  private eventSource: EventSource | null = null;
  private simulatorTimer: any = null;
  private visibilityListener: (() => void) | null = null;

  constructor(private offlineQueue: OfflineQueueService) {
    this.setupVisibilityListener();
  }

  // Computed signals
  readonly currentStation = computed(() => {
    return this.stations().find(s => s.id === this.currentStationId()) || this.stations()[0];
  });

  readonly availableDestinations = computed(() => {
    const list = ['All'];
    const station = this.currentStation();
    if (station) {
      list.push(...station.destinations);
    }
    return list;
  });

  readonly filteredVehicles = computed(() => {
    const stId = this.currentStationId();
    const filter = this.selectedDestinationFilter();
    let list = this.vehicles().filter(v => v.stationId === stId && v.status !== 'DEPARTED');

    if (filter !== 'All') {
      list = list.filter(v => v.destination.toLowerCase() === filter.toLowerCase());
    }
    return list.sort((a, b) => a.positionInQueue - b.positionInQueue);
  });

  readonly heroBoardingVehicle = computed(() => {
    const list = this.filteredVehicles();
    const boarding = list.find(v => v.status === 'BOARDING');
    return boarding || list[0] || null;
  });

  readonly queueVehicles = computed(() => {
    const hero = this.heroBoardingVehicle();
    const list = this.filteredVehicles();
    if (!hero) return list;
    return list.filter(v => v.id !== hero.id);
  });

  readonly favoriteFares = computed(() => {
    const favs = this.favorites();
    return this.fares().filter(f => favs.includes(f.destination));
  });

  // Connect stream for station
  connect(stationId: string) {
    this.currentStationId.set(stationId);
    this.isLoading.set(true);

    this.disconnectStream();

    // In a full backend deployment: const streamUrl = `/api/stations/${stationId}/stream`;
    // We attempt EventSource and fall back to our high-fidelity real-time simulation engine
    try {
      const streamUrl = `/api/stations/${stationId}/stream`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.isConnected.set(true);
        this.isLoading.set(false);
        this.lastMessageTimestamp.set(Date.now());
      };

      this.eventSource.onmessage = (event) => {
        this.lastMessageTimestamp.set(Date.now());
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            this.vehicles.set(data);
          }
        } catch (e) {
          console.warn('Invalid SSE payload:', e);
        }
      };

      this.eventSource.onerror = () => {
        // Fallback to internal simulation engine
        this.disconnectEventSourceOnly();
        this.startSimulationEngine();
      };
    } catch {
      this.startSimulationEngine();
    }

    // Safety timeout to disable skeleton loader if initial connect is delayed
    setTimeout(() => {
      this.isLoading.set(false);
    }, 450);
  }

  disconnect() {
    this.disconnectStream();
  }

  private disconnectStream() {
    this.disconnectEventSourceOnly();
    if (this.simulatorTimer) {
      clearInterval(this.simulatorTimer);
      this.simulatorTimer = null;
    }
    this.isConnected.set(false);
  }

  private disconnectEventSourceOnly() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Tab hidden pause handling
  private setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      this.visibilityListener = () => {
        if (document.visibilityState === 'hidden') {
          // Pause stream when tab is hidden
          this.disconnect();
        } else if (document.visibilityState === 'visible') {
          // Reconnect when tab becomes active again
          this.connect(this.currentStationId());
        }
      };
      document.addEventListener('visibilitychange', this.visibilityListener);
    }
  }

  // Realistic simulation engine for live louage updates
  private startSimulationEngine() {
    this.isConnected.set(true);
    this.isLoading.set(false);
    this.lastMessageTimestamp.set(Date.now());

    if (this.simulatorTimer) clearInterval(this.simulatorTimer);

    // Live tick every 7 seconds simulates boarding passengers arriving at Bab Alioua
    this.simulatorTimer = setInterval(() => {
      this.lastMessageTimestamp.set(Date.now());

      // Find an active boarding vehicle and occasionally increment passenger
      this.vehicles.update((current) => {
        return current.map((v) => {
          if (v.status === 'BOARDING' && v.occupiedSeats < 8 && Math.random() > 0.45) {
            const newCount = v.occupiedSeats + 1;
            return {
              ...v,
              occupiedSeats: newCount,
              status: newCount === 8 ? 'FULL' : 'BOARDING',
              lastUpdated: Date.now()
            };
          }
          return v;
        });
      });
    }, 7000);
  }

  // Filter selection
  setDestinationFilter(dest: string) {
    this.selectedDestinationFilter.set(dest);
  }

  setStation(stationId: string) {
    this.connect(stationId);
  }

  // Manual pull-to-refresh
  async refreshManually() {
    this.isLoading.set(true);
    await new Promise(r => setTimeout(r, 600));
    this.lastMessageTimestamp.set(Date.now());
    this.isLoading.set(false);
  }

  // Staff operations: Seat modification
  saveSnapshot() {
    this.undoSnapshot = JSON.parse(JSON.stringify(this.vehicles()));
  }

  updateHeroSeats(delta: number): { success: boolean; vehicle: Vehicle | null } {
    const hero = this.heroBoardingVehicle();
    if (!hero) return { success: false, vehicle: null };

    const newSeats = hero.occupiedSeats + delta;
    if (newSeats < 0 || newSeats > 8) return { success: false, vehicle: hero };

    this.saveSnapshot();

    const newStatus: Vehicle['status'] = newSeats === 8 ? 'FULL' : 'BOARDING';

    this.vehicles.update((list) =>
      list.map((v) => {
        if (v.id === hero.id) {
          return {
            ...v,
            occupiedSeats: newSeats,
            status: newStatus,
            lastUpdated: Date.now()
          };
        }
        return v;
      })
    );

    this.lastMessageTimestamp.set(Date.now());

    // Record offline or online action
    this.offlineQueue.queueAction('UPDATE_SEATS', {
      vehicleId: hero.id,
      occupiedSeats: newSeats,
      delta
    });

    const updated = this.vehicles().find((v) => v.id === hero.id) || null;
    return { success: true, vehicle: updated };
  }

  // Reorder queue (drag and drop)
  reorderQueue(fromIndex: number, toIndex: number) {
    this.saveSnapshot();
    const hero = this.heroBoardingVehicle();
    const queue = [...this.queueVehicles()];

    const [moved] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, moved);

    // Reassign queue positions starting after hero
    const updatedQueue = queue.map((v, idx) => ({
      ...v,
      positionInQueue: (hero ? hero.positionInQueue : 0) + idx + 1,
      lastUpdated: Date.now()
    }));

    this.vehicles.update((current) => {
      const heroList = hero ? [hero] : [];
      const others = current.filter(
        (v) => v.stationId !== this.currentStationId() || (hero && v.id === hero.id)
      );
      return [...others, ...updatedQueue];
    });

    // Maps directly to POST /queue/{id}/move
    this.offlineQueue.queueAction('REORDER_QUEUE', {
      vehicleId: moved.id,
      fromIndex,
      toIndex,
      newPosition: (hero ? hero.positionInQueue : 0) + toIndex + 1
    });

    this.lastMessageTimestamp.set(Date.now());
  }

  // Depart vehicle
  departHeroVehicle(): boolean {
    const hero = this.heroBoardingVehicle();
    if (!hero) return false;

    this.saveSnapshot();

    // Mark current hero as DEPARTED, and promote the next vehicle in queue for this destination to BOARDING!
    this.vehicles.update((current) => {
      let promoted = false;
      return current.map((v) => {
        if (v.id === hero.id) {
          return { ...v, status: 'DEPARTED', lastUpdated: Date.now() };
        }
        if (!promoted && v.stationId === hero.stationId && v.destination === hero.destination && v.status !== 'DEPARTED') {
          promoted = true;
          return {
            ...v,
            status: 'BOARDING',
            positionInQueue: 1,
            lastUpdated: Date.now()
          };
        }
        return v;
      });
    });

    this.offlineQueue.queueAction('DEPART_VEHICLE', { vehicleId: hero.id });
    this.lastMessageTimestamp.set(Date.now());
    return true;
  }

  // Add new vehicle to queue
  joinQueue(matricule: string, driverName: string, destination: string, destinationAr: string) {
    this.saveSnapshot();

    const maxPos = this.filteredVehicles().reduce((max, v) => Math.max(max, v.positionInQueue), 0);
    const newVehicle: Vehicle = {
      id: 'veh_' + Date.now(),
      matricule,
      driverName,
      destination,
      destinationAr,
      status: 'FREE',
      totalSeats: 8,
      occupiedSeats: 0,
      departureTime: new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stationId: this.currentStationId(),
      positionInQueue: maxPos + 1,
      lastUpdated: Date.now()
    };

    this.vehicles.update(list => [...list, newVehicle]);
    this.offlineQueue.queueAction('JOIN_QUEUE', newVehicle);
    this.lastMessageTimestamp.set(Date.now());
  }

  // Remove vehicle from queue (swipe action)
  removeFromQueue(vehicleId: string) {
    this.saveSnapshot();
    this.vehicles.update(list => list.filter(v => v.id !== vehicleId));
    this.lastMessageTimestamp.set(Date.now());
  }

  // Undo operation (within 5 seconds)
  undoLastAction(): boolean {
    if (this.undoSnapshot) {
      this.vehicles.set(this.undoSnapshot);
      this.undoSnapshot = null;
      this.lastMessageTimestamp.set(Date.now());
      return true;
    }
    return false;
  }

  // Toggle favorite destination
  toggleFavorite(destination: string) {
    this.favorites.update(favs => {
      if (favs.includes(destination)) {
        return favs.filter(d => d !== destination);
      } else {
        return [...favs, destination];
      }
    });
  }

  isFavorite(destination: string): boolean {
    return this.favorites().includes(destination);
  }
}

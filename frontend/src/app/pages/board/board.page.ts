import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonButton,
  ModalController
} from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { BoardStore } from '../../stores/board.store';
import { BoardingCardComponent } from '../../components/boarding-card/boarding-card.component';
import { FreshnessIndicatorComponent } from '../../components/freshness-indicator/freshness-indicator.component';
import { SeatDotsComponent } from '../../components/seat-dots/seat-dots.component';
import { StationDetailsModalComponent } from '../../components/station-details-modal/station-details-modal.component';
import { Vehicle } from '../../models/louage.model';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  informationCircleOutline,
  chevronDownCircleOutline,
  timeOutline,
  personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonButton,
    BoardingCardComponent,
    FreshnessIndicatorComponent,
    SeatDotsComponent
  ],
  template: `
    <ion-content class="board-content" [scrollEvents]="true">
      <!-- Pull to refresh -->
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content
          pullingIcon="chevron-down-circle-outline"
          [pullingText]="lang.t().pullToRefresh"
          refreshingSpinner="crescent">
        </ion-refresher-content>
      </ion-refresher>

      <div class="board-container ion-padding">
        <!-- Station Header -->
        <div class="station-header">
          <div class="station-name-block">
            <h2 class="station-title">
              {{ lang.isRtl()
                ? boardStore.currentStation().nameAr
                : boardStore.currentStation().name }}
            </h2>
            <ion-button fill="clear" size="small" class="info-link" (click)="openStationDetails()">
              <ion-icon slot="start" name="information-circle-outline"></ion-icon>
              {{ lang.t().stationDetails }}
            </ion-button>
          </div>
          <app-freshness-indicator [lastTimestamp]="boardStore.lastMessageTimestamp()"></app-freshness-indicator>
        </div>

        <!-- Destination Chips (scrollable ion-segment) -->
        <div class="destination-segment-wrapper">
          <ion-segment
            [value]="boardStore.selectedDestinationFilter()"
            (ionChange)="onDestinationChange($event)"
            [scrollable]="true"
            mode="md"
            class="dest-segment">
            @for (dest of boardStore.availableDestinations(); track dest) {
              <ion-segment-button [value]="dest">
                <ion-label>{{ dest === 'All' ? lang.t().allDestinations : dest }}</ion-label>
              </ion-segment-button>
            }
          </ion-segment>
        </div>

        <!-- Skeleton Loader while loading -->
        @if (boardStore.isLoading()) {
          <div class="skeleton-block">
            <ion-skeleton-text [animated]="true" style="width: 100%; height: 160px; border-radius: 14px;"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 100%; height: 60px; border-radius: 10px; margin-top: 10px;"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 100%; height: 60px; border-radius: 10px; margin-top: 10px;"></ion-skeleton-text>
          </div>
        } @else {
          <!-- Hero Boarding Card -->
          @if (boardStore.heroBoardingVehicle(); as hero) {
            <app-boarding-card
              [vehicle]="hero"
              [showDetailsButton]="true"
              (detailsClicked)="openStationDetails()">
            </app-boarding-card>
          } @else {
            <div class="empty-state">
              <p>{{ lang.isRtl()
                ? 'ما فمّا حتى لوّاج في الطابور حالياً'
                : 'Aucun louage en attente pour cette destination' }}</p>
            </div>
          }

          <!-- Queue List -->
          @if (boardStore.queueVehicles().length > 0) {
            <h3 class="queue-heading">
              {{ lang.t().waitingQueue }}
              <span class="queue-count tabular-nums">{{ boardStore.queueVehicles().length }}</span>
            </h3>

            <ion-list lines="none" class="queue-list">
              @for (vehicle of boardStore.queueVehicles(); track vehicle.id) {
                <ion-item-sliding>
                  <ion-item class="queue-item" (click)="selectVehicle(vehicle)">
                    <div class="queue-item-inner">
                      <div class="queue-left">
                        <span class="queue-pos tabular-nums">#{{ vehicle.positionInQueue }}</span>
                        <div class="queue-details">
                          <span class="queue-dest">
                            {{ lang.isRtl() ? vehicle.destinationAr : vehicle.destination }}
                          </span>
                          <span class="queue-driver">
                            <ion-icon name="person-outline"></ion-icon>
                            {{ vehicle.driverName }}
                          </span>
                        </div>
                      </div>

                      <div class="queue-right">
                        <app-seat-dots [occupied]="vehicle.occupiedSeats" [compact]="true"></app-seat-dots>
                        <div class="queue-meta">
                          <ion-badge [color]="getStatusColor(vehicle)" class="mini-badge">
                            {{ getStatusLabel(vehicle) }}
                          </ion-badge>
                          <span class="queue-time tabular-nums">
                            <ion-icon name="time-outline"></ion-icon>
                            {{ vehicle.departureTime }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ion-item>

                  <!-- Swipe actions -->
                  <ion-item-options side="end">
                    <ion-item-option color="danger" (click)="removeVehicle(vehicle.id)">
                      <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                    </ion-item-option>
                  </ion-item-options>
                </ion-item-sliding>
              }
            </ion-list>
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .board-content {
      --background: var(--ion-background-color);
    }

    .board-container {
      padding-top: 8px;
    }

    .station-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .station-title {
      margin: 0 0 2px 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: #1A1A1A;
      letter-spacing: -0.3px;
    }

    .info-link {
      --color: #797670;
      font-size: 0.8rem;
      font-weight: 600;
      --padding-start: 0;
      --padding-end: 0;
      margin: 0;
      height: auto;
    }

    .destination-segment-wrapper {
      margin-bottom: 10px;
    }

    .dest-segment {
      --background: transparent;
    }

    .dest-segment ion-segment-button {
      --background: #ECEAE4;
      --background-checked: #1A1A1A;
      --color: #55534E;
      --color-checked: #FFFFFF;
      --indicator-color: transparent;
      --border-radius: 20px;
      --margin-start: 4px;
      --margin-end: 4px;
      min-width: auto;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: none;
      min-height: 32px;
    }

    .skeleton-block {
      padding: 8px 0;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #797670;
      font-size: 0.95rem;
    }

    .queue-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 16px 0 10px 0;
    }

    .queue-count {
      font-size: 0.8rem;
      padding: 2px 8px;
      background: #ECEAE4;
      border-radius: 12px;
      color: #55534E;
      font-weight: 700;
    }

    .queue-list {
      background: transparent;
      padding: 0;
    }

    .queue-item {
      --background: #FFFFFF;
      --border-radius: 12px;
      --padding-start: 12px;
      --padding-end: 12px;
      --inner-padding-end: 0;
      margin-bottom: 8px;
      border: 1px solid var(--app-border);
      border-radius: 12px;
      overflow: hidden;
    }

    .queue-item-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 10px 0;
    }

    .queue-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .queue-pos {
      font-size: 1.1rem;
      font-weight: 800;
      color: #A3A19B;
      min-width: 28px;
      text-align: center;
    }

    .queue-details {
      display: flex;
      flex-direction: column;
    }

    .queue-dest {
      font-size: 1rem;
      font-weight: 700;
      color: #1A1A1A;
    }

    .queue-driver {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #797670;
      font-weight: 500;
      margin-top: 2px;
    }

    .queue-driver ion-icon {
      font-size: 0.85rem;
    }

    .queue-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .queue-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    [dir="rtl"] .queue-meta {
      align-items: flex-start;
    }

    .mini-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .queue-time {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #55534E;
      font-family: 'IBM Plex Mono', monospace;
    }

    .queue-time ion-icon {
      font-size: 0.85rem;
    }
  `]
})
export class BoardPage {
  readonly lang = inject(LanguageService);
  readonly boardStore = inject(BoardStore);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({
      trashOutline,
      informationCircleOutline,
      chevronDownCircleOutline,
      timeOutline,
      personOutline
    });
  }

  // Use Ionic lifecycle to manage SSE stream
  ionViewWillEnter() {
    this.boardStore.connect(this.boardStore.currentStationId());
  }

  ionViewWillLeave() {
    this.boardStore.disconnect();
  }

  onDestinationChange(event: any) {
    const value = event.detail.value;
    if (value) {
      this.boardStore.setDestinationFilter(value);
    }
  }

  async doRefresh(event: any) {
    await this.boardStore.refreshManually();
    event.target.complete();
  }

  async openStationDetails() {
    const station = this.boardStore.currentStation();
    if (!station) return;

    const fares = this.boardStore.fares().filter(f => f.fromStationId === station.id);

    const modal = await this.modalCtrl.create({
      component: StationDetailsModalComponent,
      componentProps: { station, stationFares: fares },
      breakpoints: [0, 0.5, 0.85],
      initialBreakpoint: 0.5,
      cssClass: 'station-modal'
    });
    await modal.present();
  }

  selectVehicle(vehicle: Vehicle) {
    // Could expand to detail view; for now just highlight
  }

  removeVehicle(vehicleId: string) {
    this.boardStore.removeFromQueue(vehicleId);
  }

  getStatusColor(vehicle: Vehicle): string {
    if (vehicle.status === 'BOARDING') return 'boarding';
    if (vehicle.status === 'FULL') return 'full';
    return 'free';
  }

  getStatusLabel(vehicle: Vehicle): string {
    const t = this.lang.t();
    if (vehicle.status === 'BOARDING') return t.boarding;
    if (vehicle.status === 'FULL') return t.full;
    return t.available;
  }
}

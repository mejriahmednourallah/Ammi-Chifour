import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonButton
} from '@ionic/angular';
import { Vehicle } from '../../models/louage.model';
import { SeatDotsComponent } from '../seat-dots/seat-dots.component';
import { LanguageService } from '../../services/language.service';
import { addIcons } from 'ionicons';
import { timeOutline, personOutline, carSportOutline, chevronForwardOutline, informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-boarding-card',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonBadge,
    IonIcon,
    IonButton,
    SeatDotsComponent
  ],
  template: `
    <ion-card class="boarding-card" [class.full-vehicle]="vehicle.occupiedSeats === 8">
      <div class="top-status-bar">
        <ion-badge [color]="badgeColor" class="status-badge">
          <span class="status-indicator-dot"></span>
          {{ statusLabel }}
        </ion-badge>

        <div class="departure-pill">
          <ion-icon name="time-outline" class="pill-icon"></ion-icon>
          <span class="departure-time">{{ vehicle.departureTime }}</span>
        </div>
      </div>

      <ion-card-header class="card-header-clean">
        <div class="destination-row">
          <div class="dest-block">
            <span class="station-sub">{{ lang.t().departureScheduled }}</span>
            <h2 class="destination-title">
              {{ lang.isRtl() ? vehicle.destinationAr : vehicle.destination }}
            </h2>
          </div>
          <div class="matricule-plate">
            <span class="plate-code mono-code">{{ vehicle.matricule }}</span>
          </div>
        </div>
      </ion-card-header>

      <ion-card-content class="card-body-clean">
        <div class="seat-occupancy-row">
          <div class="seat-visual">
            <app-seat-dots [occupied]="vehicle.occupiedSeats"></app-seat-dots>
          </div>

          <div class="seat-numbers">
            <div class="count-big tabular-nums">
              <span class="occupied">{{ vehicle.occupiedSeats }}</span>
              <span class="divider">/</span>
              <span class="total">8</span>
            </div>
            <div class="remaining-text">
              @if (remainingSeats > 0) {
                <span class="places-free">{{ remainingSeats }} {{ lang.t().seatsRemaining }}</span>
              } @else {
                <span class="places-full">{{ lang.t().full }}</span>
              }
            </div>
          </div>
        </div>

        <div class="driver-info-bar">
          <div class="driver-tag">
            <ion-icon name="person-outline"></ion-icon>
            <span>{{ vehicle.driverName }}</span>
          </div>

          @if (showDetailsButton) {
            <ion-button fill="clear" size="small" (click)="detailsClicked.emit(vehicle)" class="info-btn">
              <ion-icon slot="start" name="information-circle-outline"></ion-icon>
              {{ lang.t().stationDetails }}
            </ion-button>
          }
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .boarding-card {
      margin: 12px 0 16px 0;
      border: 2px solid var(--ion-color-boarding);
      background: #FFFFFF;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(242, 183, 5, 0.15), 0 1px 3px rgba(0,0,0,0.06);
    }

    .boarding-card.full-vehicle {
      border-color: var(--ion-color-full);
      box-shadow: 0 4px 12px rgba(179, 64, 42, 0.15), 0 1px 3px rgba(0,0,0,0.06);
    }

    .top-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px 6px 16px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 8px;
      letter-spacing: 0.3px;
    }

    .status-indicator-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }

    .departure-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      background: #ECEAE4;
      border: 1px solid #DEDAD1;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .card-header-clean {
      padding: 6px 16px 8px 16px;
    }

    .destination-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .station-sub {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #797670;
      font-weight: 600;
    }

    .destination-title {
      margin: 2px 0 0 0;
      font-size: 1.7rem;
      font-weight: 800;
      color: #1A1A1A;
      letter-spacing: -0.5px;
    }

    .matricule-plate {
      padding: 4px 8px;
      background: #1A1A1A;
      color: #FFFFFF;
      border-radius: 6px;
      border: 1px solid #000000;
      box-shadow: inset 0 0 2px rgba(255,255,255,0.2);
    }

    .plate-code {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .card-body-clean {
      padding: 8px 16px 14px 16px;
    }

    .seat-occupancy-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: #F9F8F5;
      border: 1px solid #EAE7DD;
      border-radius: 12px;
      margin-bottom: 12px;
    }

    .seat-numbers {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    [dir="rtl"] .seat-numbers {
      align-items: flex-start;
    }

    .count-big {
      font-size: 1.8rem;
      font-weight: 800;
      line-height: 1;
      display: flex;
      align-items: baseline;
      gap: 3px;
    }

    .count-big .occupied {
      color: #1A1A1A;
    }

    .count-big .divider {
      color: #A3A19B;
      font-size: 1.4rem;
    }

    .count-big .total {
      color: #797670;
      font-size: 1.4rem;
    }

    .remaining-text {
      font-size: 0.85rem;
      font-weight: 600;
      margin-top: 4px;
    }

    .places-free {
      color: var(--ion-color-free);
    }

    .places-full {
      color: var(--ion-color-full);
      font-weight: 800;
    }

    .driver-info-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.88rem;
      color: #55534E;
      border-top: 1px solid #EAE7DD;
      padding-top: 8px;
    }

    .driver-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }

    .info-btn {
      --color: #1A1A1A;
      font-weight: 600;
      font-size: 0.82rem;
      margin: 0;
    }
  `]
})
export class BoardingCardComponent {
  @Input({ required: true }) vehicle!: Vehicle;
  @Input() showDetailsButton: boolean = true;
  @Output() detailsClicked = new EventEmitter<Vehicle>();

  readonly lang = inject(LanguageService);

  constructor() {
    addIcons({ timeOutline, personOutline, carSportOutline, chevronForwardOutline, informationCircleOutline });
  }

  get remainingSeats(): number {
    return Math.max(0, 8 - (this.vehicle?.occupiedSeats || 0));
  }

  get badgeColor(): string {
    if (this.vehicle.occupiedSeats === 8 || this.vehicle.status === 'FULL') {
      return 'full';
    }
    if (this.vehicle.status === 'BOARDING') {
      return 'boarding';
    }
    return 'free';
  }

  get statusLabel(): string {
    const t = this.lang.t();
    if (this.vehicle.occupiedSeats === 8 || this.vehicle.status === 'FULL') {
      return t.full;
    }
    if (this.vehicle.status === 'BOARDING') {
      return t.boarding;
    }
    return t.available;
  }
}

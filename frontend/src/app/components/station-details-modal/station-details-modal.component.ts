import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  ModalController
} from '@ionic/angular';
import { Station, RouteFare } from '../../models/louage.model';
import { LanguageService } from '../../services/language.service';
import { addIcons } from 'ionicons';
import { closeOutline, callOutline, locationOutline, timeOutline, cashOutline, speedometerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-station-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ lang.t().stationDetails }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding modal-content">
      @if (station) {
        <div class="station-meta-block">
          <h2 class="st-title">{{ lang.isRtl() ? station.nameAr : station.name }}</h2>
          <p class="st-city">{{ lang.isRtl() ? station.cityAr : station.city }}</p>

          <div class="info-chips">
            <div class="chip-item">
              <ion-icon name="location-outline"></ion-icon>
              <span>{{ station.address }}</span>
            </div>
            <div class="chip-item">
              <ion-icon name="time-outline"></ion-icon>
              <span>{{ station.operatingHours }}</span>
            </div>
            <div class="chip-item">
              <ion-icon name="call-outline"></ion-icon>
              <span>{{ station.phone }}</span>
            </div>
          </div>
        </div>

        <div class="fares-section">
          <h3 class="section-title">
            <ion-icon name="cash-outline"></ion-icon>
            {{ lang.t().officialTariff }}
          </h3>

          <ion-list lines="inset" class="tariff-list">
            @for (fare of stationFares; track fare.id) {
              <ion-item class="tariff-item">
                <ion-label>
                  <h3>{{ lang.isRtl() ? fare.destinationAr : fare.destination }}</h3>
                  <p class="sub-specs tabular-nums">
                    <span>{{ fare.distanceKm }} km</span>
                    <span class="dot">•</span>
                    <span>~{{ fare.estimatedDurationMin }} min</span>
                  </p>
                </ion-label>
                <ion-note slot="end" class="fare-note tabular-nums">
                  {{ fare.fareTnd.toFixed(3) }} TND
                </ion-note>
              </ion-item>
            }
          </ion-list>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .modal-content {
      --background: #FFFFFF;
    }

    .station-meta-block {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #EAE7DD;
    }

    .st-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0 0 4px 0;
    }

    .st-city {
      font-size: 0.95rem;
      color: #797670;
      margin: 0 0 14px 0;
      font-weight: 600;
    }

    .info-chips {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: #4A4A48;
    }

    .chip-item ion-icon {
      font-size: 1.1rem;
      color: #1A1A1A;
    }

    .fares-section {
      margin-top: 10px;
    }

    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1A1A1A;
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0 0 10px 0;
    }

    .tariff-list {
      background: transparent;
      padding: 0;
    }

    .tariff-item {
      --background: #F9F8F5;
      --border-radius: 10px;
      margin-bottom: 8px;
      border: 1px solid #ECEAE4;
    }

    .sub-specs {
      font-size: 0.8rem;
      color: #797670;
    }

    .dot {
      margin: 0 4px;
    }

    .fare-note {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1A1A1A;
    }
  `]
})
export class StationDetailsModalComponent {
  @Input() station!: Station;
  @Input() stationFares: RouteFare[] = [];

  readonly lang = inject(LanguageService);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ closeOutline, callOutline, locationOutline, timeOutline, cashOutline, speedometerOutline });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}

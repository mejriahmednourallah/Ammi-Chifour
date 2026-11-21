import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonBadge,
  IonFab,
  IonFabButton,
  IonList,
  IonItem,
  IonLabel,
  IonReorderGroup,
  IonReorder,
  IonInput,
  IonSelect,
  IonSelectOption,
  AlertController,
  ToastController,
  ModalController
} from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { BoardStore } from '../../stores/board.store';
import { OfflineQueueService } from '../../services/offline-queue.service';
import { BoardingCardComponent } from '../../components/boarding-card/boarding-card.component';
import { FreshnessIndicatorComponent } from '../../components/freshness-indicator/freshness-indicator.component';
import { SeatDotsComponent } from '../../components/seat-dots/seat-dots.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  removeOutline,
  airplaneOutline,
  addCircleOutline,
  reorderThreeOutline,
  cloudOfflineOutline,
  checkmarkCircleOutline,
  personOutline,
  carSportOutline,
  navigateOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
    IonBadge,
    IonFab,
    IonFabButton,
    IonList,
    IonItem,
    IonLabel,
    IonReorderGroup,
    IonReorder,
    IonInput,
    IonSelect,
    IonSelectOption,
    BoardingCardComponent,
    FreshnessIndicatorComponent,
    SeatDotsComponent
  ],
  template: `
    <ion-content class="staff-content ion-padding">
      <div class="staff-screen">
        <!-- Staff Header -->
        <div class="staff-header">
          <div class="staff-title-block">
            <h2 class="staff-station">{{ lang.t().staffStationHeader }}</h2>
            <span class="staff-role">{{ lang.t().staffStationRole }}</span>
          </div>
          <div class="staff-status-row">
            <app-freshness-indicator [lastTimestamp]="boardStore.lastMessageTimestamp()"></app-freshness-indicator>
            @if (!offlineQueue.isOnline()) {
              <ion-badge color="warning" class="offline-badge-staff">
                <ion-icon name="cloud-offline-outline"></ion-icon>
                {{ lang.t().offlineMode }}
              </ion-badge>
            }
          </div>
        </div>

        <!-- Active Boarding Louage (Hero) -->
        <h3 class="section-heading">{{ lang.t().activeBoardingLouage }}</h3>

        @if (boardStore.heroBoardingVehicle(); as hero) {
          <app-boarding-card [vehicle]="hero" [showDetailsButton]="false"></app-boarding-card>

          <!-- Big +1 / -1 Buttons -->
          <div class="seat-controls">
            <ion-button
              expand="block"
              size="large"
              color="primary"
              class="seat-btn minus-btn"
              [disabled]="hero.occupiedSeats <= 0"
              (click)="updateSeats(-1)">
              <ion-icon slot="start" name="remove-outline"></ion-icon>
              {{ lang.t().removeSeat }}
            </ion-button>

            <ion-button
              expand="block"
              size="large"
              color="primary"
              class="seat-btn plus-btn"
              [disabled]="hero.occupiedSeats >= 8"
              (click)="updateSeats(+1)">
              <ion-icon slot="start" name="add-outline"></ion-icon>
              {{ lang.t().addSeat }}
            </ion-button>
          </div>

          <!-- Depart Button -->
          <ion-button
            expand="block"
            fill="outline"
            color="danger"
            class="depart-btn"
            (click)="confirmDepart(hero.occupiedSeats)">
            <ion-icon slot="start" name="airplane-outline"></ion-icon>
            {{ lang.t().confirmDepart }}
          </ion-button>
        } @else {
          <div class="no-boarding">
            <p>{{ lang.isRtl()
              ? 'ما فمّا حتى لوّاج في مرحلة الركوب'
              : 'Aucun louage en embarquement actuellement' }}</p>
          </div>
        }

        <!-- Queue Reorder Section -->
        @if (boardStore.queueVehicles().length > 0) {
          <h3 class="section-heading queue-section-title">
            {{ lang.t().waitingQueue }}
            <span class="queue-badge tabular-nums">{{ boardStore.queueVehicles().length }}</span>
          </h3>
          <p class="reorder-hint">{{ lang.t().reorderHint }}</p>

          <ion-list lines="none" class="reorder-list">
            <ion-reorder-group [disabled]="false" (ionItemReorder)="onReorder($event)">
              @for (vehicle of boardStore.queueVehicles(); track vehicle.id; let i = $index) {
                <ion-item class="reorder-item">
                  <ion-reorder slot="start"></ion-reorder>
                  <ion-label>
                    <h3 class="reorder-dest">
                      {{ lang.isRtl() ? vehicle.destinationAr : vehicle.destination }}
                    </h3>
                    <p class="reorder-sub">
                      <ion-icon name="person-outline"></ion-icon>
                      {{ vehicle.driverName }}
                      <span class="reorder-plate">{{ vehicle.matricule }}</span>
                    </p>
                  </ion-label>
                  <app-seat-dots slot="end" [occupied]="vehicle.occupiedSeats" [compact]="true"></app-seat-dots>
                </ion-item>
              }
            </ion-reorder-group>
          </ion-list>
        }

        <!-- Join Queue Modal inline (shown via FAB toggle) -->
        @if (showJoinForm()) {
          <div class="join-form-backdrop" (click)="showJoinForm.set(false)"></div>
          <ion-card class="join-form-card">
            <ion-card-content>
              <h3 class="join-title">{{ lang.t().joinQueueTitle }}</h3>

              <ion-item class="form-item">
                <ion-input
                  [label]="lang.t().enterMatricule"
                  labelPlacement="floating"
                  [(ngModel)]="newMatricule"
                  placeholder="198 تونس 4521">
                </ion-input>
              </ion-item>

              <ion-item class="form-item">
                <ion-input
                  [label]="lang.t().enterDriver"
                  labelPlacement="floating"
                  [(ngModel)]="newDriverName"
                  placeholder="Ammi Salah">
                </ion-input>
              </ion-item>

              <ion-item class="form-item">
                <ion-select
                  [label]="lang.t().selectDestination"
                  labelPlacement="floating"
                  [(ngModel)]="newDestination"
                  interface="action-sheet">
                  @for (dest of boardStore.currentStation().destinations; track dest; let i = $index) {
                    <ion-select-option [value]="dest">{{ dest }}</ion-select-option>
                  }
                </ion-select>
              </ion-item>

              <ion-button
                expand="block"
                color="primary"
                class="add-vehicle-btn"
                [disabled]="!newMatricule || !newDriverName || !newDestination"
                (click)="joinQueue()">
                <ion-icon slot="start" name="add-circle-outline"></ion-icon>
                {{ lang.t().addVehicle }}
              </ion-button>
            </ion-card-content>
          </ion-card>
        }
      </div>

      <!-- Floating Action Button to register a new vehicle -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="primary" (click)="showJoinForm.set(!showJoinForm())">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .staff-content {
      --background: var(--ion-background-color);
    }

    .staff-header {
      margin-bottom: 16px;
    }

    .staff-station {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0 0 2px 0;
    }

    .staff-role {
      font-size: 0.82rem;
      color: #797670;
      font-weight: 600;
    }

    .staff-status-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .offline-badge-staff {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .section-heading {
      font-size: 1rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 16px 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .no-boarding {
      text-align: center;
      padding: 30px 20px;
      color: #797670;
    }

    /* Staff oversized buttons */
    .seat-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 12px 0;
    }

    .seat-btn {
      --min-height: 56px;
      font-size: 1rem;
      font-weight: 800;
      border-radius: 12px;
    }

    .minus-btn {
      --background: #F5F4F0;
      --color: #1A1A1A;
      --background-activated: #E6E4DF;
      border: 2px solid #DEDAD1;
    }

    .plus-btn {
      --background: #1A1A1A;
      --color: #FFFFFF;
    }

    .depart-btn {
      --min-height: 50px;
      font-weight: 700;
      margin-top: 4px;
      margin-bottom: 16px;
      border-radius: 12px;
    }

    .queue-section-title {
      border-top: 1px solid #DEDAD1;
      padding-top: 14px;
    }

    .queue-badge {
      font-size: 0.8rem;
      padding: 2px 8px;
      background: #ECEAE4;
      border-radius: 12px;
      color: #55534E;
      font-weight: 700;
    }

    .reorder-hint {
      font-size: 0.82rem;
      color: #A3A19B;
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .reorder-list {
      background: transparent;
      padding: 0;
    }

    .reorder-item {
      --background: #FFFFFF;
      --border-radius: 10px;
      margin-bottom: 6px;
      border: 1px solid var(--app-border);
      border-radius: 10px;
    }

    .reorder-dest {
      font-size: 1rem;
      font-weight: 700;
      color: #1A1A1A;
    }

    .reorder-sub {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #797670;
    }

    .reorder-sub ion-icon {
      font-size: 0.85rem;
    }

    .reorder-plate {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.75rem;
      color: #A3A19B;
      margin-inline-start: 6px;
    }

    /* Join Queue Form */
    .join-form-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.3);
      z-index: 999;
    }

    .join-form-card {
      position: fixed;
      bottom: 90px;
      left: 16px;
      right: 16px;
      z-index: 1000;
      border-radius: 16px;
      background: #FFFFFF;
      border: 1px solid var(--app-border);
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      margin: 0;
    }

    .join-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0 0 14px 0;
    }

    .form-item {
      --background: #F9F8F5;
      --border-radius: 10px;
      margin-bottom: 8px;
      border: 1px solid #ECEAE4;
      border-radius: 10px;
    }

    .add-vehicle-btn {
      --min-height: 48px;
      font-weight: 700;
      margin-top: 10px;
      border-radius: 12px;
    }

    ion-fab-button {
      --background: #1A1A1A;
      --color: #FFFFFF;
    }
  `]
})
export class StaffPage {
  readonly lang = inject(LanguageService);
  readonly boardStore = inject(BoardStore);
  readonly offlineQueue = inject(OfflineQueueService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly showJoinForm = signal<boolean>(false);

  // Join queue form fields
  newMatricule = '';
  newDriverName = '';
  newDestination = '';

  constructor() {
    addIcons({
      addOutline,
      removeOutline,
      airplaneOutline,
      addCircleOutline,
      reorderThreeOutline,
      cloudOfflineOutline,
      checkmarkCircleOutline,
      personOutline,
      carSportOutline,
      navigateOutline
    });
  }

  // Use Ionic lifecycle
  ionViewWillEnter() {
    this.boardStore.connect(this.boardStore.currentStationId());
  }

  ionViewWillLeave() {
    this.boardStore.disconnect();
  }

  async updateSeats(delta: number) {
    const result = this.boardStore.updateHeroSeats(delta);
    if (result.success && result.vehicle) {
      const msg = this.lang.t().seatUpdatedToast.replace('{count}', result.vehicle.occupiedSeats.toString());
      await this.showUndoToast(msg);
    }
  }

  async confirmDepart(currentCount: number) {
    const t = this.lang.t();
    const alert = await this.alertCtrl.create({
      header: t.confirmDepart,
      message: t.confirmDepartPrompt.replace('{count}', currentCount.toString()),
      buttons: [
        { text: t.cancel, role: 'cancel' },
        {
          text: t.confirm,
          role: 'destructive',
          handler: () => {
            const departed = this.boardStore.departHeroVehicle();
            if (departed) {
              this.showUndoToast(this.lang.isRtl() ? 'اللوّاج انطلق!' : 'Louage parti !');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  onReorder(event: any) {
    const from = event.detail.from;
    const to = event.detail.to;
    this.boardStore.reorderQueue(from, to);
    event.detail.complete();
  }

  joinQueue() {
    if (!this.newMatricule || !this.newDriverName || !this.newDestination) return;

    const station = this.boardStore.currentStation();
    const destIndex = station?.destinations.indexOf(this.newDestination) ?? -1;
    const destAr = (station && destIndex >= 0) ? station.destinationsAr[destIndex] : this.newDestination;

    this.boardStore.joinQueue(this.newMatricule, this.newDriverName, this.newDestination, destAr);

    this.newMatricule = '';
    this.newDriverName = '';
    this.newDestination = '';
    this.showJoinForm.set(false);

    this.showUndoToast(this.lang.isRtl() ? 'تم إضافة اللوّاج للطابور' : 'Louage ajouté à la file');
  }

  private async showUndoToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 5000,
      position: 'bottom',
      color: 'dark',
      buttons: [
        {
          text: this.lang.t().undo,
          handler: () => {
            const undone = this.boardStore.undoLastAction();
            if (undone) {
              this.toastCtrl.create({
                message: this.lang.t().actionUndone,
                duration: 2000,
                position: 'bottom',
                color: 'success'
              }).then(t => t.present());
            }
          }
        }
      ]
    });
    await toast.present();
  }
}

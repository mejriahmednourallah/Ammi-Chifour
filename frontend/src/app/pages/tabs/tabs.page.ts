import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonButtons,
  IonBadge
} from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { OfflineQueueService } from '../../services/offline-queue.service';
import { BoardStore } from '../../stores/board.store';
import { addIcons } from 'ionicons';
import { searchOutline, gridOutline, heartOutline, constructOutline, wifiOutline, cloudOfflineOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonButtons,
    IonBadge
  ],
  template: `
    <ion-header class="ion-no-border header-shell">
      <ion-toolbar class="main-toolbar">
        <div slot="start" class="brand-start">
          <img src="assets/logo.jpg" alt="Ami Chifour Logo" class="brand-logo" />
        </div>

        <ion-title class="app-brand">
          <div class="brand-container">
            <span class="brand-name">{{ lang.t().appName }}</span>
            <span class="brand-sub">{{ lang.t().appSubtitle }}</span>
          </div>
        </ion-title>

        <ion-buttons slot="end" class="header-actions">
          @if (!offlineQueue.isOnline()) {
            <ion-badge color="warning" class="offline-pill">
              <ion-icon name="cloud-offline-outline"></ion-icon>
              <span>Hors-ligne</span>
            </ion-badge>
          }

          <ion-segment
            [value]="lang.currentLanguage()"
            (ionChange)="onLanguageChange($event)"
            mode="ios"
            class="lang-segment">
            <ion-segment-button value="fr">
              <ion-label>FR</ion-label>
            </ion-segment-button>
            <ion-segment-button value="ar">
              <ion-label>عربي</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-tabs>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="search">
          <ion-icon name="search-outline"></ion-icon>
          <ion-label>{{ lang.t().searchTab }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="board">
          <ion-icon name="grid-outline"></ion-icon>
          <ion-label>{{ lang.t().boardTab }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="favorites">
          <ion-icon name="heart-outline"></ion-icon>
          <ion-label>{{ lang.t().favoritesTab }}</ion-label>
          @if (boardStore.favorites().length > 0) {
            <ion-badge color="primary" class="fav-badge tabular-nums">
              {{ boardStore.favorites().length }}
            </ion-badge>
          }
        </ion-tab-button>

        <ion-tab-button tab="staff">
          <ion-icon name="construct-outline"></ion-icon>
          <ion-label>{{ lang.t().staffTab }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .header-shell {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 58px;
      z-index: 100;
      background: var(--ion-background-color);
      border-bottom: 1px solid var(--app-border);
    }

    ion-tabs {
      position: absolute;
      top: 58px;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .main-toolbar {
      --min-height: 58px;
      height: 58px;
      --padding-start: 12px;
      --padding-end: 12px;
      --padding-top: 4px;
      --padding-bottom: 4px;
    }

    .brand-start {
      display: flex;
      align-items: center;
      margin-inline-end: 8px;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      object-fit: cover;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
      border: 1.5px solid #1A1A1A;
    }

    .brand-container {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1A1A1A;
      letter-spacing: -0.3px;
    }

    .brand-sub {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #797670;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .offline-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .lang-segment {
      max-width: 100px;
      --background: #ECEAE4;
      border-radius: 8px;
      font-weight: 700;
    }

    .lang-segment ion-segment-button {
      min-height: 28px;
      font-size: 0.8rem;
      --color: #55534E;
      --color-checked: #1A1A1A;
      --indicator-color: #FFFFFF;
      --indicator-box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .custom-tab-bar {
      height: 60px;
      border-top: 1px solid var(--app-border);
      padding-bottom: env(safe-area-inset-bottom);
    }

    .custom-tab-bar ion-tab-button {
      --color: #71716E;
      --color-selected: #1A1A1A;
      font-weight: 600;
      font-size: 0.76rem;
    }

    .custom-tab-bar ion-tab-button ion-icon {
      font-size: 1.4rem;
      margin-bottom: 2px;
    }

    .fav-badge {
      font-size: 0.65rem;
      padding: 2px 5px;
      border-radius: 10px;
    }
  `]
})
export class TabsPage {
  readonly lang = inject(LanguageService);
  readonly offlineQueue = inject(OfflineQueueService);
  readonly boardStore = inject(BoardStore);

  constructor() {
    addIcons({
      searchOutline,
      gridOutline,
      heartOutline,
      constructOutline,
      wifiOutline,
      cloudOfflineOutline
    });
  }

  onLanguageChange(event: any) {
    const value = event.detail.value;
    if (value === 'fr' || value === 'ar') {
      this.lang.setLanguage(value);
    }
  }
}

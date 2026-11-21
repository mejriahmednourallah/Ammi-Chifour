import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSearchbar,
  IonChip,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardContent,
  IonButton
} from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { BoardStore } from '../../stores/board.store';
import { RouteFare } from '../../models/louage.model';
import { addIcons } from 'ionicons';
import {
  navigateOutline,
  carSportOutline,
  timeOutline,
  cashOutline,
  chevronForwardOutline,
  starOutline,
  star,
  pinOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSearchbar,
    IonChip,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent,
    IonButton
  ],
  template: `
    <ion-content class="ion-padding search-container">
      <!-- Hero Banner with Ami Chifour Logo -->
      <div class="search-hero">
        <div class="hero-logo-box">
          <img src="assets/logo.jpg" alt="Ami Chifour" class="hero-logo" />
        </div>
        <div class="hero-text">
          <h1 class="hero-title">{{ lang.isRtl() ? 'وين تحب تمشي؟' : 'Où voulez-vous aller ?' }}</h1>
          <p class="hero-desc">{{ lang.isRtl() ? 'كل لواج في تونس تلقاه لايف وتبع المقاعد الشاغرة' : 'Horaires en temps réel, places disponibles et tarifs officiels' }}</p>
        </div>
      </div>

      <!-- Searchbar -->
      <div class="search-input-wrapper">
        <ion-searchbar
          [(ngModel)]="searchQuery"
          [placeholder]="lang.t().searchPlaceholder"
          [debounce]="200"
          mode="md"
          class="custom-searchbar">
        </ion-searchbar>
      </div>

      <!-- Quick Station & "Near me" Chips -->
      <div class="chips-scroll">
        <ion-chip [outline]="selectedFilter() !== 'near'" (click)="selectNearMe()" class="near-me-chip">
          <ion-icon name="navigate-outline"></ion-icon>
          <ion-label>{{ lang.t().nearMe }}</ion-label>
        </ion-chip>

        <ion-chip [outline]="selectedFilter() !== 'all'" (click)="selectFilter('all')">
          <ion-label>{{ lang.t().allDestinations }}</ion-label>
        </ion-chip>

        @for (st of popularDestinations; track st) {
          <ion-chip [outline]="selectedFilter() !== st" (click)="selectFilter(st)">
            <ion-label>{{ st }}</ion-label>
          </ion-chip>
        }
      </div>

      <!-- Autocomplete & Results Section -->
      <div class="results-section">
        <h3 class="results-heading">
          {{ lang.isRtl() ? 'الرحلات المتاحة' : 'Lignes & Départs disponibles' }}
          <span class="count-pill tabular-nums">{{ filteredFares().length }}</span>
        </h3>

        @if (filteredFares().length === 0) {
          <div class="no-results">
            <p>{{ lang.isRtl() ? 'لا توجد نتائج مطابقة لبحثك' : 'Aucune destination trouvée pour cette recherche' }}</p>
          </div>
        } @else {
          <div class="fares-grid">
            @for (fare of filteredFares(); track fare.id) {
              <ion-card class="result-card" (click)="openBoard(fare.destination)">
                <ion-card-content class="card-inner">
                  <div class="destination-line">
                    <div class="dest-info">
                      <h2 class="dest-name">{{ lang.isRtl() ? fare.destinationAr : fare.destination }}</h2>
                      <span class="departure-origin">
                        <ion-icon name="pin-outline"></ion-icon>
                        {{ getStationName(fare.fromStationId) }}
                      </span>
                    </div>

                    <div class="fare-tag tabular-nums">
                      <span class="fare-price">{{ fare.fareTnd.toFixed(3) }}</span>
                      <span class="currency">TND</span>
                    </div>
                  </div>

                  <div class="meta-line">
                    <div class="stat-pill tabular-nums">
                      <ion-icon name="time-outline"></ion-icon>
                      <span>~{{ fare.estimatedDurationMin }} min</span>
                    </div>

                    <div class="stat-pill tabular-nums">
                      <span>{{ fare.distanceKm }} km</span>
                    </div>

                    <div class="stat-pill louages-count tabular-nums">
                      <ion-icon name="car-sportOutline"></ion-icon>
                      <span>{{ fare.activeLouagesCount }} louages</span>
                    </div>

                    <ion-button
                      fill="clear"
                      size="small"
                      class="fav-toggle-btn"
                      (click)="toggleFav($event, fare.destination)">
                      <ion-icon
                        slot="icon-only"
                        [name]="boardStore.isFavorite(fare.destination) ? 'star' : 'star-outline'"
                        [class.starred]="boardStore.isFavorite(fare.destination)">
                      </ion-icon>
                    </ion-button>
                  </div>
                </ion-card-content>
              </ion-card>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .search-container {
      --background: var(--ion-background-color);
    }

    .search-hero {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 6px 16px 6px;
    }

    .hero-logo-box {
      flex-shrink: 0;
    }

    .hero-logo {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      border: 2px solid #1A1A1A;
    }

    .hero-text {
      display: flex;
      flex-direction: column;
    }

    .hero-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0 0 4px 0;
      letter-spacing: -0.4px;
    }

    .hero-desc {
      font-size: 0.85rem;
      color: #797670;
      margin: 0;
      line-height: 1.3;
    }

    .search-input-wrapper {
      margin-bottom: 8px;
    }

    .custom-searchbar {
      --background: #FFFFFF;
      --box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      --border-radius: 14px;
      --color: #1A1A1A;
      --placeholder-color: #8C8A84;
      --icon-color: #1A1A1A;
      padding: 0;
      border: 1px solid var(--app-border);
      border-radius: 14px;
    }

    .chips-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 6px 0 14px 0;
      scrollbar-width: none;
    }
    .chips-scroll::-webkit-scrollbar {
      display: none;
    }

    .chips-scroll ion-chip {
      --background: #ECEAE4;
      --color: #1A1A1A;
      font-weight: 600;
      font-size: 0.85rem;
      border-radius: 20px;
      border-color: #DEDAD1;
    }

    .near-me-chip {
      --background: #1A1A1A !important;
      --color: #FFFFFF !important;
    }
    .near-me-chip ion-icon {
      color: #F2B705 !important;
    }

    .results-section {
      margin-top: 10px;
    }

    .results-heading {
      font-size: 1.05rem;
      font-weight: 800;
      color: #1A1A1A;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
    }

    .count-pill {
      font-size: 0.8rem;
      padding: 2px 8px;
      background: #ECEAE4;
      border-radius: 12px;
      color: #55534E;
    }

    .fares-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .result-card {
      margin: 0;
      background: #FFFFFF;
      border-radius: 14px;
      border: 1px solid var(--app-border);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .result-card:active {
      transform: scale(0.985);
    }

    .card-inner {
      padding: 14px 16px;
    }

    .destination-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .dest-name {
      font-size: 1.35rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0 0 2px 0;
    }

    .departure-origin {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #797670;
      font-weight: 600;
    }

    .fare-tag {
      display: flex;
      align-items: baseline;
      gap: 3px;
      background: #F9F8F5;
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid #ECEAE4;
    }

    .fare-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1A1A1A;
    }

    .currency {
      font-size: 0.75rem;
      font-weight: 700;
      color: #797670;
    }

    .meta-line {
      display: flex;
      align-items: center;
      gap: 8px;
      border-top: 1px solid #F2EFEB;
      padding-top: 8px;
    }

    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #55534E;
      background: #F6F5F1;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .louages-count {
      color: var(--ion-color-free);
      font-weight: 700;
      background: #E8F5E9;
    }

    .fav-toggle-btn {
      margin-inline-start: auto;
      --color: #A3A19B;
    }

    .starred {
      color: #F2B705 !important;
    }

    .no-results {
      padding: 30px 20px;
      text-align: center;
      color: #797670;
    }
  `]
})
export class SearchPage {
  readonly lang = inject(LanguageService);
  readonly boardStore = inject(BoardStore);
  private router = inject(Router);

  searchQuery = '';
  readonly selectedFilter = signal<string>('all');

  popularDestinations = ['Sousse', 'Sfax', 'Bizerte', 'Nabeul', 'Kairouan', 'Hammamet'];

  constructor() {
    addIcons({
      navigateOutline,
      carSportOutline,
      timeOutline,
      cashOutline,
      chevronForwardOutline,
      starOutline,
      star,
      pinOutline
    });
  }

  readonly filteredFares = computed(() => {
    let list = this.boardStore.fares();
    const query = this.searchQuery.trim().toLowerCase();
    const filter = this.selectedFilter();

    if (filter !== 'all' && filter !== 'near') {
      list = list.filter(f => f.destination.toLowerCase() === filter.toLowerCase());
    }

    if (query) {
      list = list.filter(f =>
        f.destination.toLowerCase().includes(query) ||
        f.destinationAr.includes(query) ||
        this.getStationName(f.fromStationId).toLowerCase().includes(query)
      );
    }

    return list;
  });

  selectFilter(filter: string) {
    this.selectedFilter.set(filter);
  }

  selectNearMe() {
    this.selectedFilter.set('near');
    // Default to Bab Alioua for demo near me
    this.boardStore.setStation('bab-alioua');
  }

  getStationName(stId: string): string {
    const s = this.boardStore.stations().find(st => st.id === stId);
    if (!s) return 'Gare Bab Alioua';
    return this.lang.isRtl() ? s.nameAr : s.name;
  }

  openBoard(destination: string) {
    this.boardStore.setDestinationFilter(destination);
    this.router.navigate(['/tabs/board']);
  }

  toggleFav(event: Event, destination: string) {
    event.stopPropagation();
    this.boardStore.toggleFavorite(destination);
  }
}

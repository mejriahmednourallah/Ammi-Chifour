import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton
} from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { BoardStore } from '../../stores/board.store';
import { addIcons } from 'ionicons';
import {
  heartOutline,
  heartDislikeOutline,
  timeOutline,
  chevronForwardOutline,
  pinOutline,
  carSportOutline,
  star
} from 'ionicons/icons';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton
  ],
  template: `
    <ion-content class="favorites-content ion-padding">
      <div class="fav-header">
        <h1 class="fav-title">
          <ion-icon name="star" class="title-icon"></ion-icon>
          {{ lang.t().favoritesTab }}
        </h1>
        <span class="fav-count tabular-nums">{{ boardStore.favoriteFares().length }}</span>
      </div>

      @if (boardStore.favoriteFares().length === 0) {
        <div class="empty-state">
          <ion-icon name="heart-outline" class="empty-icon"></ion-icon>
          <h3>{{ lang.isRtl()
            ? 'ما عندك حتى وجهة مفضلة'
            : 'Aucune destination favorite' }}</h3>
          <p>{{ lang.isRtl()
            ? 'أضف وجهاتك المفضلة من صفحة البحث بالنقر على النجمة'
            : 'Ajoutez vos destinations préférées depuis la page de recherche en cliquant sur l\'étoile' }}</p>
        </div>
      } @else {
        <div class="fav-grid">
          @for (fare of boardStore.favoriteFares(); track fare.id) {
            <ion-card class="fav-card" (click)="openBoard(fare.destination)">
              <ion-card-content class="fav-inner">
                <div class="fav-top-line">
                  <div class="dest-block">
                    <h2 class="dest-name">{{ lang.isRtl() ? fare.destinationAr : fare.destination }}</h2>
                    <span class="origin-label">
                      <ion-icon name="pin-outline"></ion-icon>
                      {{ getStationName(fare.fromStationId) }}
                    </span>
                  </div>

                  <ion-button fill="clear" size="small" class="remove-fav" (click)="removeFav($event, fare.destination)">
                    <ion-icon slot="icon-only" name="heart-dislike-outline"></ion-icon>
                  </ion-button>
                </div>

                <div class="fav-meta">
                  <div class="fare-block tabular-nums">
                    <span class="fare-amount">{{ fare.fareTnd.toFixed(3) }}</span>
                    <span class="fare-currency">TND</span>
                  </div>

                  <div class="meta-pills">
                    <span class="meta-pill tabular-nums">
                      <ion-icon name="time-outline"></ion-icon>
                      ~{{ fare.estimatedDurationMin }} min
                    </span>
                    <span class="meta-pill tabular-nums">
                      {{ fare.distanceKm }} km
                    </span>
                    <span class="meta-pill active-count tabular-nums">
                      <ion-icon name="car-sport-outline"></ion-icon>
                      {{ fare.activeLouagesCount }}
                    </span>
                  </div>
                </div>

                <div class="fav-cta">
                  <span class="see-board">
                    {{ lang.isRtl() ? 'شوف اللوحة ←' : 'Voir le tableau →' }}
                  </span>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .favorites-content {
      --background: var(--ion-background-color);
    }

    .fav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-top: 4px;
    }

    .fav-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.3rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0;
    }

    .title-icon {
      color: #F2B705;
      font-size: 1.3rem;
    }

    .fav-count {
      font-size: 0.85rem;
      padding: 3px 10px;
      background: #ECEAE4;
      border-radius: 12px;
      color: #55534E;
      font-weight: 700;
    }

    .empty-state {
      text-align: center;
      padding: 50px 24px;
    }

    .empty-icon {
      font-size: 3rem;
      color: #CCCAC3;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1A1A1A;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 0.9rem;
      color: #797670;
      margin: 0;
      line-height: 1.4;
    }

    .fav-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fav-card {
      margin: 0;
      background: #FFFFFF;
      border-radius: 14px;
      border: 1px solid var(--app-border);
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .fav-card:active {
      transform: scale(0.985);
    }

    .fav-inner {
      padding: 14px 16px;
    }

    .fav-top-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .dest-name {
      font-size: 1.3rem;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0 0 2px 0;
    }

    .origin-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #797670;
      font-weight: 600;
    }

    .remove-fav {
      --color: #B3402A;
      margin: 0;
    }

    .fav-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-top: 1px solid #F2EFEB;
    }

    .fare-block {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .fare-amount {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1A1A1A;
    }

    .fare-currency {
      font-size: 0.75rem;
      font-weight: 700;
      color: #797670;
    }

    .meta-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    [dir="rtl"] .meta-pills {
      justify-content: flex-start;
    }

    .meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.78rem;
      color: #55534E;
      background: #F6F5F1;
      padding: 3px 7px;
      border-radius: 6px;
    }

    .active-count {
      color: var(--ion-color-free);
      font-weight: 700;
      background: #E8F5E9;
    }

    .fav-cta {
      margin-top: 8px;
      text-align: end;
    }

    [dir="rtl"] .fav-cta {
      text-align: start;
    }

    .see-board {
      font-size: 0.85rem;
      font-weight: 700;
      color: #1A1A1A;
      letter-spacing: -0.2px;
    }
  `]
})
export class FavoritesPage {
  readonly lang = inject(LanguageService);
  readonly boardStore = inject(BoardStore);
  private router = inject(Router);

  constructor() {
    addIcons({
      heartOutline,
      heartDislikeOutline,
      timeOutline,
      chevronForwardOutline,
      pinOutline,
      carSportOutline,
      star
    });
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

  removeFav(event: Event, destination: string) {
    event.stopPropagation();
    this.boardStore.toggleFavorite(destination);
  }
}

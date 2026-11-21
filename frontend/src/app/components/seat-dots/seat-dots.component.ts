import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seat-dots',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seat-dots-container" [class.compact]="compact" role="group" [attr.aria-label]="occupied + ' seats occupied out of 8'">
      <!-- Front row: Driver + 1 Passenger seat -->
      <div class="seat-row front-row">
        <span class="seat-dot driver-icon" title="Chifour"></span>
        <span
          class="seat-dot"
          [class.filled]="isFilled(0)"
          [title]="isFilled(0) ? 'Place avant occupée' : 'Place avant libre'">
        </span>
      </div>

      <!-- Middle row: 3 Passenger seats -->
      <div class="seat-row middle-row">
        @for (index of [1, 2, 3]; track index) {
          <span
            class="seat-dot"
            [class.filled]="isFilled(index)"
            [title]="isFilled(index) ? 'Place occupée' : 'Place libre'">
          </span>
        }
      </div>

      <!-- Back row: 4 Passenger seats -->
      <div class="seat-row back-row">
        @for (index of [4, 5, 6, 7]; track index) {
          <span
            class="seat-dot"
            [class.filled]="isFilled(index)"
            [title]="isFilled(index) ? 'Place occupée' : 'Place libre'">
          </span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .seat-dots-container {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      background: #ECEAE4;
      border-radius: 12px;
      border: 1px solid #DEDAD1;
    }

    .seat-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .seat-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #1A1A1A;
      background-color: transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .seat-dot.filled {
      background-color: #1A1A1A;
      box-shadow: inset 0 0 0 1px #F6F5F1;
      transform: scale(1.05);
    }

    .driver-icon {
      background-color: #A3A19B;
      border-color: #7A7872;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      opacity: 0.8;
    }

    /* Compact mode */
    .seat-dots-container.compact {
      padding: 4px 6px;
      gap: 3px;
    }
    .seat-dots-container.compact .seat-row {
      gap: 4px;
    }
    .seat-dots-container.compact .seat-dot,
    .seat-dots-container.compact .driver-icon {
      width: 10px;
      height: 10px;
      border-width: 1.5px;
    }
  `]
})
export class SeatDotsComponent {
  @Input() occupied: number = 0;
  @Input() compact: boolean = false;

  isFilled(index: number): boolean {
    return index < this.occupied;
  }
}

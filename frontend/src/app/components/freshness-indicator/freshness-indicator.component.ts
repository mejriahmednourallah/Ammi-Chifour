import { Component, Input, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-freshness-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="freshness-badge"
      [class.stale]="isStale()"
      [class.warning]="isWarning()"
      [class.fresh]="isFresh()"
      role="status">
      <span class="pulse-dot"></span>
      <span class="freshness-text tabular-nums">
        {{ labelText() }}
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .freshness-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.2px;
      transition: all 0.3s ease;
      background: #ECEAE4;
      color: #55534E;
      border: 1px solid #DEDAD1;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #8C8A84;
      transition: background-color 0.3s ease;
    }

    /* Fresh: < 20s */
    .freshness-badge.fresh {
      background: #E8F5E9;
      color: #1B5E20;
      border-color: #C8E6C9;
    }
    .freshness-badge.fresh .pulse-dot {
      background-color: #2E7D4F;
      box-shadow: 0 0 0 0 rgba(46, 125, 79, 0.4);
      animation: pulse 1.8s infinite;
    }

    /* Warning: 20s - 60s */
    .freshness-badge.warning {
      background: #FFF8E1;
      color: #7F5800;
      border-color: #FFE082;
    }
    .freshness-badge.warning .pulse-dot {
      background-color: #F2B705;
    }

    /* Stale: > 60s (grayed out) */
    .freshness-badge.stale {
      background: #E0DFDB;
      color: #797670;
      border-color: #CCCAC3;
      filter: grayscale(80%);
      opacity: 0.85;
    }
    .freshness-badge.stale .pulse-dot {
      background-color: #9E9D98;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(46, 125, 79, 0.5);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(46, 125, 79, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(46, 125, 79, 0);
      }
    }
  `]
})
export class FreshnessIndicatorComponent implements OnInit, OnDestroy {
  @Input() lastTimestamp: number = Date.now();

  private langService = inject(LanguageService);
  private timer: any = null;
  readonly secondsAgo = signal<number>(0);

  ngOnInit() {
    this.updateAge();
    this.timer = setInterval(() => this.updateAge(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private updateAge() {
    const diff = Math.max(0, Math.floor((Date.now() - (this.lastTimestamp || Date.now())) / 1000));
    this.secondsAgo.set(diff);
  }

  readonly isFresh = computed(() => this.secondsAgo() < 20);
  readonly isWarning = computed(() => this.secondsAgo() >= 20 && this.secondsAgo() < 60);
  readonly isStale = computed(() => this.secondsAgo() >= 60);

  readonly labelText = computed(() => {
    const s = this.secondsAgo();
    const t = this.langService.t();
    if (s <= 2) {
      return t.updatedJustNow;
    }
    if (this.isStale()) {
      return t.streamPaused;
    }
    return t.updatedSecondsAgo.replace('{s}', s.toString());
  });
}

import { Injectable, signal } from '@angular/core';
import { OfflineAction } from '../models/louage.model';

const DB_NAME = 'AmiChifourOfflineDB';
const STORE_NAME = 'offline_actions';
const DB_VERSION = 1;

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  readonly isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  readonly pendingActionsCount = signal<number>(0);

  private db: IDBDatabase | null = null;

  constructor() {
    this.initListeners();
    this.openDb().then(() => {
      this.refreshPendingCount();
    });
  }

  private initListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline.set(true);
        this.replayPendingActions();
      });
      window.addEventListener('offline', () => {
        this.isOnline.set(false);
      });
    }
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async queueAction(type: OfflineAction['type'], payload: any): Promise<OfflineAction> {
    const action: OfflineAction = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type,
      payload,
      timestamp: Date.now(),
      synced: false
    };

    if (this.db) {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(action);
      await new Promise((res) => (tx.oncomplete = res));
      await this.refreshPendingCount();
    }

    if (this.isOnline()) {
      await this.replayPendingActions();
    }

    return action;
  }

  async removeAction(actionId: string): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(actionId);
    await new Promise((res) => (tx.oncomplete = res));
    await this.refreshPendingCount();
  }

  async getAllPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) return [];
    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  private async refreshPendingCount() {
    const actions = await this.getAllPendingActions();
    this.pendingActionsCount.set(actions.length);
  }

  async replayPendingActions(): Promise<number> {
    if (!this.isOnline()) return 0;
    const actions = await this.getAllPendingActions();
    if (actions.length === 0) return 0;

    let replayed = 0;
    for (const action of actions) {
      try {
        // Here we simulate or send HTTP POST /queue/{id}/move or /vehicles/{id}/seats
        // In full app with backend: fetch('/api/...', { method: 'POST', body: JSON.stringify(action.payload) })
        await this.removeAction(action.id);
        replayed++;
      } catch (err) {
        console.warn('Could not replay action:', action, err);
      }
    }
    await this.refreshPendingCount();
    return replayed;
  }
}

import { Injectable, signal } from '@angular/core';
import { UserProfile } from './user.service';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly STORAGE_KEY = 'user';

  user = signal<UserProfile | null>(this.loadFromStorage());

  constructor() {}

  private loadFromStorage(): UserProfile | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  setUser(user: UserProfile) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  clearUser() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.user.set(null);
  }

  getUser(): UserProfile | null {
    return this.user();
  }
}

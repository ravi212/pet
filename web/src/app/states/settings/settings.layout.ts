import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../auth/services/auth.service';
import { AUTH_ROUTES } from '../../shared/constants/routes.const';
import { UserStore } from './services/user.store';
import { baseUrl } from '../../shared/constants/endpoints.const';

@Component({
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule, SharedModule],
  template: `
    <div class="h-screen flex flex-col">
      <app-header title="PET" subtitle="Project Expense Tracker">
        <!-- Avatar + Dropdown -->
        <div class="relative group">
          <!-- Avatar trigger -->
          <div
            class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
               text-white flex items-center justify-center text-sm font-semibold
               cursor-pointer select-none"
          >
            @if (avatarUrl) {
              <img [src]="avatarUrl" class="w-full h-full object-cover" />
            } @else {
              {{ initials }}
            }
          </div>

          <!-- Dropdown -->
          <div
            class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-xl border
               opacity-0 invisible translate-y-2
               group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
               transition-all duration-200 ease-out z-50"
          >
            <!-- User info -->
            <div class="px-4 py-3 border-b">
              <p class="text-sm font-semibold text-gray-900">
                {{ displayName }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ user()?.email }}
              </p>
            </div>

            <!-- Actions -->
            <div class="py-2">
              <button
                class="w-full px-4 py-2 text-left text-sm text-gray-700
                   hover:bg-gray-100 transition"
              >
                Settings
              </button>

              <button
                class="w-full px-4 py-2 text-left text-sm text-red-600
                   hover:bg-red-50 transition"
                (click)="logOut()"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </app-header>

      <div class="max-w-7xl mx-auto w-full px-6 sm:px-10 sm:py-8 py-4">
        <router-outlet />
      </div>
    </div>
  `,
})
export class SettingsLayoutComponent {
  private auth = inject(AuthService);
  readonly router = inject(Router);
  readonly backIcon = ArrowLeft;
  readonly collapsed = signal(true);
  private userStore = inject(UserStore);

  user = this.userStore.user;
  avatar: string | undefined | null = null;
  toggleSidebar() {
    this.collapsed.update((v) => !v);
  }

  constructor() {
    effect(() => {
      this.avatar = this.userStore.user()?.avatarUrl;
    });
  }

  get initials(): string {
    const name = this.displayName?.trim();
    if (!name) return '';

    const parts = name.split(/\s+/);

    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';

    return (first + second).toUpperCase();
  }

  get displayName() {
    return `${this.user()?.firstName?.trim()} ${this.user()?.lastName?.trim()}`;
  }

  get avatarUrl() {
    return this.avatar ? `${baseUrl}${this.avatar}` : null;
  }

  logOut() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate([`/${AUTH_ROUTES.ROOT}/${AUTH_ROUTES.LOGIN}`]);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }
}

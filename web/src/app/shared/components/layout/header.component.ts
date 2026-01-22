import { CommonModule } from '@angular/common';
import { Component, effect, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { UserStore } from '../../../states/settings/services/user.store';
import { AuthService } from '../../../states/auth/services/auth.service';
import { AUTH_ROUTES } from '../../constants/routes.const';
import { baseUrl } from '../../constants/endpoints.const';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [LucideAngularModule, CommonModule, RouterLink],
  template: `
    <header
      class="h-16 flex items-center justify-between px-6
             bg-white border-b border-gray-200 shadow-sm"
    >
      <!-- LEFT -->
      <div class="flex items-center gap-3">
        @if (backButton) {
          <lucide-angular
            [img]="arrowLeftIcon"
            size="18"
            class="cursor-pointer text-gray-500 hover:text-gray-900 transition"
            (click)="goBack()"
          />
        }
        <div>
          <img src="icon.png" class="h-9 w-9" alt="" />
        </div>

        <div>
          <h1 class="text-sm font-semibold text-gray-600 leading-tight">
            {{ title }}
          </h1>
          <p class="text-xs text-gray-500">
            {{ subtitle }}
          </p>
        </div>
      </div>
      @if (authenticated) {
        <!-- Avatar + Dropdown -->
        <div class="relative group">
          <!-- Avatar trigger -->
          <div
            class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
               text-white flex items-center justify-center text-sm font-semibold
               cursor-pointer select-none"
          >
            @if (avatarUrl) {
              <img [src]="avatarUrl" class="w-full rounded-full h-full object-cover" />
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
                [routerLink]="'/settings'"
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
      }

      <!-- RIGHT -->
      <ng-content />
    </header>
  `,
})
export class AppHeaderComponent {
  router = inject(Router);
  private userStore = inject(UserStore);
  private auth = inject(AuthService);
  authenticated = false;
  user = this.userStore.user;
  avatar: string | undefined | null = null;

  goBack() {
    this.router.navigate(['..']);
  }

  @Input() title = '';
  @Input() subtitle = '';
  @Input() backButton = true;

  readonly arrowLeftIcon = ArrowLeft;

  constructor() {
    effect(() => {
      this.avatar = this.userStore.user()?.avatarUrl;
      this.authenticated = this.auth.isAuthenticated();
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

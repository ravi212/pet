import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { AUTH_ROUTES, PROJECT_ROUTES } from '../../../shared/constants/routes.const';
import { Project, ProjectsService } from '../services/projects.service';
import { ProjectContextService } from '../services/project-context.service';
import {
  LucideAngularModule,
  ArrowLeft,
  LayoutDashboard,
  Receipt,
  CheckSquare,
  Calendar,
  ScanLine,
  Settings,
} from 'lucide-angular';
import { SharedModule } from '../../../shared/shared.module';
import { baseUrl } from '../../../shared/constants/endpoints.const';
import { UserStore } from '../../settings/services/user.store';

@Component({
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule, SharedModule, RouterLink],
  template: `
    <div class="h-screen flex flex-col">
      <app-header [title]="project()?.title || 'Loading…'" subtitle="Workspace">
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
      </app-header>

      <div class="flex flex-1 overflow-hidden">
        <app-sidebar [collapsed]="collapsed()" (toggle)="toggleSidebar()" [items]="nav" />

        <main class="flex-1 overflow-y-auto bg-gray-50">
          <div class="max-w-7xl mx-auto w-full px-6 sm:px-10 sm:py-8 py-4">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ProjectFeaturesLayoutComponent implements OnInit {
  private auth = inject(AuthService);
  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);
  private context = inject(ProjectContextService);
  private userStore = inject(UserStore);

  readonly project = signal<Project | null>(null);
  readonly user = signal(this.userStore.getUser());
  readonly backIcon = ArrowLeft;

  readonly collapsed = signal(true);

  readonly nav = [
    { label: 'Dashboard', link: PROJECT_ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Expenses', link: `${PROJECT_ROUTES.EXPENSES}/${PROJECT_ROUTES.LIST}`, icon: Receipt },
    {
      label: 'Receipts',
      link: `${PROJECT_ROUTES.RECEIPTS}/${PROJECT_ROUTES.LIST}`,
      icon: ScanLine,
    },
    { label: 'Tasks', link: `${PROJECT_ROUTES.TASKS}/${PROJECT_ROUTES.LIST}`, icon: CheckSquare },
    { label: 'Cycles', link: `${PROJECT_ROUTES.CYCLES}/${PROJECT_ROUTES.LIST}`, icon: Calendar },
    { label: 'Settings', link: `${PROJECT_ROUTES.SETTINGS}`, icon: Settings },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const projectId = params.get('projectId');
      if (!projectId) return;

      this.projectsService.findOne(projectId).subscribe((response) => {
        this.project.set(response.data as Project);
        this.context.set(projectId, response?.data as Project);
      });
    });
  }

  toggleSidebar() {
    this.collapsed.update((v) => !v);
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
    return this.user()?.avatarUrl ? `${baseUrl}${this.user()?.avatarUrl}`: null;
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

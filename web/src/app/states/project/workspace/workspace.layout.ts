import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PROJECT_ROUTES } from '../../../shared/constants/routes.const';
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

@Component({
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule, SharedModule],
  template: `
    <div class="h-screen flex flex-col">
      <app-header [title]="project()?.title || 'Loading…'" subtitle="Workspace"> </app-header>

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
  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);
  private context = inject(ProjectContextService);
  readonly project = signal<Project | null>(null);

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
}

import { Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataTableColumn } from '../../../../shared/components';
import { Project, ProjectService } from '../../services/projects.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { ProjectFormComponent } from '../../components/create-project-form/project-form.component';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Edit, Trash2 } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectType } from '../../../../shared/enums';

@Component({
  selector: 'app-project-list',
  templateUrl: './list.html',
  imports: [CommonModule, SharedModule, ProjectFormComponent, FormsModule, LucideAngularModule],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  @ViewChild('typeTpl', { static: true })
  typeTpl!: TemplateRef<{ $implicit: Project }>;

  @ViewChild('updatedAtTpl', { static: true })
  updatedAtTpl!: TemplateRef<{ $implicit: Project }>;

  readonly projectType = ProjectType;

  private projectService = inject(ProjectService);

  readonly editIcon = Edit;
  readonly deleteIcon = Trash2;

  loading = false;
  search = '';
  page = 1;
  limit = 10;
  totalPages = 0;
  total = 0;

  sideSheetOpen = false;
  selectedProject: Project | null = null;

  private search$ = new Subject<string>();
  private destroyRef = inject(DestroyRef);

  columns: DataTableColumn<Project>[] = [];

  confirmOpen = false;

  constructor() {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search = value;
        this.page = 1;
        this.loadProjects();
      });
  }

  ngOnInit() {
    this.columns = [
      { key: 'title', label: 'Title', sortable: true },
      { key: 'description', label: 'Description' },
      { key: 'type', label: 'Type', sortable: true, template: this.typeTpl },
      { key: 'updatedAt', label: 'Last Updated', sortable: true, template: this.updatedAtTpl },
    ];
    this.loadProjects();
  }

  openConfirm(project: any) {
    this.selectedProject = project;
    this.confirmOpen = true;
  }

  loadProjects() {
    this.loading = true;
    this.projectService
      .findAll(this.page, this.limit, this.search)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.confirmOpen = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.projects = res.data;
          this.totalPages = res.meta.totalPages;
          this.total = res.meta.total;
        },
        error: (err) => console.error('Failed to load projects', err),
      });
  }

  edit(project: Project) {
    this.selectedProject = { ...project };
    this.sideSheetOpen = true;
  }

  remove(project: Project | null) {
    if (!project) return;

    this.projectService.remove(project.id).subscribe({
      next: () => this.loadProjects(),
      error: () => this.loadProjects(),
    });
  }

  onSearchChange(search: string) {
    this.search$.next(search);
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadProjects();
  }

  onRowClick(project: Project) {
    this.selectedProject = project;
    this.sideSheetOpen = true;
  }

  openCreateSheet() {
    this.selectedProject = null;
    this.sideSheetOpen = true;
  }

  onSave() {
    this.sideSheetOpen = false;
    this.loadProjects();
  }

  onLimitChange(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.loadProjects();
  }
}

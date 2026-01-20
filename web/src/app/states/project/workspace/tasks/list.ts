import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Edit, Trash2, Plus } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SharedModule } from '../../../../shared/shared.module';
import { DataTableColumn } from '../../../../shared/components';
import { TasksService, Task } from './services/tasks.service';
import { ProjectContextService } from '../../services/project-context.service';
import { TaskFormComponent } from './components/task-form/task-form.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, TaskFormComponent, LucideAngularModule],
  templateUrl: './list.html',
})
export class List implements OnInit {
  private tasksService = inject(TasksService);
  private context = inject(ProjectContextService);
  private destroyRef = inject(DestroyRef);

  projectId!: string;

  tasks: Task[] = [];
  selectedTask: Task | null = null;

  loading = false;
  page = 1;
  limit = 10;
  total = 0;

  search = '';
  private search$ = new Subject<string>();

  sideSheetOpen = false;
  confirmOpen = false;
  isSubmitting = false;
  isFormValid = false;

  readonly editIcon = Edit;
  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;

  @ViewChild('statusTpl', { static: true })
  statusTpl!: TemplateRef<{ $implicit: Task }>;

  @ViewChild('assigneeTpl', { static: true })
  assigneeTpl!: TemplateRef<{ $implicit: Task }>;

  @ViewChild(TaskFormComponent)
  taskForm!: TaskFormComponent;

  columns: DataTableColumn<Task>[] = [];

  constructor() {
    // React to project context change
    effect(() => {
      const projectId = this.context.projectId();
      if (!projectId) return;

      this.projectId = projectId;
      this.page = 1;
      this.loadTasks();
    });

    // Search
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search = value;
        this.page = 1;
        this.loadTasks();
      });
  }

  ngOnInit() {
    this.columns = [
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status', template: this.statusTpl },
      // { key: 'assignee', label: 'Assignee', template: this.assigneeTpl },
      { key: 'budgetAmount', label: 'Budget' },
    ];
  }

  loadTasks() {
    this.loading = true;

    this.tasksService
      .findAll({
        projectId: this.projectId,
        page: this.page,
        limit: this.limit,
        search: this.search || undefined,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.tasks = res.data;
          this.total = res.pagination.total;
        },
        error: (err) => console.error('Failed to load tasks', err),
      });
  }

  onSearchChange(value: string) {
    this.search$.next(value);
  }

  openCreateSheet() {
    this.selectedTask = null;
    this.sideSheetOpen = true;
  }

  edit(task: Task) {
    this.selectedTask = { ...task };
    this.sideSheetOpen = true;
  }

  openConfirm(task: Task) {
    this.selectedTask = task;
    this.confirmOpen = true;
  }

  remove(task: Task | null) {
    if (!task) return;

    this.tasksService.remove(task.id).subscribe({
      next: () => this.loadTasks(),
      error: () => this.loadTasks(),
    });
  }

  onSave() {
    this.sideSheetOpen = false;
    this.loadTasks();
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadTasks();
  }

  onLimitChange(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.loadTasks();
  }
}

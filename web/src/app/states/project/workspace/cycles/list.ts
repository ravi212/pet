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
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Edit,
  Trash2,
  Plus,
  Lock,
  Unlock,
} from 'lucide-angular';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  Subject,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CycleFormComponent } from './components/cycle-form/cycle-form.component';
import { SharedModule } from '../../../../shared/shared.module';
import { Cycle, CyclesService } from './services/cycles.service';
import { DataTableColumn } from '../../../../shared/components';
import { ProjectContextService } from '../../services/project-context.service';

@Component({
  selector: 'app-cycles-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CycleFormComponent,
    LucideAngularModule,
  ],
  templateUrl: './list.html',
})
export class List implements OnInit {
  private cyclesService = inject(CyclesService);
  private context = inject(ProjectContextService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  isSubmitting = false;
  isFormValid = false;

  projectId!: string;

  cycles: Cycle[] = [];
  selectedCycle: Cycle | null = null;

  loading = false;
  page = 1;
  limit = 10;
  total = 0;

  search = '';
  private search$ = new Subject<string>();

  sideSheetOpen = false;
  confirmOpen = false;

  readonly editIcon = Edit;
  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;
  readonly lockIcon = Lock;
  readonly unlockIcon = Unlock;

  @ViewChild('dateTpl', { static: true })
  dateTpl!: TemplateRef<{ $implicit: Cycle }>;

  @ViewChild('lockTpl', { static: true })
  lockTpl!: TemplateRef<{ $implicit: Cycle }>;

  @ViewChild(CycleFormComponent)
  cycleForm!: CycleFormComponent;

  columns: DataTableColumn<Cycle>[] = [];

  constructor() {
    effect(() => {
      const projectId = this.context.projectId();
      if (!projectId) return;

      // only update projectId, not the whole object
      this.projectId = projectId;
      this.page = 1;

      this.loadCycles();
    });

    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.search = value;
        this.page = 1;
        this.loadCycles();
      });
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;

    this.columns = [
      { key: 'cycleStart', label: 'Start', template: this.dateTpl },
      { key: 'cycleEnd', label: 'End', template: this.dateTpl },
      { key: 'budgetAmount', label: 'Budget' },
      { key: 'isLocked', label: 'Status', template: this.lockTpl },
    ];
  }

  loadCycles() {
    this.loading = true;

    this.cyclesService
      .findAll({
        projectId: this.projectId,
        page: this.page,
        limit: this.limit,
        search: this.search || undefined,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.cycles = res.data;
          this.total = res.pagination.total;
        },
        error: (err) => console.error('Failed to load cycles', err),
      });
  }

  onSearchChange(value: string) {
    this.search$.next(value);
  }

  openCreateSheet() {
    this.selectedCycle = null;
    this.sideSheetOpen = true;
  }

  edit(cycle: Cycle) {
    this.selectedCycle = { ...cycle };
    this.sideSheetOpen = true;
  }

  openConfirm(cycle: Cycle) {
    this.selectedCycle = cycle;
    this.confirmOpen = true;
  }

  remove(cycle: Cycle | null) {
    if (!cycle) return;

    this.cyclesService.remove(cycle.id).subscribe({
      next: () => this.loadCycles(),
      error: () => this.loadCycles(),
    });
  }

  toggleLock(cycle: Cycle) {
    this.cyclesService.toggleLock(cycle.id).subscribe({
      next: () => this.loadCycles(),
      error: () => this.loadCycles(),
    });
  }

  onSave() {
    this.sideSheetOpen = false;
    this.loadCycles();
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadCycles();
  }

  onLimitChange(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.loadCycles();
  }
}

import { Component, DestroyRef, effect, inject, TemplateRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Expense, ExpenseFilters, ExpensesService } from '../services/expense.service';
import { ExpenseFormComponent } from '../components/create-expense-form/expense-form.component';
import { Edit, Eye, LucideAngularModule, Plus, Trash2, Settings, InfoIcon, FilterIcon } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { DataTableColumn } from '../../../../../shared/components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectType } from '../../../../../shared/enums';
import { ProjectContextService } from '../../../services/project-context.service';
import { ManageExpenseComponent } from '../components/manage-expense-form/manage-expense.component';
import { SafeUrlPipe } from '../../../../../shared/pipes/safeurl.pipe';
import { baseUrl } from '../../../../../shared/constants/endpoints.const';
import { DropdownLoader } from '../../../../../shared/helpers/dropdown-loader';
import { ReceiptsService } from '../../receipts/services/receipts.service';
import { CategoriesService } from '../../settings/components/categories/services/category.service';
import { TasksService } from '../../tasks/services/tasks.service';
import { CyclesService } from '../../cycles/services/cycles.service';

@Component({
  selector: 'app-list',
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ExpenseFormComponent,
    ManageExpenseComponent,
    SafeUrlPipe,
  ],
  templateUrl: './list.html',
})
export class List {
  router = inject(Router);
  previewOpen: boolean = false;
  filtersOpen: boolean = false;
  previewFileUrl: string | null = null;
  previewFileName: string | null = null;
  showReceiptModal: boolean = false;
  selectedReceiptUrl: string | null = null;
  expenses: Expense[] = [];
  @ViewChild('amountTpl', { static: true })
  amountTpl!: TemplateRef<{ $implicit: Expense }>;
  receiptsDropdown!: DropdownLoader<{ label: string; value: string; meta: any }>;
  categoriesDropdown!: DropdownLoader<{ label: string; value: string }>;
  tasksDropdown!: DropdownLoader<{ label: string; value: string }>;
  cyclesDropdown!: DropdownLoader<{ label: string; value: string }>;
  @ViewChild('incurredAtTpl', { static: true })
  incurredAtTpl!: TemplateRef<{ $implicit: Expense }>;

  @ViewChild(ExpenseFormComponent)
  expenseForm!: ExpenseFormComponent;

  readonly projectType = ProjectType;

  private expenseService = inject(ExpensesService);
  categoriesService = inject(CategoriesService)
  tasksService = inject(TasksService);
  cyclesService = inject(CyclesService);
  private context = inject(ProjectContextService);
  receiptsService = inject(ReceiptsService);

  readonly editIcon = Edit;
  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;
  readonly eyeIcon = Eye;
  readonly settingsIcon = Settings;
  readonly infoIcon = InfoIcon;
  readonly filterIcon = FilterIcon;

  loading = false;
  page = 1;
  limit = 10;
  totalPages = 0;
  total = 0;
  sideSheetOpen = false;
  openManage = false;
  selectedExpense: Expense | null = null;

  private search$ = new Subject<string>();
  private destroyRef = inject(DestroyRef);

  columns: DataTableColumn<Expense>[] = [];

  confirmOpen = false;

  filters: ExpenseFilters = {
    projectId: '',
    page: 1,
    limit: 10,
    search: '',
    orderBy: 'desc',
  };


  ngOnInit() {
    this.columns = [
      { key: 'note', label: 'Note', sortable: true },
      { key: 'vendor', label: 'Vendor' },
      { key: 'currency', label: 'Currency', sortable: false },
      { key: 'amount', label: 'Amount', sortable: true },
      { key: 'incurredAt', label: 'Incurred At', sortable: true, template: this.incurredAtTpl },
    ];
  }

  constructor() {
    effect(() => {
      const projectId = this.context.projectId();
      if (!projectId) return;

      // only update projectId, not the whole object
      this.filters.projectId = projectId;
      this.filters.page = 1;
      this.categoriesDropdown = new DropdownLoader(projectId, (params) =>
        this.categoriesService.getDropdown(params)
      );

      this.tasksDropdown = new DropdownLoader(projectId, (params) =>
        this.tasksService.getDropdown(params)
      );

      this.cyclesDropdown = new DropdownLoader(projectId, (params) =>
        this.cyclesService.getDropdown(params)
      );
      this.receiptsDropdown = new DropdownLoader(projectId, (params) =>
        this.receiptsService.getDropdown(params)
      );

      this.receiptsDropdown.load();
      this.categoriesDropdown.load();
      this.cyclesDropdown.load();
      this.tasksDropdown.load();
      this.fetchExpenses();
    });
    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.filters.search = value;
      this.filters.page = 1;
      this.fetchExpenses();
    });
  }

  fetchExpenses() {
    this.loading = true;
    const cleaned = this.cleanFilters(this.filters);
    this.expenseService
      .findAll(cleaned)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.expenses = res.data;
          this.totalPages = res.pagination.totalPages;
          this.total = res.pagination.total;
        },
        complete: () => (this.loading = false),
      });
  }

  private cleanFilters(filters: ExpenseFilters): ExpenseFilters {
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    ) as ExpenseFilters;
  }

  openConfirm(expense: any) {
    this.selectedExpense = expense;
    this.confirmOpen = true;
  }

  manage(expense: Expense) {
    this.selectedExpense = { ...expense };
    this.openManage = true;
  }

  remove(expense: Expense | null) {
    if (!expense) return;

    this.expenseService
      .remove(expense.id)
      .pipe(
        finalize(() => {
          this.fetchExpenses();
        })
      )
      .subscribe();
  }

  onSearchChange(search: string) {
    this.search$.next(search);
  }

  onPageChange(page: number) {
    this.filters.page = page;
    this.fetchExpenses();
  }

  onRowClick(expense: Expense) {
    this.selectedExpense = expense;
    this.sideSheetOpen = true;
  }

  // goToexpense(expense: Expense) {
  //   this.router.navigate([EXPE.ROOT, expense.id]);
  // }

  openCreateSheet() {
    this.selectedExpense = null;
    this.sideSheetOpen = true;
  }

  onSave() {
    this.sideSheetOpen = false;
    this.fetchExpenses();
  }

  onLimitChange(limit: number) {
    this.filters.limit = limit;
    this.filters.page = 1;
    this.fetchExpenses();
  }

  onDateChange(start: Date | null, end: Date | null) {
    this.filters.startDate = start?.toISOString();
    this.filters.endDate = end?.toISOString();
    this.filters.page = 1;
    this.fetchExpenses();
  }

  onCategoryChange(categoryId: string | null) {
    this.filters.categoryId = categoryId || undefined;
    this.filters.page = 1;
    this.fetchExpenses();
  }

  getUploadedFileUrl(fileUrl: string | null) {
    if (!fileUrl) return null;
    return `${baseUrl}${fileUrl}`;
  }

  openFilePreview() {
    const fileUrl = this.selectedExpense?.receipt?.fileUrl;
    const fileName = this.selectedExpense?.receipt?.originalFileName;
    if (!fileUrl || !fileName) return;
    this.previewFileUrl = this.getUploadedFileUrl(fileUrl);
    this.previewFileName = fileName;
    this.previewOpen = true;
  }

  isImage(url: string | null) {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|png|gif)$/i);
  }

  get expense() {
    return this.selectedExpense as Expense;
  }

  onReceiptSelect(id: string) {
    const receipt = this.receiptsDropdown.items.find((item) => item.value === id);
    this.selectedReceiptUrl = receipt?.meta?.fileUrl || null;
  }

  applyFilters() {
    this.filters.page = 1;
    this.fetchExpenses();
    this.filtersOpen = false;
  }

  resetFilters() {
    this.filters.startDate = undefined;
    this.filters.endDate = undefined;
    this.filters.categoryId = undefined;
    this.filters.taskId = undefined;
    this.filters.minAmount = undefined;
    this.filters.maxAmount = undefined;
    this.filters.page = 1;
    this.fetchExpenses();
  }
}

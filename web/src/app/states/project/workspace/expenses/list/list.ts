import { Component, DestroyRef, effect, inject, TemplateRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Expense, ExpenseFilters, ExpensesService } from '../services/expense.service';
import { ExpenseFormComponent } from '../components/create-expense-form/expense-form.component';
import { Edit, Eye, LucideAngularModule, Plus, Trash2, Settings } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { DataTableColumn } from '../../../../../shared/components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectType } from '../../../../../shared/enums';
import { ProjectContextService } from '../../../services/project-context.service';
import { ManageExpenseComponent } from '../components/manage-expense-form/manage-expense.component';

@Component({
  selector: 'app-list',
  imports: [SharedModule, CommonModule, FormsModule, LucideAngularModule, ExpenseFormComponent, ManageExpenseComponent],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List {
  router = inject(Router);

  expenses: Expense[] = [];
  @ViewChild('amountTpl', { static: true })
  amountTpl!: TemplateRef<{ $implicit: Expense }>;

  @ViewChild('incurredAtTpl', { static: true })
  incurredAtTpl!: TemplateRef<{ $implicit: Expense }>;

  @ViewChild(ExpenseFormComponent)
  expenseForm!: ExpenseFormComponent;

  readonly projectType = ProjectType;

  private expenseService = inject(ExpensesService);
  private context = inject(ProjectContextService);

  readonly editIcon = Edit;
  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;
  readonly eyeIcon = Eye;
  readonly settingsIcon = Settings;

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
      { key: 'currency', label: 'Currency', sortable: false},
      { key: 'amount', label: 'Amount', sortable: true},
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

  get expense() {
    return this.selectedExpense as Expense;
  }
}

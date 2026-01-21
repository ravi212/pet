import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X, Paperclip, Eye, Edit } from 'lucide-angular';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Expense, ExpensesService } from '../../services/expense.service';
import { CURRENCIES } from '../../../../../../shared/constants/common';
import { DropdownLoader } from '../../../../../../shared/helpers/dropdown-loader';
import { finalize } from 'rxjs';
import { RouterLink } from "@angular/router";

type EditableField =
  | 'amount'
  | 'currency'
  | 'incurredAt'
  | 'vendor'
  | 'note'
  | 'categoryId'
  | 'taskId'
  | 'cycleId'
  | 'isReimbursable'
  | 'reimbursedAmount';

@Component({
  selector: 'app-manage-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, SharedModule, RouterLink],
  templateUrl: './manage-expense.component.html',
})
export class ManageExpenseComponent implements OnInit {
  @Input() expense!: Expense;
  @Output() showReceiptView: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output() showAttachReceipt: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  @Input() categoriesDropdown!: DropdownLoader<{ label: string; value: string }>;
  @Input() tasksDropdown!: DropdownLoader<{ label: string; value: string }>;
  @Input() cyclesDropdown!: DropdownLoader<{ label: string; value: string }>;
  previewOpen = false;
  previewFileUrl: string | null = null;
  previewFileName: string | null = null;

  form!: FormGroup;
  saving = false;
  editingField: EditableField | null = null;

  categories = [];
  tasks = [];
  cycles = [];
  currencies = CURRENCIES;

  // Icons
  editIcon = Edit;
  checkIcon = Check;
  closeIcon = X;
  attachIcon = Paperclip;
  viewIcon = Eye;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService,
  ) {}

  ngOnInit() {
    // Initialize all controls upfront
    this.form = this.fb.group({
      amount: [this.expense.amount],
      currency: [this.expense.currency],
      vendor: [this.expense.vendor],
      incurredAt: [this.expense.incurredAt],
      categoryId: [this.expense.category?.id],
      taskId: [this.expense.task?.id],
      cycleId: [this.expense.cycle?.id],
      isReimbursable: [this.expense.isReimbursable],
      reimbursedAmount: [this.expense.reimbursedAmount],
      note: [this.expense.note],
    });

    this.categoriesDropdown.load();
    this.cyclesDropdown.load();
    this.tasksDropdown.load();
  }

  startEdit(field: EditableField) {
    this.editingField = field;
  }

  fetchCategories() {
    this.expenseService;
  }

  cancelEdit() {
    if (!this.editingField) return; // exit if nothing is being edited

    const field = this.editingField; // now TypeScript knows it's EditableField
    const originalValue = (this.expense as any)[field];

    this.form.get(field)?.setValue(originalValue);
    this.editingField = null;
  }

  getControl<T = any>(name: string): FormControl<T> {
    return this.form.get(name) as FormControl<T>;
  }

  save(field: string) {
    if (!this.form.get(field)?.valid) return;

    this.saving = true;
    const value =
      field === 'incurredAt'
        ? new Date(this.form.get(field)?.value).toISOString()
        : this.form.get(field)?.value;

    this.expenseService.update(this.expense.id, { [field]: value }).pipe(
      finalize(() => (this.saving = false))
    ).subscribe({
      next: (response) => {
        this.expense = response.data as Expense;
        (this.expense as any)[field] = value;
        this.editingField = null;
      },
      error: (err) => console.error('Failed to update', err),
    });
  }

  attachReceipt(file: File | null) {
    console.log('Attach receipt:', file);
  }

  viewReceipt() {
    this.showReceiptView.emit(true);
  }

}

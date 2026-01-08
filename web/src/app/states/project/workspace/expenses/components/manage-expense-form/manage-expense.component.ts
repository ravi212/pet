import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X, Paperclip, Eye, Edit } from 'lucide-angular';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Expense, ExpensesService } from '../../services/expense.service';
import { CURRENCIES } from '../../../../../../shared/constants/common';

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
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, SharedModule],
  templateUrl: './manage-expense.component.html',
})
export class ManageExpenseComponent implements OnInit {
  @Input() expense!: Expense;

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

  constructor(private fb: FormBuilder, private expenseService: ExpensesService) {}

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
  }

  startEdit(field: EditableField) {
    this.editingField = field;
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

    this.expenseService.update(this.expense.id, { [field]: value }).subscribe({
      next: () => {
        (this.expense as any)[field] = value;
        this.editingField = null;
      },
      error: (err) => console.error('Failed to update', err),
      complete: () => (this.saving = false),
    });
  }

  attachReceipt(file: File | null) {
    console.log('Attach receipt:', file);
  }

  viewReceipt() {
    console.log('View receipt');
  }
}

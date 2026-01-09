import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Expense, ExpensesService } from '../../services/expense.service';
import { resolveError } from '../../../../../../shared/helpers/form-errors.util';
import { CURRENCIES } from '../../../../../../shared/constants/common';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './expense-form.component.html',
})
export class ExpenseFormComponent implements OnInit {
  @Input() expense: Expense | null = null;
  @Input() projectId!: string;
  @Output() saved = new EventEmitter<void>();
  categories = [];
  tasks = [];
  cycles = [];

  form!: FormGroup;
  submitting = false;
  currencies = CURRENCIES;
  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      amount: [
        this.expense?.amount ?? '',
        [Validators.required, Validators.pattern(/^\d+$/)],
      ],
      currency: [this.expense?.currency ?? 'INR', Validators.required],
      incurredAt: [
        this.expense?.incurredAt
          ? new Date(this.expense.incurredAt)
          : new Date(),
        Validators.required,
      ],

      vendor: [this.expense?.vendor ?? ''],
      note: [this.expense?.note ?? ''],

    });
  }

  getError(name: string) {
    return resolveError(this.form.get(name));
  }

  submit() {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;

    const raw = this.form.value;

    const payload = {
      ...raw,
      incurredAt: new Date(raw.incurredAt).toISOString(),
      projectId: this.projectId,
    };

    const request$ = this.expense
      ? this.expenseService.update(this.expense.id, payload)
      : this.expenseService.create(payload);

    request$.subscribe({
      next: () => {
        this.form.reset();
        this.saved.emit();
      },
      error: (err) => {
        console.error('Failed to save expense', err);
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }
}

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Expense, ExpensesService } from '../../services/expense.service';
import { resolveError } from '../../../../../../shared/helpers/form-errors.util';
import { CURRENCIES } from '../../../../../../shared/constants/common';
import { finalize } from 'rxjs';

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
  isSubmitting = false;
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() submitting = new EventEmitter<boolean>();
  categories = [];
  tasks = [];
  cycles = [];

  form!: FormGroup;

  currencies = CURRENCIES;
  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      amount: [this.expense?.amount ?? '', [Validators.required, Validators.pattern(/^\d+$/)]],
      currency: [this.expense?.currency ?? 'INR', Validators.required],
      incurredAt: [
        this.expense?.incurredAt ? new Date(this.expense.incurredAt) : new Date(),
        Validators.required,
      ],

      vendor: [this.expense?.vendor ?? ''],
      note: [this.expense?.note ?? ''],
    });
    this.form.statusChanges.subscribe((status) => {
      this.validityChange.emit(status === 'VALID');
    });
  }

  getError(name: string) {
    return resolveError(this.form.get(name));
  }

  submit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitting.emit(true);

    const raw = this.form.value;

    const payload = {
      ...raw,
      incurredAt: new Date(raw.incurredAt).toISOString(),
      projectId: this.projectId,
    };

    const request$ = this.expense
      ? this.expenseService.update(this.expense.id, payload)
      : this.expenseService.create(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.submitting.emit(false);
        }),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.saved.emit();
        },
        error: (err) => {
          console.error('Failed to save expense', err);
        },
      });
  }
}

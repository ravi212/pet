import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Cycle, CyclesService } from '../../services/cycles.service';
import { resolveError } from '../../../../../../shared/helpers/form-errors.util';

@Component({
  selector: 'app-cycle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './cycle-form.component.html',
})
export class CycleFormComponent implements OnInit {
  @Input() cycle: Cycle | null = null;
  @Input() projectId!: string;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;

  rolloverOptions = [
    { label: 'No Rollover', value: 'none' },
    { label: 'Rollover Positive Balance', value: 'rollover_positive' },
    { label: 'Rollover Negative Balance', value: 'rollover_negative' },
  ];

  constructor(
    private fb: FormBuilder,
    private cyclesService: CyclesService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      cycleStart: [this.cycle?.cycleStart || null, Validators.required],
      cycleEnd: [this.cycle?.cycleEnd || null, Validators.required],
      budgetAmount: [
        this.cycle?.budgetAmount || '',
        [Validators.required, Validators.min(0)],
      ],
      rolloverMode: [this.cycle?.rolloverMode || 'none'],
    });
  }

  getError(name: string) {
    return resolveError(this.form.get(name));
  }

  submit() {
    if (this.form.invalid) return;

    const payload = {
      ...this.form.value,
      projectId: this.projectId,
    };

    const request = this.cycle
      ? this.cyclesService.update(this.cycle.id, payload)
      : this.cyclesService.create(payload);

    request.subscribe({
      next: () => {
        this.form.reset();
        this.saved.emit();
      },
      error: (err) => {
        console.error('Failed to save cycle', err);
      },
    });
  }
}

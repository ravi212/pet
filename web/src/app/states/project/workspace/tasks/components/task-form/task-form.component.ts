import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../../../../../shared/shared.module';
import { TasksService, Task } from '../../services/tasks.service';
import { resolveError } from '../../../../../../shared/helpers/form-errors.util';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() projectId!: string;
  @Output() saved = new EventEmitter<void>();
  isSubmitting = false;
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() submitting = new EventEmitter<boolean>();

  form!: FormGroup;

  statusOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'done' },
  ];

  constructor(
    private fb: FormBuilder,
    private tasksService: TasksService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: [this.task?.title || '', Validators.required],
      description: [this.task?.description || ''],
      status: [this.task?.status || 'todo', Validators.required],
      budgetAmount: [this.task?.budgetAmount || '', Validators.min(0)],
      assignedTo: [this.task?.assignedTo || ''],
    });
    this.form.statusChanges.subscribe((status) => {
      this.validityChange.emit(status === 'VALID');
    });
  }

  getError(name: string) {
    return resolveError(this.form.get(name));
  }

  submit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.submitting.emit(true);
    const payload = {
      ...this.form.value,
      projectId: this.projectId,
    };

    const request = this.task
      ? this.tasksService.update(this.task.id, payload)
      : this.tasksService.create(payload);

    request
      .pipe(
        finalize(() => {
          this.submitting.emit(false);
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.saved.emit();
        },
        error: (err) => {
          console.error('Failed to save task', err);
        },
      });
  }
}

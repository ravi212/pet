import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../../../../shared/shared.module';
import { Category } from '../../../../../../../../shared/models';
import { CategoriesService } from '../../services/category.service';
import { resolveError } from '../../../../../../../../shared/helpers/form-errors.util';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './categories-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  @Input() category: Category | null = null;
  @Input() projectId!: string;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;

  constructor(private fb: FormBuilder, private categoriesService: CategoriesService) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.category?.name ?? '', [Validators.required, Validators.maxLength(50)]],
      color: [this.category?.color ?? '#3b82f6', Validators.required],
    });
  }

  getError(name: string) {
    return resolveError(this.form.get(name));
  }

  submit() {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;

    const payload = {
      ...this.form.value,
      projectId: this.projectId,
    };

    const request$ = this.category
      ? this.categoriesService.update(this.category.id, payload)
      : this.categoriesService.create(payload);

    request$
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.form.reset();
        })
      )
      .subscribe({
        next: () => {
          this.saved.emit();
        },
        error: (err) => console.error('Failed to save category', err),
      });
  }
}

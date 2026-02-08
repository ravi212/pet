import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CollaboratorsService } from '../../services/collaborators.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ProjectContextService } from '../../../../../../services/project-context.service';
import { ModalComponent, ButtonComponent, InputComponent } from '../../../../../../../../shared/components';

@Component({
  selector: 'app-add-member-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, ButtonComponent, InputComponent],
  template: `
    <app-modal
      [isOpen]="true"
      title="Add Member"
      [showFooter]="false"
      width="400px"
      (closeModal)="onClose()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Email Field -->
        <app-input
          formControlName="email"
          type="email"
          label="Email Address"
          placeholder="john@example.com"
          [error]="getEmailError()"
          [required]="true"
        ></app-input>

        <!-- Role Field -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            id="role"
            formControlName="role"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            @for (role of roles; track role.value) {
            <option [value]="role.value">{{ role.label }}</option>
            }
          </select>
        </div>

        <!-- Error Message -->
        @if (error) {
        <div class="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {{ error }}
        </div>
        }

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-6">
          <app-button variant="outline" (click)="onClose()">
            Cancel
          </app-button>
          <app-button type="submit" [disabled]="isSubmitDisabled" [loading]="loading">
            Add Member
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AddMemberModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() memberAdded = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private collaboratorsService = inject(CollaboratorsService);
  private context = inject(ProjectContextService);
  private destroyRef = inject(DestroyRef);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['viewer', [Validators.required]],
  });

  loading = false;
  error = '';
  roles = [
    { value: 'editor', label: 'Editor - Can create and edit content' },
    { value: 'commenter', label: 'Commenter - Can add notes and comments' },
    { value: 'viewer', label: 'Viewer - Read-only access' },
  ];

  getEmailError(): string {
    const emailControl = this.form.get('email');
    if (!emailControl?.touched) return '';
    if (emailControl?.hasError('required')) return 'Email is required';
    if (emailControl?.hasError('email')) return 'Please enter a valid email';
    return '';
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;

    const projectId = this.context.projectId();
    if (!projectId) return;

    this.loading = true;
    this.error = '';

    this.collaboratorsService
      .addCollaborator(projectId, {
        email: this.form.value.email || '',
        role: (this.form.value.role || 'viewer') as any,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: () => {
          this.form.reset({ role: 'viewer' });
          this.memberAdded.emit();
          this.close.emit();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to add member';
        },
      });
  }

  onClose() {
    this.close.emit();
  }

  get isSubmitDisabled() {
    return this.form.invalid || this.loading;
  }
}

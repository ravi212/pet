import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, ChangePasswordDto } from '../../services/user.service';
import { LucideAngularModule, Check, X } from 'lucide-angular';
import { SharedModule } from '../../../../shared/shared.module';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, LucideAngularModule],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  form: FormGroup;
  saving = false;
  successMessage = '';
  errorMessage = '';

  checkIcon = Check;
  closeIcon = X;

  constructor() {
    this.form = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const dto: ChangePasswordDto = {
      currentPassword: this.form.value.oldPassword,
      newPassword: this.form.value.newPassword,
    };

    this.userService
      .changePassword(dto)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Password changed successfully';
          this.resetForm();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to change password';
        },
      });
  }

  resetForm() {
    this.form.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }
}

import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { AuthResponse } from '../../../../shared/models';
import { resolveError } from '../../../../shared/helpers/form-errors.util';

@Component({
  selector: 'app-signup',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isSubmitting = false;

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  readonly signupForm = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.confirmPasswordValidator.bind(this) }
  );

  getError(name: string) {
    return resolveError(this.signupForm.get(name));
  }

  getConfirmPasswordError(): string | null {
    const control = this.signupForm.get('confirmPassword');
    if (!control || !(control.dirty || control.touched)) return null;

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (this.signupForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return null;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      const { confirmPassword, ...payload } = this.signupForm.getRawValue();
      this.authService
        .signup(payload)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response: AuthResponse) => {
            console.log('Signup successful:', response);
            this.signupForm.reset();
          },
          error: (err) => {
            console.log('Signup error:', err);
          },
        });
    }
  }
}

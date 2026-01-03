import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../../../shared/models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isSubmitting = false;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    console.log('Login form submitted');
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.authService.login(this.loginForm.value as LoginDto).pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.isSubmitting = false;
        },
      });
    }
  }
}

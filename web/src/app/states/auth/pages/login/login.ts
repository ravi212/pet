import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../../../shared/models';
import { finalize, switchMap } from 'rxjs';
import { resolveError } from '../../../../shared/helpers/form-errors.util';
import { Router } from '@angular/router';
import { PROJECT_ROUTES } from '../../../../shared/constants/routes.const';

@Component({
  selector: 'app-login',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = false;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  getError(name: string) {
    return resolveError(this.loginForm.get(name));
  }

  onSubmit() {
    console.log('Login form submitted');
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.authService
        .login(this.loginForm.value as LoginDto)
        .pipe(
          switchMap(() => {
            return this.authService.checkAuth();
          }),
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: () => {
            this.router.navigateByUrl(`/${PROJECT_ROUTES.ROOT}/${PROJECT_ROUTES.LIST}`);
          },
          error: (error) => {
            console.error('Login failed:', error);
          },
        });
    }
  }
}

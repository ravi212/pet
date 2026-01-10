import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, RouterLink, SharedModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  verificationToken: string | null = null;
  loading = true;
  success = false;
  error: string | null = null;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.verificationToken = params['token'] || null;
      if (!this.verificationToken) {
        this.loading = false;
        this.error = 'Invalid or missing verification token';
        return;
      }

      this.verifyToken(this.verificationToken);
    });
  }

  private verifyToken(token: string) {
    this.authService
      .verifyEmail(token)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.success = true;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Email verification failed';
        },
      });
  }
}

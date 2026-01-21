import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, tap, finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserProfile, UserService } from '../../../settings/services/user.service';
import { UserStore } from '../../../settings/services/user.store';
import { PROJECT_ROUTES } from '../../../../shared/constants/routes.const';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `
    <div class="h-screen flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-600">Signing you in…</p>
      </div>
    </div>
  `,
})
export class GoogleCallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private userStore = inject(UserStore);
  private router = inject(Router);

  ngOnInit() {
    this.auth
      .checkAuth()
      .pipe(
        switchMap(() => this.userService.getProfile(true)),
        tap((res) => {
          this.userStore.setUser(res.data as UserProfile);
        }),
        finalize(() => {
          this.router.navigateByUrl(`${PROJECT_ROUTES.ROOT}/${PROJECT_ROUTES.LIST}`);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Google login failed', err);
          this.router.navigateByUrl('/auth/login');
        },
      });
  }
}

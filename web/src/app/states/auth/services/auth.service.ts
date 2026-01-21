import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { endpoints } from '../../../shared/constants/endpoints.const';
import { AuthResponse, LoginDto, SignupPayload, User } from '../../../shared/models';
import { UserStore } from '../../settings/services/user.store';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated = signal<boolean>(false);
  userStore = inject(UserStore);
  user = signal<Partial<User> | null>(null);

  private setAuth(user: Partial<User>) {
    this.user.set(user);
    this.isAuthenticated.set(true);
  }

  clearAuth() {
    this.user.set(null);
    this.userStore.clearUser();
    this.isAuthenticated.set(false);
  }

  get userDetails() {
    return this.user.asReadonly();
  }

  constructor(private readonly api: ApiService) {}

  login(payload: LoginDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(endpoints.auth.login, payload);
  }

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(endpoints.auth.signup, payload);
  }

  verifyEmail(token: string): Observable<any> {
    return this.api.get(endpoints.auth.verifyEmail(token));
  }

  refreshToken(): Observable<{ success: boolean }> {
    return this.api.post(endpoints.auth.refreshToken, {}, {silent: true});
  }

  checkAuth(): Observable<Partial<User> | null> {
    return this.api.get<Partial<User>>(endpoints.auth.checkAuth, {silent: true}).pipe(
      tap((user) => this.setAuth(user)),
      catchError((err) => {
        this.clearAuth();
        return of(null);
      })
    );
  }

  logout(): Observable<any> {
    return this.api.post(endpoints.auth.logout).pipe(tap(() => this.clearAuth()));
  }
}

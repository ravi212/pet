import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { endpoints } from '../../../shared/constants/endpoints.const';
import { AuthResponse, LoginDto, SignupPayload } from '../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly api: ApiService) {}

  login(payload: LoginDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(endpoints.auth.login, payload);
  }

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(endpoints.auth.signup, payload);
  }

  verifyEmail(token: string): Observable<any> {
    return this.api.post<any>(endpoints.auth.verifyEmail, { token });
  }
}

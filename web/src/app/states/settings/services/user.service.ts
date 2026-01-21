import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { endpoints } from '../../../shared/constants/endpoints.const';
import { ApiResponse } from '../../../shared/models';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
  provider: 'local' | 'google';
  emailVerified: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  timezone?: string;
  locale?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getProfile(silent: boolean = false): Observable<ApiResponse<UserProfile>> {
    return this.api.get<ApiResponse<UserProfile>>(endpoints.user.profile, { silent });
  }

  updateProfile(dto: UpdateProfileDto): Observable<ApiResponse<UserProfile>> {
    return this.api.patch<ApiResponse<UserProfile>>(endpoints.user.profile, dto);
  }

  uploadAvatar(file: File): Observable<ApiResponse<{ avatarUrl: string }>>{
    const formData = new FormData();
    formData.append('avatar', file);

    return this.api.post<ApiResponse<{ avatarUrl: string }>>(endpoints.user.avatar, formData);
  }

  deleteAvatar() {
    return this.api.delete(endpoints.user.avatar);
  }

  changePassword(dto: ChangePasswordDto) {
    return this.api.post(endpoints.user.changePassword, dto);
  }
}

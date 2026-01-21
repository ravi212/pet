import { Component, inject } from '@angular/core';
import { ProfileComponent } from './components/profile/profile.component';
import { ActivatedRoute } from '@angular/router';
import { UserStore } from './services/user.store';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

type SettingsTab = 'profile' | 'change password';

@Component({
  selector: 'app-settings',
  imports: [ProfileComponent, ChangePasswordComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  userStore = inject(UserStore);
  activeTab: SettingsTab = 'profile';
  route = inject(ActivatedRoute);

  tabs = [
    { key: 'profile' as const, label: 'Profile' },
    { key: 'change password' as const, label: 'Change Password' },
  ];
}

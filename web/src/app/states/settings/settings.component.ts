import { Component } from '@angular/core';
import { ProfileComponent } from './components/profile/profile.component';

type SettingsTab = 'profile';

@Component({
  selector: 'app-settings',
  imports: [ProfileComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  activeTab: SettingsTab = 'profile';

  tabs = [
    { key: 'profile' as const, label: 'Profile' },
    // { key: 'members' as const, label: 'Members' },
  ];
}

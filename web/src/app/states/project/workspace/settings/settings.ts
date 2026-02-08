import { Component } from '@angular/core';
import { CategoriesComponent } from './components/categories/list';
import { MembersComponent } from './components/members/list';
import { SharedModule } from '../../../../shared/shared.module';

type SettingsTab = 'categories' | 'cycles' | 'members';

@Component({
  selector: 'app-settings',
  imports: [CategoriesComponent, MembersComponent, SharedModule],
  templateUrl: './settings.html',
})
export class SettingsComponent {
  activeTab: SettingsTab = 'categories';

  tabs = [
    { key: 'categories' as const, label: 'Categories' },
    { key: 'members' as const, label: 'Members' },
  ];
}

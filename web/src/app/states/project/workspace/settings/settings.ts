import { Component } from '@angular/core';
import { CategoriesComponent } from './components/categories/categories.component';

type SettingsTab = 'categories' | 'cycles' | 'members';

@Component({
  selector: 'app-settings',
  imports: [CategoriesComponent],
  templateUrl: './settings.html',
})

export class SettingsComponent {
  activeTab: SettingsTab = 'categories';

  tabs = [
    { key: 'categories' as const, label: 'Categories' },
    // { key: 'members' as const, label: 'Members' },
  ];
}


import { Component, inject } from '@angular/core';
import { ComingSoonComponent } from '../../../../shared/pages/coming-soon/coming-soon.component';
import { AlertCircleIcon } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [ComingSoonComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private router = inject(Router)
  alertIcon = AlertCircleIcon;
  goBack() {
  window.history.length > 1
    ? window.history.back()
    : this.router.navigate(['/']);
}
}

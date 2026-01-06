import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../states/auth/services/auth.service';
import { switchMap } from 'rxjs';
import { AUTH_ROUTES } from '../../shared/constants/routes.const';

@Component({
  standalone: true,
  imports: [RouterOutlet, SharedModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <router-outlet />
    </div>
  `,
})
export class ProjectsLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  async logOut() {
    this.auth.logout().subscribe(res => {
      this.router.navigateByUrl(`${AUTH_ROUTES.ROOT}/${AUTH_ROUTES.LOGIN}`);
    });
    console.log('logout');
  }
}

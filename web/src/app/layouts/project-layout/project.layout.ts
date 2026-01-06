import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="w-full max-w-7xl mx-auto px-10 py-8 ">
      <router-outlet />
    </div>
  `,
})
export class ProjectLayoutComponent {}

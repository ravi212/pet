import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: `
  <div class="min-h-screen w-full flex items-center justify-center">
    <div class="w-full">
      <router-outlet />
    </div>
  </div>
  `,
})
export class AuthLayoutComponent {}

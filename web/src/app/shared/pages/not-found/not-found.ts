import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from "../../components";
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-not-found',
  imports: [ButtonComponent, SharedModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigateByUrl('/');
  }
}

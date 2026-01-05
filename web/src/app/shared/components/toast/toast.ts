import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Toast } from '../../models/toast.model';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  constructor(public toastService: ToastService) {
    this.toasts$ = this.toastService.toastStream;
  }

  trackById(_: number, toast: Toast) {
    return toast.id;
  }
}

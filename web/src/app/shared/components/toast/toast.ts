import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
  toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  trackById(_: number, toast: Toast) {
    return toast.id;
  }
}

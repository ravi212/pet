import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../shared/models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private counter = 0;

  toasts = signal<Toast[]>([]);

  show(
    message: string,
    type: ToastType = 'info',
    duration = 3000
  ) {
    const toast: Toast = {
      id: ++this.counter,
      message,
      type,
      duration,
    };

    this.toasts.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  remove(id: number) {
    this.toasts.update(list =>
      list.filter(t => t.id !== id)
    );
  }

  clear() {
    this.toasts.set([]);
  }
}

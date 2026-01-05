import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast, ToastType } from '../../shared/models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private counter = 0;

  get toastStream() {
    return this.toasts$.asObservable();
  }

  show(
    message: string,
    type: ToastType = 'info',
    duration = 5000
  ) {
    const toast: Toast = {
      id: ++this.counter,
      message,
      type,
      duration,
    };

    this.toasts$.next([...this.toasts$.value, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  remove(id: number) {
    this.toasts$.next(
      this.toasts$.value.filter(t => t.id !== id)
    );
  }

  clear() {
    this.toasts$.next([]);
  }
}

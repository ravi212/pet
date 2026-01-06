import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div
      class="flex items-center justify-between px-4 py-3 bg-light-50 dark:bg-dark-800 rounded-xl"
    >
      <div class="text-sm text-light-600 dark:text-dark-400">
        Page {{ page }} of {{ totalPages }} | Total {{ total }} items
      </div>

      <div class="flex gap-2">
        <app-button [disabled]="page === 1" (click)="changePage(page - 1)" variant="outline"
          >Prev</app-button
        >

        <app-button
          *ngFor="let p of pagesToShow"
          [variant]="p === page ? 'secondary' : 'outline'"
          (click)="changePage(p)"
          >{{ p }}</app-button
        >

        <app-button
          [disabled]="page === totalPages"
          (click)="changePage(page + 1)"
          variant="outline"
          >Next</app-button
        >
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-light-600 dark:text-dark-400">Items per page:</span>
        <select
          class="rounded border px-2 py-1"
          [value]="limit"
          (change)="onLimitChange($any($event.target).value)"
        >
          <option *ngFor="let size of pageSizes" [value]="size">{{ size }}</option>
        </select>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() limit = 10;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  get pagesToShow() {
    const totalPages = this.totalPages;
    const pages: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.page - 1 && i <= this.page + 1)) {
        pages.push(i);
      }
    }
    return pages;
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.pageChange.emit(p);
  }

  pageSizes = [10, 20, 50];

  onLimitChange(newLimit: string | number) {
    this.limit = Number(newLimit);
    // this.pageChange.emit(1);
    this.limitChange.emit(this.limit);
  }
}

import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  template?: TemplateRef<{ $implicit: T }>;
}

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: './datatable.component.html',
})
export class DataTableComponent<T> {
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() rowKey: keyof T = 'id' as keyof T;
  @Input() selectable = false;

  /** 👉 NEW */
  @Input() actionsTemplate?: TemplateRef<{ $implicit: T }>;

  @Output() sortChange = new EventEmitter<{ key: keyof T; dir: 'asc' | 'desc' }>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  sortKey: keyof T | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  selectedRows = new Set<T>();

  sort(column: DataTableColumn<T>) {
    if (!column.sortable) return;

    if (this.sortKey === column.key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = column.key as keyof T;
      this.sortDir = 'asc';
    }

    this.sortChange.emit({ key: this.sortKey!, dir: this.sortDir });
  }

  trackByRow(_: number, row: T) {
    return row[this.rowKey];
  }

  getValue(row: T, key: keyof T | string) {
    return row[key as keyof T];
  }

  toggleRow(row: T) {
    if (!this.selectable) return;

    this.selectedRows.has(row)
      ? this.selectedRows.delete(row)
      : this.selectedRows.add(row);

    this.selectionChange.emit([...this.selectedRows]);
  }

  isSelected(row: T) {
    return this.selectedRows.has(row);
  }
}

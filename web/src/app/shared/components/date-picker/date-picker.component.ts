import { Component, Input, forwardRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar } from 'lucide-angular';

type InputSize = 'sm' | 'md' | 'lg';
@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppDatePickerComponent),
      multi: true,
    },
  ],
  templateUrl: './date-picker.component.html',
})
export class AppDatePickerComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() required = false;
  @Input() error?: string | null = null;
  @Input() hint?: string;
  @Input() disabled = false;
  @Input() size: InputSize = 'sm';
  open = false;
  value: string | null = null;

  current = new Date();
  viewMonth = this.current.getMonth();
  viewYear = this.current.getFullYear();
  calender = Calendar;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: string | null): void {
    this.value = value;
    if (value) {
      const d = new Date(value);
      this.viewMonth = d.getMonth();
      this.viewYear = d.getFullYear();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggle() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  select(date: Date) {
    const iso = this.toLocalISO(date);
    this.value = iso;
    this.onChange(iso);
    this.onTouched();
    this.open = false;
  }

  prevMonth() {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else this.viewMonth--;
  }

  nextMonth() {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else this.viewMonth++;
  }

  daysInMonth() {
    return new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
  }

  startDay() {
    return new Date(this.viewYear, this.viewMonth, 1).getDay();
  }

  isSelected(day: number) {
    if (!this.value) return false;

    const iso = this.toLocalISO(new Date(this.viewYear, this.viewMonth, day));

    return this.value === iso;
  }

  selectDay(day: number) {
    const date = new Date(this.viewYear, this.viewMonth, day);
    this.select(date);
  }

  get displayValue(): string {
    if (!this.value) return 'Select date';
    const d = new Date(this.value);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getSizeClasses(): string {
    const sizes: Record<InputSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    return sizes[this.size];
  }

  private toLocalISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  @HostListener('document:click', ['$event'])
  closeOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.date-picker')) {
      this.open = false;
    }
  }
}

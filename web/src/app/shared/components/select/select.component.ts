import { NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type SelectState = 'default' | 'error' | 'success';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  template: `
    <div class="w-full">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          {{ label }}
          @if (required) {
            <span class="text-danger">*</span>
          }
        </label>
      }

      <select
        [id]="id"
        [multiple]="multiple"
        [disabled]="disabled"
        (change)="onSelect($event)"
        (blur)="onBlur()"
        [ngClass]="getClasses()"
        class="w-full px-4 py-2 rounded-sm transition-all duration-150
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          outline-none"
      >
        @if (!multiple && placeholder) {
          <option value="" disabled selected>{{ placeholder }}</option>
        }

        @for (option of options; track option.value) {
          <option
            [value]="option.value"
            [disabled]="option.disabled"
            [selected]="isSelected(option.value)"
          >
            {{ option.label }}
          </option>
        }
      </select>

      @if (error) {
        <p class="mt-1 text-sm text-danger">{{ error }}</p>
      } @else if (hint) {
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ hint }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() id = 'select-' + Math.random().toString(36).slice(2);
  @Input() label: string | null = null;
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() error: string | null = null;
  @Input() hint: string | null = null;

  value: string | string[] | null = this.multiple ? [] : null;

  @Output() valueChange = new EventEmitter<string | string[]>();

  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(event: Event) {
    const select = event.target as HTMLSelectElement;

    const value = this.multiple
      ? Array.from(select.selectedOptions).map(o => o.value)
      : select.value;

    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onBlur() {
    this.onTouched();
  }

  isSelected(value: string): boolean {
    return this.multiple
      ? Array.isArray(this.value) && this.value.includes(value)
      : this.value === value;
  }

  getClasses(): string {
    const state: SelectState = this.error ? 'error' : 'default';

    return {
      default:
        'border border-gray-200 dark:border-gray-700 focus:border-slate-400 dark:focus:border-slate-300 focus:ring-2 focus:ring-slate-400/15 dark:focus:ring-slate-300/20',
      error:
        'border border-danger focus:border-danger focus:ring-2 focus:ring-danger/20',
      success:
        'border border-success focus:border-success focus:ring-2 focus:ring-success/20',
    }[state];
  }
}

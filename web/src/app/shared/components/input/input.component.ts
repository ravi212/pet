import { NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
type InputState = 'default' | 'error' | 'success';
type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
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
      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [ngClass]="[getInputClasses(), getSizeClasses()]"
        class="w-full px-4 py-2 rounded-sm transition-all duration-150
       bg-white dark:bg-gray-800
       text-gray-900 dark:text-gray-100
       placeholder-gray-400 dark:placeholder-gray-500
       outline-none
       focus:border-slate-400 dark:focus:border-slate-300
       focus:ring-2 focus:ring-slate-400/15
       dark:focus:ring-slate-300/20y"
      />
      @if (error) {
      <p class="mt-1 text-sm text-danger">{{ error }}</p>
      } @if (hint && !error) {
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ hint }}</p>
      }
    </div>
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = 'input-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string | null = null;
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() disabled: boolean | null = false;
  @Input() required: boolean | null = false;
  @Input() error: string | null = null;
  @Input() hint: string | null = null;
  @Input() value = '';
  @Input() size: InputSize = 'sm';

  @Output() inputChange = new EventEmitter<string>();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  getInputClasses(): string {
    const baseClasses =
      'border text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500';

    const stateClasses: Record<InputState, string> = {
      default:
        'border border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:border-slate-400 dark:focus:border-slate-300 focus:ring-2 focus:ring-slate-400/15 dark:focus:ring-slate-300/20',
      error:
        'border border-danger text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:border-danger focus:ring-2 focus:ring-danger/20',
      success:
        'border border-success text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:border-success focus:ring-2 focus:ring-success/20',
    };

    const currentState: InputState = this.error ? 'error' : 'default';
    const disabledClass = this.disabled ? 'disabled-state' : '';

    return `${baseClasses} ${stateClasses[currentState]} ${disabledClass}`;
  }

  getSizeClasses(): string {
    const sizes: Record<InputSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    return sizes[this.size];
  }
}

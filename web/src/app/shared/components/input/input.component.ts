import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
type InputState = 'default' | 'error' | 'success';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="w-full">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
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
        [class]="getInputClasses()"
        class="w-full px-4 py-2 rounded-md transition-all duration-base focus-ring bg-white dark:bg-gray-800"
      />
      @if (error) {
        <p class="mt-2 text-sm text-danger">{{ error }}</p>
      }
      @if (hint && !error) {
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ hint }}</p>
      }
    </div>
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = 'input-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string | null = null;
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() error: string | null = null;
  @Input() hint: string | null = null;
  @Input() value = '';

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
    const baseClasses = 'border-2 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500';

    const stateClasses: Record<InputState, string> = {
      default: 'border-gray-300 focus:border-primary dark:border-gray-600 dark:focus:border-primary-dark',
      error: 'border-danger focus:border-danger',
      success: 'border-success focus:border-success',
    };

    const currentState: InputState = this.error ? 'error' : 'default';
    const disabledClass = this.disabled ? 'disabled-state' : '';

    return `${baseClasses} ${stateClasses[currentState]} ${disabledClass}`;
  }
}

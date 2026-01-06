import { NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

type TextareaState = 'default' | 'error' | 'success';

@Component({
  selector: 'app-textarea',
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

      <textarea
        [id]="id"
        [rows]="rows"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [ngClass]="getClasses()"
        class="w-full px-4 py-2 rounded-sm transition-all duration-150
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          outline-none resize-none"
      ></textarea>

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
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() id = 'textarea-' + Math.random().toString(36).slice(2);
  @Input() label: string | null = null;
  @Input() placeholder = '';
  @Input() rows = 3;
  @Input() disabled = false;
  @Input() required = false;
  @Input() error: string | null = null;
  @Input() hint: string | null = null;

  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();

  private onChange = (_: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
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

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onBlur() {
    this.onTouched();
  }

  getClasses(): string {
    const state: TextareaState = this.error ? 'error' : 'default';

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

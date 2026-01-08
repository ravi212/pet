import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

@Component({
  selector: 'app-radio-group',
  standalone: true,
  templateUrl: './radio-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppRadioGroupComponent),
      multi: true,
    },
  ],
})
export class AppRadioGroupComponent<T = any>
  implements ControlValueAccessor
{
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() options: RadioOption<T>[] = [];
  @Input() disabled = false;

  value!: T;

  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  select(option: RadioOption<T>) {
    if (this.disabled || option.disabled) return;
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
  }

  // CVA
  writeValue(value: T): void {
    this.value = value;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isSelected(option: RadioOption<T>) {
    return option.value === this.value;
  }
}

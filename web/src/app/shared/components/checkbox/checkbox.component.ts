import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppCheckboxComponent),
      multi: true,
    },
  ],
})
export class AppCheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() disabled = false;

  value = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(checked: boolean) {
    if (this.disabled) return;
    this.value = checked;
    this.onChange(this.value);
    this.onTouched();
  }

  // CVA methods
  writeValue(value: boolean): void {
    this.value = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

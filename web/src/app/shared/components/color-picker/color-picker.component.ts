import { Component, forwardRef, signal, computed, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { COLOR_PALETTE } from '../../constants/common';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
  templateUrl: './color-picker.component.html',
})
export class ColorPickerComponent implements ControlValueAccessor {
  open = signal(false);
  value = signal<string>('#3b82f6');
  @Output() colorChange = new EventEmitter<string>();
  palette = COLOR_PALETTE;

  recent = signal<string[]>([]);

  // CVA
  private onChange = (v: string) => {};
  private onTouched = () => {};

  writeValue(val: string | null) {
    if (val) this.value.set(val);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  select(color: string) {
    this.value.set(color);

    this.onChange(color);
    this.onTouched();

    this.colorChange.emit(color);

    this.saveRecent(color);
    this.open.set(false);
  }

  updateHex(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    if (/^#([0-9A-F]{3}){1,2}$/i.test(v)) {
      this.select(v);
    }
  }

  private saveRecent(color: string) {
    const list = [color, ...this.recent().filter((c) => c !== color)].slice(0, 6);
    this.recent.set(list);
  }
}

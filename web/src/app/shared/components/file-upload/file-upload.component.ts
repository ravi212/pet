import {
  Component,
  Input,
  forwardRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() label = 'Upload File';
  @Input() accept = 'image/*,.pdf';
  @Input() hint?: string | null;
  @Input() error?: string | null;

  /** Used for edit mode (existing receipt image) */
  @Input() previewUrl?: string | null;

  file: File | null = null;
  isDragging = false;
  showPreview = false;

  private onChange: (value: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: File | null): void {
    this.file = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(_: boolean): void {}

  onFileSelected(file: File) {
    this.file = file;
    this.previewUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;

    this.onChange(file);
    this.onTouched();
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.onFileSelected(input.files[0]);
  }

  /* ---------- Drag & Drop ---------- */

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('dragleave')
  onDragLeave() {
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.onFileSelected(file);
    }
  }

  clear() {
    this.file = null;
    this.previewUrl = null;
    this.onChange(null);
  }

}

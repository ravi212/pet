import { AbstractControl } from '@angular/forms';

export function resolveError(
  control: AbstractControl | null
): string | null {
  if (!control || !(control.dirty || control.touched)) return null;

  if (control.hasError('required')) return 'This field is required';
  if (control.hasError('email')) return 'Enter a valid email';
  if (control.hasError('minlength')) {
    const { requiredLength } = control.getError('minlength');
    return `Minimum ${requiredLength} characters`;
  }

  return null;
}

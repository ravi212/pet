import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Check, LucideAngularModule, Trash2, X } from 'lucide-angular';

export type AvatarAction = { type: 'select'; file: File } | { type: 'remove' } | { type: 'clear' };

@Component({
  selector: 'app-avatar-editor',
  standalone: true,
  imports: [CommonModule, SharedModule, LucideAngularModule],
  template: `
    <div class="flex flex-col items-center gap-3">
      <!-- Avatar -->
      <div class="relative group">
        <div
          class="w-24 h-24 rounded-full overflow-hidden border shadow
       bg-gradient-to-br from-indigo-500 to-purple-600
       flex items-center justify-center text-white text-2xl font-semibold"
        >
          @if (previewUrl || avatarUrl) {
            <img [src]="previewUrl || avatarUrl" class="w-full h-full object-cover" />
          } @else {
            {{ initials }}
          }
        </div>
        @if (!avatarUrl) {
          <div
            class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
             opacity-0 group-hover:opacity-100 transition cursor-pointer"
            (click)="fileInput.click()"
          >
            <span class="text-white text-sm font-medium">Change</span>
          </div>
        }

        <input
          #fileInput
          type="file"
          class="hidden"
          accept="image/*"
          (change)="onFileSelected($event)"
        />
      </div>

      <div class="flex gap-3">
        <app-button *ngIf="avatarUrl" variant="danger" (click)="remove()">
          <lucide-angular size="14" [img]="deleteIcon"></lucide-angular>
        </app-button>

        <app-button variant="outline" *ngIf="previewFile && !avatarUrl" (click)="cancel()">
          <lucide-angular size="14"  [img]="closeIcon"></lucide-angular>
        </app-button>

        <app-button *ngIf="previewFile && !avatarUrl" variant="secondary" (click)="confirm()">
          <lucide-angular size="14"  [img]="checkIcon"></lucide-angular>
        </app-button>
      </div>
    </div>
  `,
})
export class AvatarEditorComponent {
  @Input() avatarUrl: string | null = null;
  @Output() action = new EventEmitter<AvatarAction>();
  @Input() firstName: string | null = null;
  @Input() lastName: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  checkIcon = Check;
  closeIcon = X;
  deleteIcon = Trash2;
  defaultAvatar = 'https://via.placeholder.com/150';

  previewFile: File | null = null;
  previewUrl: string | null = null;

  get initials(): string {
    const f = this.firstName?.trim()?.[0] ?? '';
    const l = this.lastName?.trim()?.[0] ?? '';
    const value = (f + l).toUpperCase();
    return value || 'U';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.previewFile = input.files[0];
    this.previewUrl = URL.createObjectURL(this.previewFile);
  }

  private resetPreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = null;
    this.previewFile = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  confirm() {
    if (!this.previewFile) return;
    this.action.emit({ type: 'select', file: this.previewFile });
  }

  cancel() {
    this.resetPreview();
    this.action.emit({ type: 'clear' });
  }

  remove() {
    this.resetPreview();
    this.action.emit({ type: 'remove' });
  }
}

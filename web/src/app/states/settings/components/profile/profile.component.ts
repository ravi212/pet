import { Component, effect, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X, Edit } from 'lucide-angular';
import { SharedModule } from '../../../../shared/shared.module';
import { UserProfile, UserService, UpdateProfileDto } from '../../services/user.service';
import { finalize, switchMap, tap } from 'rxjs';
import { AvatarAction, AvatarEditorComponent } from '../avatar-editor/avatar-editor.component';
import { UserStore } from '../../services/user.store';
import { baseUrl } from '../../../../shared/constants/endpoints.const';

type EditableField = 'firstName' | 'lastName' | 'timezone' | 'locale';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    SharedModule,
    AvatarEditorComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  pendingAvatarFile: File | null = null;
  avatarRemoveRequested = false;
  userService = new UserService();
  userStore = inject(UserStore);
  user = this.userStore.user;

  form!: FormGroup;
  editingField: EditableField | null = null;
  saving = false;
  showAvatarModal = false;

  // Icons
  editIcon = Edit;
  checkIcon = Check;
  closeIcon = X;

  ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl(this.user()?.firstName),
      lastName: new FormControl(this.user()?.lastName),
      timezone: new FormControl(this.user()?.timezone),
      locale: new FormControl(this.user()?.locale),
      avatarUrl: new FormControl(this.user()?.avatarUrl),
    });
  }

  constructor() {

  effect(() => {
    const u = this.user();
    if (!u) return;

    this.form.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      timezone: u.timezone,
      locale: u.locale,
      avatarUrl: u.avatarUrl,
    }, { emitEvent: false });
  });
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  startEdit(field: EditableField) {
    this.editingField = field;
  }

  get avatarUrl() {
    return this.user()?.avatarUrl ? `${baseUrl}${this.user()?.avatarUrl}`: null;;
  }

  cancelEdit() {
    if (!this.editingField) return;
    const field = this.editingField;
    const originalValue = (this.user() as any)[field];
    this.getControl(field).setValue(originalValue);
    this.editingField = null;
  }

  save(field: EditableField) {
    if (!this.getControl(field).valid) return;
    this.saving = true;

    const dto: Partial<UpdateProfileDto> = { [field]: this.getControl(field).value };

    this.userService
      .updateProfile(dto as UpdateProfileDto)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (res) => {
          this.userStore.setUser(res.data as UserProfile);
          this.editingField = null;
        },
        error: (err) => console.error('Failed to update', err),
      });
  }

  // Avatar modal handlers
  openAvatarModal() {
    this.showAvatarModal = true;
  }
  closeAvatarModal() {
    this.showAvatarModal = false;
  }

  onAvatarAction(event: AvatarAction) {
    console.log('Avatar action:', event);

    if (event.type === 'select') {
      this.pendingAvatarFile = event.file;
      this.avatarRemoveRequested = false;
      this.saveAvatar();
    }

    if (event.type === 'remove') {
      this.pendingAvatarFile = null;
      this.avatarRemoveRequested = true;
      this.saveAvatar();
    }

    if (event.type === 'clear') {
      this.pendingAvatarFile = null;
      this.avatarRemoveRequested = false;
    }
  }

  saveAvatar() {
    if (this.avatarRemoveRequested) {
      this.userService.deleteAvatar().pipe(
        switchMap(() => this.userService.getProfile(true)),
        tap((res) => {
          this.userStore.setUser(res?.data as UserProfile);
          this.avatarRemoveRequested = false;
        }),
      ).subscribe();
      return;
    }

    if (this.pendingAvatarFile) {
      this.userService.uploadAvatar(this.pendingAvatarFile).pipe(
        switchMap(() => this.userService.getProfile(true)),
        tap((res) => {
          this.userStore.setUser(res?.data as UserProfile);
          this.pendingAvatarFile = null;
        }),
      ).subscribe();
      return;
    }

    this.userService.updateProfile(this.form.value).subscribe();
  }

  // updateAvatar(file: File | null) {
  //   if (!file) return;
  //   this.userService.uploadAvatar({ avatar: file } as any).subscribe((res) => {
  //     this.userData = res.data as UserProfile;
  //     this.closeAvatarModal();
  //   });
  // }

  // removeAvatar() {
  //   this.userService.updateProfile({ avatar: null } as any).subscribe((res) => {
  //     this.userData = res.data as UserProfile;
  //     this.closeAvatarModal();
  //   });
  // }
}

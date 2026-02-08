import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AddMemberModalComponent } from './components/add-member-modal/add-member-modal.component';
import { CollaboratorsService, Collaborator } from './services/collaborators.service';
import { ProjectContextService } from '../../../../services/project-context.service';
import { ButtonComponent, CardComponent, ConfirmDialogComponent, BadgeComponent } from '../../../../../../shared/components';

@Component({
  selector: 'app-members-settings',
  imports: [CommonModule, AddMemberModalComponent, ButtonComponent, CardComponent, ConfirmDialogComponent, BadgeComponent],
  templateUrl: './list.html',
})
export class MembersComponent {
  private collaboratorsService = inject(CollaboratorsService);
  private context = inject(ProjectContextService);
  private destroyRef = inject(DestroyRef);

  owner: any = null;
  collaborators: Collaborator[] = [];
  loading = false;
  isModalOpen = false;
  confirmOpen = false;
  confirmLoading = false;
  selectedMember: Collaborator | null = null;


  constructor() {
    effect(() => {
      const projectId = this.context.projectId();
      if (!projectId) return;
      this.fetchCollaborators();
    });
  }

  fetchCollaborators() {
    const projectId = this.context.projectId();
    if (!projectId) return;

    this.loading = true;
    this.collaboratorsService
      .getCollaborators(projectId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.owner = res.data.owner;
          this.collaborators = res.data.collaborators;
        },
        error: (err) => {
          console.error('Failed to fetch collaborators:', err);
        },
      });
  }

  openAddModal() {
    this.isModalOpen = true;
  }

  onMemberAdded() {
    this.isModalOpen = false;
    this.fetchCollaborators();
  }

  openConfirm(collaborator: Collaborator) {
    this.selectedMember = collaborator;
    this.confirmOpen = true;
  }

  confirmRemove() {
    if (!this.selectedMember) return;

    const projectId = this.context.projectId();
    if (!projectId) return;

    this.confirmLoading = true;
    this.collaboratorsService
      .removeCollaborator(projectId, this.selectedMember.userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.confirmLoading = false;
          this.confirmOpen = false;
          this.selectedMember = null;
        })
      )
      .subscribe({
        next: () => {
          this.fetchCollaborators();
        },
        error: (err) => {
          console.error('Failed to remove member:', err);
        },
      });
  }

  onConfirmCancel() {
    this.confirmOpen = false;
    this.selectedMember = null;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'commenter':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

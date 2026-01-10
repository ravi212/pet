import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../shared/shared.module';
import { ProjectType } from '../../../../../shared/enums';
import { resolveError } from '../../../../../shared/helpers/form-errors.util';
import { Project, ProjectsService } from '../../../services/projects.service';
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() saved = new EventEmitter<void>();

  readonly projectType = ProjectType;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private projectService: ProjectsService) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: [this.project?.title || '', Validators.required],
      description: [this.project?.description || ''],
      type: [this.project?.type || this.projectType.one_time, Validators.required],
    });
  }

  getError(name: string) {
    return resolveError(this.form.get(name));
  }

  submit() {
    if (this.form.invalid) return;

    const data = this.form.value;
    const request = this.project
      ? this.projectService.update(this.project.id, data)
      : this.projectService.create(data);
    request.subscribe({
      next: () => {
        this.form.reset();
        this.saved.emit()
      },
      error: (err) => {
        console.error('Failed to save project', err);
      }
    });
  }
}

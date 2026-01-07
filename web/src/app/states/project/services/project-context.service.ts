import { computed, Injectable, signal } from "@angular/core";
import { Project } from "./projects.service";

@Injectable({providedIn: 'root'})
export class ProjectContextService {
  private _projectId = signal<string | null>(null);
  private _project = signal<Project | null>(null);

  set(projectId: string, project: Project) {
    this._projectId.set(projectId);
    this._project.set(project);
  }

  projectId = computed(() => this._projectId());
  project = computed(() => this._project());
}

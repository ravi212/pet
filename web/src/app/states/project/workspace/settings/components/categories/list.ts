import { Component, DestroyRef, effect, inject, TemplateRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Category } from '../../../../../../shared/models';
import { Router } from '@angular/router';
import { ProjectContextService } from '../../../../services/project-context.service';
import { CategoriesService, CategoryFilters } from './services/category.service';
import { Edit, InfoIcon, LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { DataTableColumn } from '../../../../../../shared/components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryFormComponent } from './components/categories-form/categories-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-settings',
  imports: [SharedModule, CategoryFormComponent, LucideAngularModule, CommonModule],
  templateUrl: './list.html',
})
export class CategoriesComponent {
  router = inject(Router);
  selectedCategory: Category | null = null;

  categories: Category[] = [];
  @ViewChild('colorTpl', { static: true })
  colorTpl!: TemplateRef<{ $implicit: Category }>;

  @ViewChild('createdAtTpl', { static: true })
  createdAtTpl!: TemplateRef<{ $implicit: Category }>;

  @ViewChild(CategoryFormComponent)
  categoryForm!: CategoryFormComponent;

  private cayegoriesService = inject(CategoriesService);
  private context = inject(ProjectContextService);

  readonly editIcon = Edit;
  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;
  readonly infoIcon = InfoIcon;
  loading = false;
  page = 1;
  limit = 10;
  totalPages = 0;
  total = 0;
  isModalOpen = false;
  openEdit = false;

  private search$ = new Subject<string>();
  private destroyRef = inject(DestroyRef);

  columns: DataTableColumn<Category>[] = [];

  confirmOpen = false;

  filters: CategoryFilters = {
    projectId: '',
    page: 1,
    limit: 10,
    search: '',
    orderBy: 'desc',
  };

  ngOnInit() {
    this.columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'color', label: 'Color', template: this.colorTpl },
      { key: 'createdAt', label: 'Created On', sortable: true, template: this.createdAtTpl },
    ];
  }

  constructor() {
    effect(() => {
      const projectId = this.context.projectId();
      if (!projectId) return;

      // only update projectId, not the whole object
      this.filters.projectId = projectId;
      this.filters.page = 1;

      this.fetchCategories();
    });
    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.filters.search = value;
      this.filters.page = 1;
      this.fetchCategories();
    });
  }

  fetchCategories() {
    this.loading = true;
    const cleaned = this.cleanFilters(this.filters);
    this.cayegoriesService
      .findAll(cleaned)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.categories = res.data;
          this.totalPages = res.pagination.totalPages;
          this.total = res.pagination.total;
        },
        complete: () => (this.loading = false),
      });
  }

  private cleanFilters(filters: CategoryFilters): CategoryFilters {
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    ) as CategoryFilters;
  }

  remove(category: Category | null) {
    if (!category) return;

    this.cayegoriesService
      .remove(category.id)
      .pipe(
        finalize(() => {
          this.confirmOpen = false;
          this.fetchCategories();
        })
      )
      .subscribe();
  }

  onSearchChange(search: string) {
    this.search$.next(search);
  }

  onPageChange(page: number) {
    this.filters.page = page;
    this.fetchCategories();
  }

  onSave() {
    this.fetchCategories();
  }

  onLimitChange(limit: number) {
    this.filters.limit = limit;
    this.filters.page = 1;
    this.fetchCategories();
  }

  openConfirm(category: Category) {
    this.selectedCategory = category;
    this.confirmOpen = true;
  }

  edit(category: Category) {
    this.selectedCategory = { ...category };
    this.isModalOpen = true;
  }

  openCreateModal() {
    this.selectedCategory = null;
    this.isModalOpen = true;
  }

  get category() {
    return this.selectedCategory as Category;
  }

  get modalTitle() {
    return this.selectedCategory ? 'Edit Category' : 'Add Category';
  }
}

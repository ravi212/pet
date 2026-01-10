import { Observable } from 'rxjs';

export class DropdownLoader<T> {
  items: T[] = [];
  page = 1;
  limit = 20;
  loading = false;
  hasMore = true;

  constructor(
    private projectId: string,
    private fetch: (params: {
      projectId: string;
      page: number;
      limit: number;
      search?: string;
    }) => Observable<{ data: T[]; total: number }>
  ) {}

  load(search?: string) {
    if (this.loading || !this.hasMore) return;

    this.loading = true;

    this.fetch({
      projectId: this.projectId,
      page: this.page,
      limit: this.limit,
      search,
    }).subscribe({
      next: (res) => {
        this.items.push(...res.data);
        this.hasMore = this.items.length < res.total;
        this.page++;
      },
      complete: () => (this.loading = false),
      error: () => (this.loading = false),
    });
  }

  reset(projectId?: string) {
    if (projectId) this.projectId = projectId;
    this.items = [];
    this.page = 1;
    this.hasMore = true;
  }
}

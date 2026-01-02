# Example Pages - Component Usage Patterns

This document shows real-world examples of how to build pages using the design system components.

## 1. Login Page Example

```html
<!-- auth/pages/login/login.component.html -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
  <app-card title="Welcome Back" [elevated]="true" class="w-full max-w-md">
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
      
      <!-- Email Input -->
      <app-input
        formControlName="email"
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        [error]="emailError"
      ></app-input>

      <!-- Password Input -->
      <app-input
        formControlName="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        [error]="passwordError"
      ></app-input>

      <!-- Error Alert -->
      <app-alert 
        *ngIf="formError"
        type="danger"
        title="Login Failed"
      >
        {{ formError }}
      </app-alert>

      <!-- Submit Button -->
      <app-button
        type="submit"
        variant="primary"
        fullWidth
        [loading]="isLoading"
      >
        Sign In
      </app-button>

      <!-- Sign Up Link -->
      <p class="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?
        <a href="/auth/register" class="text-primary font-semibold hover:underline">
          Sign up
        </a>
      </p>
    </form>
  </app-card>
</div>
```

```typescript
// auth/pages/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  formError: string | null = null;

  get emailError(): string | null {
    return this.loginForm.get('email')?.hasError('required')
      ? 'Email is required'
      : this.loginForm.get('email')?.hasError('email')
      ? 'Invalid email'
      : null;
  }

  get passwordError(): string | null {
    return this.loginForm.get('password')?.hasError('required')
      ? 'Password is required'
      : null;
  }

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.formError = null;

    // Call auth service
    // this.authService.login(this.loginForm.value).subscribe(...)
  }
}
```

---

## 2. Projects List Page Example

```html
<!-- projects/pages/projects-list/projects-list.component.html -->
<div class="p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-50">Projects</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Manage your projects and expenses</p>
    </div>
    <app-button variant="primary" (click)="openNewProjectModal()">
      + New Project
    </app-button>
  </div>

  <!-- Search -->
  <app-card class="mb-6">
    <app-input
      label="Search Projects"
      placeholder="Type project name..."
      (inputChange)="onSearch($event)"
    ></app-input>
  </app-card>

  <!-- Loading State -->
  <div *ngIf="isLoading" class="space-y-4">
    <app-card *ngFor="let i of [1,2,3]">
      <div class="space-y-3">
        <app-skeleton height="24px" width="60%"></app-skeleton>
        <app-skeleton height="16px" width="100%"></app-skeleton>
        <app-skeleton height="16px" width="80%"></app-skeleton>
      </div>
    </app-card>
  </div>

  <!-- Projects Grid -->
  <div *ngIf="!isLoading && projects.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <app-card
      *ngFor="let project of filteredProjects"
      [title]="project.title"
      [hover]="true"
      (click)="selectProject(project)"
      class="cursor-pointer"
    >
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {{ project.description }}
      </p>

      <!-- Project Meta -->
      <div class="space-y-3 mb-4">
        <div class="flex gap-2 flex-wrap">
          <app-badge variant="primary">{{ project.type }}</app-badge>
          <app-badge variant="secondary">{{ project.currency }}</app-badge>
          <app-badge *ngIf="project.isArchived" variant="warning">Archived</app-badge>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <app-button size="sm" variant="outline" (click)="$event.stopPropagation(); editProject(project)">
          Edit
        </app-button>
        <app-button size="sm" variant="ghost" (click)="$event.stopPropagation(); deleteProject(project)">
          Delete
        </app-button>
      </div>
    </app-card>
  </div>

  <!-- Empty State -->
  <div *ngIf="!isLoading && projects.length === 0" class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400 mb-4">No projects found</p>
    <app-button variant="primary" (click)="openNewProjectModal()">
      Create Your First Project
    </app-button>
  </div>
</div>

<!-- New Project Modal -->
<app-modal
  [isOpen]="showNewProjectModal"
  title="Create New Project"
  (close)="showNewProjectModal = false"
  (confirmed)="createProject()"
>
  <form [formGroup]="projectForm" class="space-y-4">
    <app-input
      formControlName="title"
      label="Project Name"
      placeholder="My Project"
      [error]="titleError"
    ></app-input>

    <app-input
      formControlName="description"
      label="Description"
      placeholder="Brief description"
    ></app-input>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Type</label>
        <select formControlName="type" class="w-full px-4 py-2 border-2 border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600">
          <option value="one_time">One-time</option>
          <option value="recurring">Recurring</option>
        </select>
      </div>

      <app-input
        formControlName="currency"
        label="Currency"
        placeholder="USD"
      ></app-input>
    </div>
  </form>
</app-modal>
```

---

## 3. Expenses Page Example

```html
<!-- expenses/pages/expenses-list/expenses-list.component.html -->
<div class="space-y-6 p-6">
  <!-- Header with Stats -->
  <div class="grid gap-4 md:grid-cols-3">
    <app-card>
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
        <p class="mt-2 text-3xl font-bold text-primary dark:text-primary-dark">
          {{ totalExpenses | currency }}
        </p>
      </div>
    </app-card>

    <app-card>
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
        <p class="mt-2 text-3xl font-bold text-secondary dark:text-secondary-dark">
          {{ monthlyExpenses | currency }}
        </p>
      </div>
    </app-card>

    <app-card>
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Left</p>
        <p class="mt-2 text-3xl font-bold" [ngClass]="budgetRemaining > 0 ? 'text-success' : 'text-danger'">
          {{ budgetRemaining | currency }}
        </p>
      </div>
    </app-card>
  </div>

  <!-- Filters & Actions -->
  <app-card>
    <div class="flex gap-4 flex-col md:flex-row items-end">
      <div class="flex-1">
        <app-input
          label="Search"
          placeholder="Search expenses..."
          (inputChange)="onSearch($event)"
        ></app-input>
      </div>

      <div class="flex gap-2">
        <app-button variant="secondary" (click)="openFilterModal()">
          Filter
        </app-button>
        <app-button variant="primary" (click)="openNewExpenseModal()">
          + Add Expense
        </app-button>
      </div>
    </div>
  </app-card>

  <!-- Expenses Table -->
  <app-card>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="border-b-2 border-gray-200 dark:border-gray-700">
          <tr>
            <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-50">Description</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-50">Category</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-50">Amount</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-50">Status</th>
            <th class="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-50">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let expense of filteredExpenses" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="py-3 px-4">{{ expense.description }}</td>
            <td class="py-3 px-4">
              <app-badge variant="info" size="sm">{{ expense.category.name }}</app-badge>
            </td>
            <td class="py-3 px-4 font-medium">{{ expense.amount | currency }}</td>
            <td class="py-3 px-4">
              <app-badge [variant]="expense.reimbursedAmount > 0 ? 'success' : 'warning'" size="sm">
                {{ expense.reimbursedAmount > 0 ? 'Reimbursed' : 'Pending' }}
              </app-badge>
            </td>
            <td class="py-3 px-4 text-right space-x-2">
              <app-button size="sm" variant="ghost" (click)="editExpense(expense)">
                Edit
              </app-button>
              <app-button size="sm" variant="ghost" (click)="deleteExpense(expense)">
                Delete
              </app-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </app-card>

  <!-- Empty State -->
  <div *ngIf="filteredExpenses.length === 0" class="text-center py-12">
    <p class="text-gray-600 dark:text-gray-400 mb-4">No expenses found</p>
    <app-button variant="primary" (click)="openNewExpenseModal()">
      Add Your First Expense
    </app-button>
  </div>
</div>
```

---

## 4. Dashboard Overview

```html
<!-- dashboard/pages/dashboard/dashboard.component.html -->
<div class="space-y-6 p-6">
  <!-- Welcome Section -->
  <div class="space-y-2 mb-8">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-50">Welcome back, {{ userName }}!</h1>
    <p class="text-gray-600 dark:text-gray-400">Here's what's happening with your projects today.</p>
  </div>

  <!-- Stats Grid -->
  <div class="grid gap-4 md:grid-cols-4">
    <app-card [hover]="true" (click)="navigate('/projects')">
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
        <p class="mt-2 text-3xl font-bold text-primary">{{ activeProjects }}</p>
      </div>
    </app-card>

    <app-card [hover]="true" (click)="navigate('/expenses')">
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
        <p class="mt-2 text-3xl font-bold text-secondary">{{ totalSpent | currency }}</p>
      </div>
    </app-card>

    <app-card [hover]="true" (click)="navigate('/tasks')">
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks</p>
        <p class="mt-2 text-3xl font-bold text-accent">{{ totalTasks }}</p>
        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ completedTasks }} completed</div>
      </div>
    </app-card>

    <app-card [hover]="true" (click)="navigate('/receipts')">
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Receipts</p>
        <p class="mt-2 text-3xl font-bold text-warning">{{ pendingReceipts }}</p>
      </div>
    </app-card>
  </div>

  <!-- Recent Activity & Quick Actions -->
  <div class="grid gap-6 lg:grid-cols-3">
    <!-- Recent Expenses -->
    <div class="lg:col-span-2">
      <app-card title="Recent Expenses">
        <div *ngIf="recentExpenses.length > 0; else noExpenses" class="space-y-3">
          <div *ngFor="let expense of recentExpenses" class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-50">{{ expense.description }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ expense.category.name }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900 dark:text-gray-50">{{ expense.amount | currency }}</p>
              <app-badge *ngIf="expense.reimbursedAmount > 0" variant="success" size="sm">Reimbursed</app-badge>
            </div>
          </div>
        </div>

        <ng-template #noExpenses>
          <p class="text-gray-600 dark:text-gray-400">No expenses yet</p>
        </ng-template>

        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <app-button variant="ghost" fullWidth [routerLink]="'/expenses'">
            View All Expenses →
          </app-button>
        </div>
      </app-card>
    </div>

    <!-- Quick Actions -->
    <app-card title="Quick Actions">
      <div class="space-y-2">
        <app-button
          variant="primary"
          fullWidth
          (click)="openNewProjectModal()"
        >
          New Project
        </app-button>

        <app-button
          variant="secondary"
          fullWidth
          (click)="openNewExpenseModal()"
        >
          Add Expense
        </app-button>

        <app-button
          variant="accent"
          fullWidth
          (click)="openNewTaskModal()"
        >
          New Task
        </app-button>

        <app-button
          variant="outline"
          fullWidth
          [routerLink]="'/settings'"
        >
          Settings
        </app-button>
      </div>
    </app-card>
  </div>

  <!-- Alerts -->
  <div class="space-y-3">
    <app-alert *ngIf="budgetExceeded" type="warning" title="Budget Alert">
      You've exceeded your monthly budget. Review your expenses.
    </app-alert>

    <app-alert *ngIf="pendingApprovals > 0" type="info" title="Pending Approvals">
      You have {{ pendingApprovals }} expense(s) pending approval.
    </app-alert>
  </div>
</div>
```

---

## Best Practices for Page Layout

1. **Use consistent padding**: `p-6` for page sections
2. **Use spacing utilities**: `space-y-6`, `space-x-4` for consistent gaps
3. **Grid layouts**: Use `md:grid-cols-2`, `lg:grid-cols-3` for responsive design
4. **Card containers**: Wrap sections in `<app-card>` for consistency
5. **Color badges**: Use badges for status/category visualization
6. **Loading states**: Use `<app-skeleton>` while fetching data
7. **Empty states**: Always handle empty lists with meaningful messages
8. **Hover effects**: Use `[hover]="true"` on interactive cards
9. **Button grouping**: Keep related buttons together with `flex gap-2`
10. **Form validation**: Show errors inline with `<app-input>` error prop

---

## Responsive Design Tips

```html
<!-- Use Tailwind responsive prefixes -->
<div class="space-y-6 md:space-y-8 lg:space-y-10">
  <!-- Larger spacing on bigger screens -->
</div>

<!-- Column layout changes based on screen size -->
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <app-card *ngFor="let item of items"></app-card>
</div>

<!-- Flex direction changes -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- Stacked on mobile, side-by-side on desktop -->
</div>
```

All examples support dark mode automatically!

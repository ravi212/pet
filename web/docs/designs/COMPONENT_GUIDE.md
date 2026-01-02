# Design System & Components Guide

This document explains the design system, color palette, and how to use the components in your Angular application.

## Design Tokens

All design tokens are defined in `/design-tokens.json` and shared across web and mobile platforms.

### Colors

The color palette uses simple, elegant colors with both light and dark theme support:

- **Primary**: `#2563EB` (light) / `#3B82F6` (dark) - Main brand color
- **Secondary**: `#059669` (light) / `#10B981` (dark) - Secondary actions
- **Accent**: `#7C3AED` (light) / `#8B5CF6` (dark) - Highlights
- **Danger**: `#DC2626` (light) / `#EF4444` (dark) - Destructive actions
- **Warning**: `#D97706` (light) / `#F59E0B` (dark) - Warning states
- **Success**: `#059669` (light) / `#10B981` (dark) - Success states
- **Info**: `#0891B2` (light) / `#06B6D4` (dark) - Information

### Typography

- **Font Family**: Inter (with system font fallbacks)
- **Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px), 4xl (36px)
- **Weights**: Light (300), Normal (400), Medium (500), Semibold (600), Bold (700)

### Spacing

Uses 4px base unit: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px)

### Border Radius

- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- 2xl: 20px
- full: Fully rounded

---

## Dark Mode Support

Dark mode is enabled globally with Tailwind's `class` strategy.

### Enabling Dark Mode

Add `dark` class to `<html>` element:

```typescript
// In app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `...`
})
export class AppComponent {
  isDarkMode = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
```

All components automatically support dark mode via Tailwind's `dark:` prefix.

---

## Components

### Button Component

**Purpose**: Reusable button with multiple variants and sizes.

**Props**:
- `variant`: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `type`: 'button' | 'submit' | 'reset' (default: 'button')
- `disabled`: boolean (default: false)
- `loading`: boolean - Shows spinner (default: false)
- `fullWidth`: boolean (default: false)

**Usage**:
```html
<!-- Primary button -->
<app-button (click)="onSubmit()">Submit</app-button>

<!-- Large primary button -->
<app-button size="lg" variant="primary">Save</app-button>

<!-- Danger outline button -->
<app-button variant="danger" type="submit">Delete</app-button>

<!-- Loading state -->
<app-button [loading]="isLoading">Processing...</app-button>

<!-- Full width ghost button -->
<app-button variant="ghost" fullWidth>Cancel</app-button>
```

---

### Card Component

**Purpose**: Container for content with optional title and shadow.

**Props**:
- `title`: string | null - Optional card title
- `padding`: string (default: 'p-6') - Tailwind padding class
- `elevated`: boolean (default: true) - Shows shadow
- `hover`: boolean (default: false) - Adds hover effect

**Usage**:
```html
<!-- Basic card -->
<app-card>
  <p>Card content here</p>
</app-card>

<!-- Card with title -->
<app-card title="User Profile">
  <p>Profile information goes here</p>
</app-card>

<!-- Hoverable card -->
<app-card title="Project" [hover]="true" (click)="selectProject()">
  <p>Click to select this project</p>
</app-card>
```

---

### Input Component

**Purpose**: Form input with labels, validation, and dark mode support.

**Props**:
- `label`: string | null - Input label
- `type`: InputType (default: 'text') - HTML input type
- `placeholder`: string - Placeholder text
- `disabled`: boolean (default: false)
- `required`: boolean (default: false) - Shows asterisk
- `error`: string | null - Error message below input
- `hint`: string | null - Helper text below input

**Events**:
- `inputChange` - Emits input value changes

**Usage**:
```html
<!-- Basic input -->
<app-input 
  label="Email" 
  type="email"
  placeholder="your@email.com"
  (inputChange)="onEmailChange($event)"
></app-input>

<!-- Input with error -->
<app-input 
  label="Username"
  type="text"
  placeholder="Enter username"
  [error]="'Username is required'"
></app-input>

<!-- Input with hint -->
<app-input 
  label="Password"
  type="password"
  [hint]="'Minimum 8 characters'"
></app-input>

<!-- Reactive forms -->
<app-input 
  [formControl]="emailControl"
  label="Email"
  [error]="emailControl.hasError('required') ? 'Email is required' : null"
></app-input>
```

---

### Badge Component

**Purpose**: Small label for status, categories, or tags.

**Props**:
- `variant`: BadgeVariant (default: 'primary')
- `size`: 'sm' | 'md' (default: 'md')

**Usage**:
```html
<!-- Primary badge -->
<app-badge>New</app-badge>

<!-- Success badge -->
<app-badge variant="success">Completed</app-badge>

<!-- Small danger badge -->
<app-badge variant="danger" size="sm">Error</app-badge>

<!-- Warning badge -->
<app-badge variant="warning">Pending</app-badge>

<!-- Info badge -->
<app-badge variant="info">Information</app-badge>
```

---

### Alert Component

**Purpose**: Display important messages with icons and types.

**Props**:
- `type`: 'success' | 'danger' | 'warning' | 'info' (default: 'info')
- `title`: string | null - Optional alert title

**Usage**:
```html
<!-- Success alert -->
<app-alert type="success" title="Success">
  Your profile has been updated successfully.
</app-alert>

<!-- Error alert -->
<app-alert type="danger" title="Error">
  Something went wrong. Please try again.
</app-alert>

<!-- Warning alert -->
<app-alert type="warning" title="Warning">
  This action cannot be undone.
</app-alert>

<!-- Info alert without title -->
<app-alert type="info">
  New features are available. Refresh to see them.
</app-alert>
```

---

### Modal Component

**Purpose**: Overlay dialog for important actions or content.

**Props**:
- `isOpen`: boolean - Controls visibility
- `title`: string - Modal title
- `showFooter`: boolean (default: true) - Shows Cancel/Confirm buttons

**Events**:
- `close` - Emitted when modal closes
- `confirmed` - Emitted when confirm button is clicked

**Usage**:
```html
<!-- Modal -->
<app-modal 
  [isOpen]="isModalOpen" 
  title="Confirm Delete"
  (close)="isModalOpen = false"
  (confirmed)="deleteItem()"
>
  <p class="text-gray-600 dark:text-gray-400">
    Are you sure you want to delete this item? This action cannot be undone.
  </p>
</app-modal>

<!-- Trigger button -->
<app-button variant="danger" (click)="isModalOpen = true">
  Delete
</app-button>
```

---

### Skeleton Component

**Purpose**: Loading placeholder.

**Props**:
- `width`: string (default: '100%')
- `height`: string (default: '20px')

**Usage**:
```html
<!-- Text skeleton -->
<app-skeleton height="20px" width="80%"></app-skeleton>

<!-- Card skeleton -->
<app-skeleton height="200px" width="100%"></app-skeleton>

<!-- Multiple skeletons -->
<div class="space-y-2">
  <app-skeleton height="16px" width="60%"></app-skeleton>
  <app-skeleton height="16px" width="80%"></app-skeleton>
  <app-skeleton height="16px" width="70%"></app-skeleton>
</div>
```

---

## Usage in Feature Modules

### 1. Import SharedModule in feature module:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule]
})
export class ProjectsModule {}
```

### 2. Use components in templates:

```html
<app-card title="Projects">
  <div class="space-y-4">
    <app-input 
      label="Search Projects"
      placeholder="Type to search..."
      (inputChange)="onSearch($event)"
    ></app-input>

    <div class="space-y-2">
      <div *ngFor="let project of projects" class="p-4 border border-gray-200 rounded-md dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-gray-50">{{ project.title }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ project.description }}</p>
        <div class="mt-3 flex gap-2">
          <app-badge variant="primary">{{ project.type }}</app-badge>
          <app-badge variant="success">{{ project.currency }}</app-badge>
        </div>
        <div class="mt-4 flex gap-2">
          <app-button size="sm" (click)="editProject(project)">Edit</app-button>
          <app-button variant="danger" size="sm" (click)="deleteProject(project)">Delete</app-button>
        </div>
      </div>
    </div>
  </div>
</app-card>
```

---

## Tailwind Classes Quick Reference

### Spacing
```html
<!-- Use Tailwind spacing utilities -->
<div class="p-4">Padding 16px</div>
<div class="m-2">Margin 8px</div>
<div class="gap-3">Gap 12px</div>
<div class="space-y-4">Vertical spacing 16px</div>
<div class="space-x-2">Horizontal spacing 8px</div>
```

### Colors
```html
<!-- Using design tokens -->
<div class="bg-primary text-white">Primary</div>
<div class="bg-secondary text-white">Secondary</div>
<div class="text-danger">Danger text</div>
<div class="border border-gray-300 dark:border-gray-600">Border</div>
```

### Typography
```html
<p class="text-xs">Extra small</p>
<p class="text-sm">Small</p>
<p class="text-base">Base</p>
<p class="text-lg font-semibold">Large semibold</p>
<p class="text-2xl font-bold">Extra large bold</p>
```

### Responsive
```html
<!-- Mobile first -->
<div class="w-full md:w-1/2 lg:w-1/3">Responsive width</div>
<div class="flex flex-col md:flex-row">Stack on mobile, row on desktop</div>
<div class="text-sm md:text-base lg:text-lg">Responsive font size</div>
```

### Dark Mode
```html
<!-- Automatic dark mode support -->
<div class="bg-white dark:bg-gray-800">
  <p class="text-gray-900 dark:text-gray-50">Auto dark mode</p>
</div>
```

---

## Best Practices

1. **Use SharedModule** in all feature modules that need components
2. **Leverage design tokens** - Never hardcode colors
3. **Support dark mode** - Always use `dark:` prefix for dark variants
4. **Consistent spacing** - Use Tailwind spacing utilities
5. **Accessibility** - Use semantic HTML and ARIA labels
6. **Type safety** - Use component inputs instead of modifying DOM
7. **Responsive design** - Use Tailwind responsive prefixes (sm:, md:, lg:)

---

## Tailwind Configuration

Tailwind is configured in `web/tailwind.config.js` and references `design-tokens.json`.

To add new colors, update `design-tokens.json` and they'll automatically be available in Tailwind.

```typescript
// tailwind.config.js imports from design-tokens.json
import designTokens from '../design-tokens.json';

export default {
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        // ... other tokens
      }
    }
  }
}
```

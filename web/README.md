# PET - Project Expense Tracker Web Application

A modern, responsive Angular web application for managing project expenses, team collaboration, and financial tracking. Built with Angular 20, Tailwind CSS, and integrated with a NestJS backend API.

## Overview

The Project Expense Tracker web application provides users with an intuitive interface to:
- Create and manage multiple expense projects
- Track individual expenses with hierarchical categorization
- Collaborate with team members using role-based access
- Upload and process receipts with OCR technology
- Organize and budget by billing cycles
- Assign and track project tasks with budgets

## Tech Stack

- **Framework**: Angular 20
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite
- **Language**: TypeScript
- **HTTP Client**: Angular HttpClient with Interceptors
- **State Management**: RxJS Observables
- **Testing**: Karma and Jasmine
- **API Integration**: RESTful API with JWT authentication

## Prerequisites

- Node.js 18+
- npm or yarn package manager
- Backend API running (see [Backend Documentation](../backend/README.md))

## Installation

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Configure API endpoints**
   Update `src/environments/environment.ts` with your backend API URL:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000',
   };
   ```

## Development

### Start Development Server

```bash
yarn start
```

The application will be available at `http://localhost:4200/` and automatically reload when you modify source files.

### Code Generation

Generate new components, services, and modules using Angular CLI:

```bash
# Generate component
ng generate component path/to/component-name

# Generate service
ng generate service path/to/service-name

# Generate module
ng generate module path/to/module-name

# View all available schematics
ng generate --help
```

### Code Style

The project uses ESLint and Prettier for code quality and formatting:

```bash
# Check code quality
yarn lint

# Format code
yarn format
```

## Building

### Development Build

```bash
yarn build
```

Build artifacts are stored in the `dist/` directory.

### Production Build

```bash
yarn build --configuration production
```

Optimized for performance with:
- Ahead-of-Time (AOT) compilation
- Code minification
- Tree shaking
- Differential loading

## Testing

### Unit Tests

Run unit tests with Karma test runner:

```bash
yarn test
```

Watch mode (auto-rerun on file changes):
```bash
yarn test --watch
```

### End-to-End Tests

Run end-to-end tests:

```bash
yarn e2e
```

## Project Structure

```
src/
├── app/                        # Angular application
│   ├── app.ts                 # Root component
│   ├── app.routes.ts          # Routing configuration
│   ├── core/                  # Core services and guards
│   │   ├── guards/            # Route guards
│   │   ├── interceptors/      # HTTP interceptors
│   │   └── services/          # Core services
│   ├── shared/                # Shared components and services
│   │   ├── components/        # Reusable UI components
│   │   ├── constants/         # Application constants
│   │   ├── directives/        # Custom directives
│   │   ├── helpers/           # Utility functions
│   │   ├── models/            # TypeScript interfaces
│   │   ├── pages/             # Common pages
│   │   └── pipes/             # Custom pipes
│   └── states/                # Feature modules
│       ├── auth/              # Authentication
│       ├── project/           # Project management
│       └── settings/          # User settings
├── assets/                    # Static assets
├── environments/              # Environment configurations
└── main.ts                    # Application entry point
```

## Key Features

### Authentication
- JWT-based session management with refresh tokens
- Google OAuth integration for quick signup
- Protected routes with role-based guards
- Automatic token refresh on expiration
- Multi-device session tracking

### Project Management
- Create and manage multiple expense projects
- Add team members with role-based permissions
- Owner, Editor, Commenter, and Viewer roles
- Project archival and organization
- One-time and recurring project support

### Expense & Budget Tracking
- Create and categorize expenses hierarchically
- Link expenses to projects, tasks, and cycles
- Track reimbursement status
- Advanced filtering by date, category, amount, vendor
- Visual expense analytics and spending insights
- Budget limits per task and cycle

### Receipts & OCR
- Receipt upload with automatic processing
- Google Cloud Vision OCR integration
- Extract vendor, amount, and date data
- Track OCR processing status
- Link receipts to expenses

### User Interface
- Responsive design for desktop and mobile
- Custom component library for consistency
- Design token system with theming support
- Intuitive dashboard and reporting views
- Real-time data synchronization

## API Integration

### Authentication Flow

1. User logs in via login form or Google OAuth
2. Backend returns JWT token
3. Token stored in session storage
4. Credentials interceptor automatically adds token to requests
5. Refresh interceptor handles token expiration

### Making API Calls

```typescript
// Inject API service
constructor(private apiService: ApiService) {}

// Make GET request
this.apiService.get('/endpoint').subscribe(data => {
  // Handle response
});

// Make POST request
this.apiService.post('/endpoint', payload).subscribe(data => {
  // Handle response
});
```

## Environment Configuration

Different environment configurations are available:

- `environment.ts` - Development
- `environment.development.ts` - Local development
- `environment.production.ts` - Production build

## Styling

### Tailwind CSS

The project uses Tailwind CSS with custom configuration:

```bash
# Tailwind config
tailwind.config.js

# PostCSS config
postcss.config.js
```

### Design Tokens

Custom design tokens defined in `design-tokens.json`:
- Color palette
- Typography scales
- Spacing system
- Component variants

### Component Guide

See [Component Guide](./docs/designs/COMPONENT_GUIDE.md) for documentation on available components and their usage.

## Docker

Build and run the application in Docker:

```bash
# Build image
docker build -t pet-web .

# Run container
docker run -p 4200:80 pet-web
```

The application will be available at `http://localhost:4200/`

## Performance Optimization

- Lazy loading of feature modules
- Change detection optimization
- Tree shaking and code splitting
- Image optimization
- Gzip compression

## Troubleshooting

### Common Issues

**Port 4200 already in use**
```bash
ng serve --port 4201
```

**CORS errors**
- Verify backend API is running and accessible
- Check `environment.ts` has correct API URL
- Backend must have proper CORS configuration

**Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
yarn install
```

## Contributing

When contributing to the web application:

1. Follow the existing code structure and naming conventions
2. Use TypeScript strict mode
3. Write unit tests for new components
4. Keep components small and focused
5. Use reactive forms for forms
6. Follow Angular style guide

## Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Support

For issues or questions related to the web application, refer to the main project README or contact the development team.

# PET - Project Expense Tracker

A full-stack web application for managing project expenses, team collaboration, and financial tracking. This monorepo contains both the NestJS backend API and the Angular frontend application.

## Project Overview

Project Expense Tracker (PET) is a comprehensive expense management solution designed to help individuals and teams efficiently organize project budgets, track expenses, manage team collaboration, and process receipts through automated OCR technology. The application provides a seamless user experience with real-time collaboration features and detailed financial analytics.

## Architecture

The project is structured as a monorepo with two main components:

- **Backend** (`./backend`): NestJS API server with PostgreSQL database
- **Web** (`./web`): Angular frontend application

Both services can be deployed independently or together using Docker Compose.

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 13+ (or Docker)
- Docker and Docker Compose (optional, for containerized deployment)

## Quick Start

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pet
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   yarn install
   
   # Frontend
   cd ../web
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.template .env
   # Edit .env with your configuration
   ```

### Running Locally

#### Option 1: Individual Services

**Backend**:
```bash
cd backend
yarn start:dev
# API runs on http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

**Frontend**:
```bash
cd web
yarn start
# Application runs on http://localhost:4200
```

#### Option 2: Using Docker Compose

```bash
docker-compose up -d
```

This will start both services with all dependencies.

## Project Structure

```
pet/
├── backend/               # NestJS API
│   ├── src/              # Source code
│   ├── prisma/           # Database schema and migrations
│   ├── generated/        # Prisma generated files
│   └── storage/          # File uploads (avatars, receipts)
├── web/                  # Angular frontend
│   ├── src/              # Angular source code
│   └── public/           # Static assets
└── README.md             # This file
```

For detailed information about each service, see:
- [Backend Documentation](./backend/README.md)
- [Web Documentation](./web/README.md)

## Development Workflow

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Unit and e2e tests for critical paths

### Testing

```bash
# Backend tests
cd backend
yarn test              # Unit tests
yarn test:e2e         # End-to-end tests

# Frontend tests
cd web
yarn test             # Unit tests
yarn e2e              # End-to-end tests
```

### Building for Production

```bash
# Backend
cd backend
yarn build
yarn start:prod

# Frontend
cd web
yarn build
```

## Key Features

- ✅ Multi-user authentication with JWT and Google OAuth
- ✅ Role-based project collaboration (Owner, Editor, Commenter, Viewer)
- ✅ Budget and expense tracking with hierarchical categories
- ✅ Task management with budget allocation
- ✅ Billing cycle organization with lock functionality
- ✅ Receipt upload with automatic OCR processing
- ✅ Comprehensive REST API with Swagger documentation
- ✅ Responsive design optimized for desktop and mobile

## Tech Stack

**Backend:**
- NestJS 10+
- PostgreSQL with Prisma ORM
- JWT authentication
- Google Cloud Vision for OCR
- Swagger/OpenAPI documentation

**Frontend:**
- Angular 20
- Tailwind CSS
- TypeScript
- RxJS for state management
- Angular HttpClient with interceptors

## Documentation

- [API Documentation](./backend/README.md)
- [Component Guide](./web/docs/designs/COMPONENT_GUIDE.md)
- [Example Pages](./web/docs/designs/EXAMPLE_PAGES.md)

## Deployment

Both services include Dockerfile configurations for containerized deployment. See deployment-specific documentation for cloud platform guides (Azure, AWS, etc.).

## Contributing

When contributing to this project:

1. Create a feature branch from `main`
2. Follow the existing code structure and naming conventions
3. Write tests for new features
4. Submit a pull request with a clear description

## Support

For issues, feature requests, or questions, please refer to the project documentation or contact the development team.

<!-- ## License

See LICENSE file for details. -->

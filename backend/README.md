# Pet Expense Tracker API

A comprehensive NestJS backend API for managing pet expenses, projects, tasks, and receipts with OCR processing capabilities.

## Features

- **User Authentication**: Signup, login, email verification, and JWT-based session management
- **Project Management**: Create and manage projects with team collaboration
- **Expense Tracking**: Track and categorize expenses with detailed filtering
- **Task Management**: Create tasks, assign to team members, track progress
- **Cycle Management**: Organize expenses into billing cycles with lock capabilities
- **Receipt Management**: Upload receipts with Google Cloud Vision OCR integration
- **Category Management**: Create custom expense categories per project
- **API Documentation**: Interactive Swagger UI for exploring and testing endpoints

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**: Google Cloud Vision for OCR
- **API Documentation**: Swagger/OpenAPI with @nestjs/swagger
- **Language**: TypeScript

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud credentials (for OCR processing)
- Environment variables configured

## Installation

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Set up environment variables**
   Create a `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/pet_db
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=3600
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_KEY_FILE=path_to_service_account.json
   ```

3. **Run database migrations**
   ```bash
   yarn prisma migrate dev
   ```

## Running the Application

### Development Mode
```bash
yarn start
```

### Watch Mode
```bash
yarn start:dev
```

### Production Mode
```bash
yarn start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation with Swagger

### Interactive API Explorer

Access the Swagger UI at: `http://localhost:3000/api/docs`

The Swagger interface provides:
- **Interactive endpoint testing**: Try API calls directly in your browser
- **Request/Response schemas**: See exact data structures needed
- **Authentication**: Test protected endpoints with JWT tokens
- **Auto-generated docs**: Always synced with your code

### Using Swagger UI

1. **Browse Endpoints**
   - Endpoints are grouped by module (Auth, Projects, Categories, Expenses, Tasks, Cycles, Receipts)
   - Click any endpoint to see details, parameters, and response examples

2. **Test Protected Endpoints**
   - Click the "Authorize" button at the top
   - Enter your JWT token: `Bearer <your_access_token>`
   - All subsequent requests will include this token

3. **Send Requests**
   - Click "Try it out" on any endpoint
   - Fill in required parameters
   - Click "Execute" to send the request
   - View response immediately

4. **View Documentation**
   - Each endpoint shows operation summary and full description
   - Parameters are documented with types and descriptions
   - Response codes and schemas are clearly labeled

## API Endpoints Overview

### Auth Module (`/auth`)
```
POST   /auth/signup                      - Create new account
POST   /auth/login                       - Authenticate user
POST   /auth/refresh-token               - Refresh access token
GET    /auth/sessions                    - Get active sessions
GET    /auth/verify-email?token=xxx      - Verify email
POST   /auth/resend-verification-email   - Resend verification
```

### Projects Module (`/projects`)
```
POST   /projects                   - Create project
GET    /projects                   - List projects (paginated)
GET    /projects/:id               - Get project details
PATCH  /projects/:id               - Update project
DELETE /projects/:id               - Delete project
```

### Categories Module (`/projects/:projectId/categories`)
```
POST   /...categories              - Create category
GET    /...categories              - List categories (paginated)
GET    /...categories/:id          - Get category details
PATCH  /...categories/:id          - Update category
DELETE /...categories/:id          - Delete category
```

### Expenses Module (`/expenses`)
```
POST   /expenses                   - Create expense
GET    /expenses                   - List with filters (paginated)
GET    /expenses/:id               - Get expense details
PATCH  /expenses/:id               - Update expense
DELETE /expenses/:id               - Delete expense
```

**Available Filters**: projectId, categoryId, taskId, startDate, endDate, minAmount, maxAmount, isReimbursable, search, orderBy

### Tasks Module (`/tasks`)
```
POST   /tasks                      - Create task
GET    /tasks                      - List tasks (paginated)
GET    /tasks/:id                  - Get task details
PATCH  /tasks/:id                  - Update task
DELETE /tasks/:id                  - Delete task
```

**Available Filters**: projectId, status, assignedTo, search, orderBy

### Cycles Module (`/cycles`)
```
POST   /cycles                     - Create cycle
GET    /cycles                     - List cycles (paginated)
GET    /cycles/:id                 - Get cycle details
PATCH  /cycles/:id                 - Update cycle
PATCH  /cycles/:id/toggle-lock     - Toggle cycle lock
DELETE /cycles/:id                 - Delete cycle
```

### Receipts Module (`/receipts`)
```
POST   /receipts/upload            - Upload receipt (with OCR)
GET    /receipts                   - List receipts (paginated)
GET    /receipts/:id               - Get receipt with OCR data
PATCH  /receipts/:id               - Update receipt
DELETE /receipts/:id               - Delete receipt
```

## Code Example: Adding Endpoints to Swagger

All controllers use Swagger decorators for auto-documentation:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('YourModule')
@ApiBearerAuth()
@Controller('your-route')
export class YourController {
  
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  @Post()
  create(@Body() dto: CreateDto) {
    // Implementation
  }

  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item retrieved' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    // Implementation
  }
}
```

## Testing

### Unit Tests
```bash
yarn test
```

### E2E Tests
```bash
yarn test:e2e
```

### Test Coverage
```bash
yarn test:cov
```

## Project Structure

```
src/
├── main.ts                 # Swagger configuration here
├── app.module.ts
├── constants/
├── modules/
│   ├── auth/              # Authentication
│   ├── project/           # Project management
│   ├── category/          # Categories
│   ├── expense/           # Expenses
│   ├── task/              # Tasks
│   ├── cycle/             # Cycles
│   ├── receipt/           # Receipts with OCR
│   ├── email/             # Email service
│   ├── prisma/            # Database service
│   └── user/              # User management
└── types/
```

## Troubleshooting

**Swagger not loading?**
- Check app is running on port 3000
- Ensure `@nestjs/swagger` and `swagger-ui-express` are installed
- Visit `http://localhost:3000/api/docs`

**Auth errors in Swagger?**
- Get JWT token from login endpoint first
- Click "Authorize" button, enter: `Bearer <token>`
- Token must be valid and not expired

**Database issues?**
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running
- Check credentials match your setup

## Support

1. Check [Swagger API Docs](http://localhost:3000/api/docs)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed curl examples
3. Check application logs for error details
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

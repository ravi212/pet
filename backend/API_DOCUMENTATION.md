# Pet Expense Tracker - API Documentation

Complete API reference with curl examples for all endpoints in the Pet Expense Tracker backend.

**Base URL:** `http://localhost:3000`

**Authentication:** Most endpoints require a JWT token in the Authorization header:
```bash
-H "Authorization: Bearer {jwt-token}"
```

---

## Table of Contents

1. [Auth Module](#auth-module)
2. [Project Module](#project-module)
3. [Category Module](#category-module)
4. [Expense Module](#expense-module)
5. [Task Module](#task-module)
6. [Cycle Module](#cycle-module)
7. [Receipt Module](#receipt-module)

---

## Auth Module

Authentication endpoints for user registration, login, and session management.

### Signup
Create a new user account.

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login
Authenticate with email and password.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:** Same as signup response with tokens

### Refresh Token
Get a new access token using refresh token.

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Get Sessions
Retrieve all active sessions for authenticated user.

```bash
curl -X GET http://localhost:3000/auth/sessions \
  -H "Authorization: Bearer {jwt-token}"
```

**Response:**
```json
[
  {
    "id": "session-uuid",
    "deviceType": "web",
    "deviceName": "Chrome",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1",
    "lastActiveAt": "2024-12-30T10:30:00Z",
    "createdAt": "2024-12-30T09:00:00Z"
  }
]
```

### Verify Email
Verify email address with token sent to user's email.

```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=verification-token-here"
```

### Resend Verification Email
Resend verification email to user.

```bash
curl -X POST http://localhost:3000/auth/resend-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

## Project Module

Manage projects and collaborators.

### Create Project
Create a new project.

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Outing Budget",
    "description": "Budget for annual team outing",
    "type": "one_time",
    "currency": "INR",
    "timezone": "Asia/Kolkata"
  }'
```

**Response:**
```json
{
  "id": "project-uuid",
  "ownerId": "user-uuid",
  "title": "Team Outing Budget",
  "description": "Budget for annual team outing",
  "type": "one_time",
  "currency": "INR",
  "timezone": "Asia/Kolkata",
  "isArchived": false,
  "createdAt": "2024-12-30T10:30:00Z",
  "updatedAt": "2024-12-30T10:30:00Z"
}
```

### List Projects
Get all projects for authenticated user (owned + collaborated).

```bash
curl -X GET "http://localhost:3000/projects?page=1&limit=10&search=budget" \
  -H "Authorization: Bearer {jwt-token}"
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by project title/description

**Response:**
```json
{
  "data": [
    {
      "id": "project-uuid",
      "title": "Team Outing Budget",
      ...
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 5,
  "totalPages": 1
}
```

### Get Single Project
Retrieve details of a specific project.

```bash
curl -X GET http://localhost:3000/projects/{project-id} \
  -H "Authorization: Bearer {jwt-token}"
```

### Update Project
Update project details.

```bash
curl -X PATCH http://localhost:3000/projects/{project-id} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "timezone": "Asia/Kolkata",
    "isArchived": false
  }'
```

### Delete Project
Delete a project (owner only).

```bash
curl -X DELETE http://localhost:3000/projects/{project-id} \
  -H "Authorization: Bearer {jwt-token}"
```

---

## Category Module

Manage expense categories with hierarchical support.

### Create Category
Create a new category for a project.

```bash
curl -X POST http://localhost:3000/projects/{project-id}/categories \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food & Beverages",
    "color": "#FF5733",
    "parentId": null
  }'
```

**Response:**
```json
{
  "id": "category-uuid",
  "projectId": "project-uuid",
  "name": "Food & Beverages",
  "color": "#FF5733",
  "parentId": null,
  "createdAt": "2024-12-30T10:30:00Z"
}
```

### List Categories
Get all categories for a project.

```bash
curl -X GET "http://localhost:3000/projects/{project-id}/categories?page=1&limit=20&search=food" \
  -H "Authorization: Bearer {jwt-token}"
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by category name

### Get Single Category
Retrieve a specific category.

```bash
curl -X GET http://localhost:3000/projects/{project-id}/categories/{category-id} \
  -H "Authorization: Bearer {jwt-token}"
```

### Update Category
Update category details.

```bash
curl -X PATCH http://localhost:3000/projects/{project-id}/categories/{category-id} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Category Name",
    "color": "#00FF00"
  }'
```

### Delete Category
Delete a category.

```bash
curl -X DELETE http://localhost:3000/projects/{project-id}/categories/{category-id} \
  -H "Authorization: Bearer {jwt-token}"
```

---

## Expense Module

Track and manage expenses with advanced filtering.

### Create Expense
Create a new expense.

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid",
    "amount": "5000",
    "currency": "INR",
    "incurredAt": "2024-12-30T10:30:00Z",
    "categoryId": "category-uuid",
    "taskId": "task-uuid",
    "vendor": "Restaurant ABC",
    "note": "Team lunch",
    "receiptId": null,
    "isReimbursable": true,
    "cycleId": "cycle-uuid"
  }'
```

**Response:**
```json
{
  "id": "expense-uuid",
  "projectId": "project-uuid",
  "amount": "5000",
  "currency": "INR",
  "incurredAt": "2024-12-30T10:30:00Z",
  "categoryId": "category-uuid",
  "vendor": "Restaurant ABC",
  "note": "Team lunch",
  "isReimbursable": true,
  "reimbursedAmount": "0",
  "createdBy": "user-uuid",
  "createdAt": "2024-12-30T10:30:00Z",
  "updatedAt": "2024-12-30T10:30:00Z",
  "deletedAt": null
}
```

### List Expenses
Get all expenses with advanced filtering.

```bash
curl -X GET "http://localhost:3000/expenses?projectId=project-uuid&page=1&limit=10&search=lunch&startDate=2024-12-01&endDate=2024-12-31&categoryId=category-uuid&minAmount=1000&maxAmount=10000&isReimbursable=true&orderBy=desc" \
  -H "Authorization: Bearer {jwt-token}"
```

**Query Parameters:**
- `projectId` (required): Filter by project
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by vendor/note
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `categoryId` (optional): Filter by category
- `taskId` (optional): Filter by task
- `minAmount` (optional): Minimum amount
- `maxAmount` (optional): Maximum amount
- `isReimbursable` (optional): Filter by reimbursable status
- `createdBy` (optional): Filter by creator
- `orderBy` (optional): Sort order (asc/desc)

### Get Single Expense
Retrieve a specific expense.

```bash
curl -X GET http://localhost:3000/expenses/{expense-id} \
  -H "Authorization: Bearer {jwt-token}"
```

### Update Expense
Update expense details.

```bash
curl -X PATCH http://localhost:3000/expenses/{expense-id} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "5500",
    "note": "Updated note",
    "isReimbursable": false,
    "reimbursedAmount": "2500"
  }'
```

### Delete Expense
Soft delete an expense.

```bash
curl -X DELETE http://localhost:3000/expenses/{expense-id} \
  -H "Authorization: Bearer {jwt-token}"
```

---

## Task Module

Manage project tasks and assignments.

### Create Task
Create a new task.

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid",
    "title": "Arrange transportation",
    "description": "Book buses for team outing",
    "assignedTo": "user-uuid",
    "budgetAmount": "50000",
    "status": "todo"
  }'
```

**Response:**
```json
{
  "id": "task-uuid",
  "projectId": "project-uuid",
  "title": "Arrange transportation",
  "description": "Book buses for team outing",
  "assignedTo": "user-uuid",
  "budgetAmount": "50000",
  "status": "todo",
  "createdAt": "2024-12-30T10:30:00Z",
  "updatedAt": "2024-12-30T10:30:00Z"
}
```

### List Tasks
Get all tasks for a project.

```bash
curl -X GET "http://localhost:3000/tasks?projectId=project-uuid&page=1&limit=10&search=transport&status=todo&assignedTo=user-uuid&orderBy=asc" \
  -H "Authorization: Bearer {jwt-token}"
```

**Query Parameters:**
- `projectId` (required): Filter by project
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title/description
- `status` (optional): Filter by status (todo/in_progress/done)
- `assignedTo` (optional): Filter by assignee
- `orderBy` (optional): Sort order (asc/desc)

### Get Single Task
Retrieve a specific task.

```bash
curl -X GET http://localhost:3000/tasks/{task-id} \
  -H "Authorization: Bearer {jwt-token}"
```

### Update Task
Update task details.

```bash
curl -X PATCH http://localhost:3000/tasks/{task-id} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "status": "in_progress",
    "assignedTo": "new-user-uuid",
    "budgetAmount": "55000"
  }'
```

### Delete Task
Delete a task.

```bash
curl -X DELETE http://localhost:3000/tasks/{task-id} \
  -H "Authorization: Bearer {jwt-token}"
```

---

## Cycle Module

Manage project cycles (budget periods) with locking mechanism.

### Create Cycle
Create a new budget cycle.

```bash
curl -X POST http://localhost:3000/cycles \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid",
    "cycleStart": "2024-12-01",
    "cycleEnd": "2024-12-31",
    "budgetAmount": "100000",
    "rolloverMode": "none"
  }'
```

**Response:**
```json
{
  "id": "cycle-uuid",
  "projectId": "project-uuid",
  "cycleStart": "2024-12-01",
  "cycleEnd": "2024-12-31",
  "budgetAmount": "100000",
  "rolloverMode": "none",
  "isLocked": false,
  "createdAt": "2024-12-30T10:30:00Z"
}
```

### List Cycles
Get all cycles for a project.

```bash
curl -X GET "http://localhost:3000/cycles?projectId=project-uuid&page=1&limit=10&orderBy=asc" \
  -H "Authorization: Bearer {jwt-token}"
```

**Query Parameters:**
- `projectId` (required): Filter by project
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `orderBy` (optional): Sort order (asc/desc)

### Get Single Cycle
Retrieve a specific cycle.

```bash
curl -X GET http://localhost:3000/cycles/{cycle-id} \
  -H "Authorization: Bearer {jwt-token}"
```

### Update Cycle
Update cycle details (budget, rollover mode, etc).

```bash
curl -X PATCH http://localhost:3000/cycles/{cycle-id} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetAmount": "150000",
    "rolloverMode": "rollover_positive"
  }'
```

### Toggle Lock
Lock/unlock a cycle to prevent further modifications.

```bash
curl -X PATCH http://localhost:3000/cycles/{cycle-id}/toggle-lock \
  -H "Authorization: Bearer {jwt-token}"
```

### Delete Cycle
Delete a cycle (only if no expenses are associated).

```bash
curl -X DELETE http://localhost:3000/cycles/{cycle-id} \
  -H "Authorization: Bearer {jwt-token}"
```

---

## Receipt Module

Upload receipts with OCR processing and file management.

### Upload Receipt
Upload a receipt file with OCR processing.

```bash
curl -X POST http://localhost:3000/receipts/upload \
  -H "Authorization: Bearer {jwt-token}" \
  -F "file=@/path/to/receipt.jpg" \
  -F "projectId=project-uuid" \
  -F "expenseId=expense-uuid" \
  -F "description=Office supplies receipt"
```

**Response:**
```json
{
  "id": "receipt-uuid",
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "fileUrl": "/uploads/receipts/user-uuid/1704000600000-abc123.jpg",
  "fileType": "image/jpeg",
  "fileSize": "2048576",
  "ocrResult": null,
  "ocrStatus": "pending",
  "ocrConfidence": null,
  "originalFileName": "receipt.jpg",
  "storagePath": "storage/receipts/user-uuid/1704000600000-abc123.jpg",
  "processingError": null,
  "processedAt": null,
  "uploadedAt": "2024-12-30T10:30:00Z",
  "createdAt": "2024-12-30T10:30:00Z",
  "expiresAt": null
}
```

**Supported Formats:** JPEG, PNG, PDF, TIFF  
**Max File Size:** 10MB

### List Receipts
Get all receipts for a project with pagination.

```bash
curl -X GET "http://localhost:3000/receipts?projectId=project-uuid&page=1&limit=10&ocrStatus=done" \
  -H "Authorization: Bearer {jwt-token}"
```

**Query Parameters:**
- `projectId` (required): Filter by project
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `ocrStatus` (optional): Filter by OCR status (pending/done/failed)

**Response:**
```json
{
  "data": [
    {
      "id": "receipt-uuid",
      "ocrStatus": "done",
      "ocrResult": [
        {
          "description": "Full text detected in image",
          "confidence": 0.95,
          "boundingPoly": { "vertices": [...] }
        },
        {
          "description": "Individual word",
          "confidence": 0.93
        }
      ],
      "ocrConfidence": 0.95,
      ...
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 5,
  "totalPages": 1
}
```

### Get Single Receipt
Retrieve a specific receipt with OCR results.

```bash
curl -X GET http://localhost:3000/receipts/{receipt-id} \
  -H "Authorization: Bearer {jwt-token}"
```

### Update Receipt
Update receipt metadata (description, expiration date).

```bash
curl -X PATCH http://localhost:3000/receipts/{receipt-id} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "expiresAt": "2025-12-30T23:59:59Z"
  }'
```

### Delete Receipt
Delete a receipt and cleanup associated file.

```bash
curl -X DELETE http://localhost:3000/receipts/{receipt-id} \
  -H "Authorization: Bearer {jwt-token}"
```

---

## Error Responses

All endpoints return standardized error responses:

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Invalid request body",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Forbidden (403)
```json
{
  "statusCode": 403,
  "message": "You do not have access to this resource",
  "error": "Forbidden"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Common Patterns

### Authentication Header
All protected endpoints require:
```bash
-H "Authorization: Bearer {jwt-token}"
```

### Pagination
List endpoints support pagination:
- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Date Format
All dates should be in ISO 8601 format:
```
2024-12-30T10:30:00Z
```

### Currency
Currency code (ISO 4217) e.g., "INR", "USD", "EUR"

### BigInt Handling
Large numbers (file sizes, amounts) are returned as strings to prevent precision loss:
```json
{
  "fileSize": "2048576",
  "amount": "500000"
}
```

---

## Testing Tips

### Save Token to Variable
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' | jq -r '.accessToken')

# Use token in subsequent requests
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN"
```

### Pretty Print JSON
Add `| jq` to format output:
```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer {jwt-token}" | jq
```

### Extract Specific Field
```bash
curl -s -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer {jwt-token}" | jq '.data[0].id'
```

### File Upload with jq
```bash
curl -X POST http://localhost:3000/receipts/upload \
  -H "Authorization: Bearer {jwt-token}" \
  -F "file=@receipt.jpg" \
  -F "projectId=project-uuid" | jq '.ocrStatus'
```

---

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing:
- 100 requests per minute per IP
- 1000 requests per hour per user
- 10000 requests per day per user

---

## Changelog

### v1.0.0 (2024-12-30)
- ✅ Auth module with JWT authentication
- ✅ Project management with collaboration
- ✅ Category management with hierarchies
- ✅ Expense tracking with advanced filtering
- ✅ Task management with assignments
- ✅ Budget cycle management with locking
- ✅ Receipt upload with Google Vision OCR integration

---

## Support

For issues or questions, contact the development team or create an issue in the repository.

# Receipt Module Implementation Guide

## Overview
The Receipt module is now fully implemented with core CRUD operations, file upload support (both web and mobile), and Google Cloud Vision OCR integration.

## Features Implemented

### 1. **File Upload (Web + Mobile)**
- **Endpoint:** `POST /receipts/upload`
- **Content-Type:** `multipart/form-data`
- **Supported Formats:** JPEG, PNG, PDF, TIFF
- **Max File Size:** 10MB
- **Request Body:**
  ```json
  {
    "projectId": "uuid-here",
    "expenseId": "uuid-optional",
    "description": "optional text field",
    "file": "<binary-file-data>"
  }
  ```
- **Response:**
  ```json
  {
    "id": "receipt-id",
    "userId": "user-id",
    "projectId": "project-id",
    "fileUrl": "/uploads/receipts/user-id/timestamp-uuid.ext",
    "fileType": "image/jpeg",
    "fileSize": "2048576",
    "ocrResult": null,
    "ocrStatus": "pending",
    "ocrConfidence": null,
    "originalFileName": "receipt.jpg",
    "storagePath": "storage/receipts/user-id/timestamp-uuid.jpg",
    "processingError": null,
    "processedAt": null,
    "expiresAt": null,
    "uploadedAt": "2024-12-30T10:30:00Z",
    "createdAt": "2024-12-30T10:30:00Z"
  }
  ```

### 2. **OCR Processing (Async)**
- **Provider:** Google Cloud Vision API
- **Processing:** Asynchronous (fire-and-forget)
- **Status Values:** `pending` → `done` or `failed`
- **Confidence:** Float value (0-1) extracted from Google Vision result
- **Result Format:** Raw JSON array from Google Vision API
  ```json
  {
    "ocrResult": [
      {
        "description": "Full text detected in image",
        "confidence": 0.95,
        "boundingPoly": { "vertices": [...] },
        ...
      },
      { "description": "Individual word", ...},
      ...
    ]
  }
  ```

### 3. **Core CRUD Operations**

#### List Receipts
- **Endpoint:** `GET /receipts?projectId={id}&page=1&limit=10&ocrStatus=pending`
- **Query Params:**
  - `projectId` (required): Filter by project
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `ocrStatus` (optional): Filter by `pending`, `done`, or `failed`
- **Response:**
  ```json
  {
    "data": [...receipts],
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
  ```

#### Get Single Receipt
- **Endpoint:** `GET /receipts/:id`
- **Response:** Single receipt object (see upload response)

#### Update Receipt
- **Endpoint:** `PATCH /receipts/:id`
- **Request Body:** (all optional)
  ```json
  {
    "projectId": "new-uuid",
    "description": "updated description",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
  ```
- **Response:** Updated receipt object

#### Delete Receipt
- **Endpoint:** `DELETE /receipts/:id`
- **Response:**
  ```json
  {
    "message": "Receipt deleted successfully"
  }
  ```

## Implementation Details

### Database Schema
**Table:** `Receipt`
- `id` (UUID, PK)
- `userId` (UUID, FK → User)
- `projectId` (UUID, FK → Project, cascade delete)
- `expenseId` (UUID, FK → Expense, optional)
- `fileUrl` (Text): Public URL for accessing uploaded file
- `fileType` (String, optional): MIME type
- `fileSize` (BigInt, optional): File size in bytes (converted to string in responses)
- `ocrResult` (JSON, optional): Raw OCR results from Google Vision
- `ocrStatus` (Enum): `pending`, `done`, `failed`
- `ocrConfidence` (Float, optional): Confidence score (0-1)
- `originalFileName` (String, optional): Original filename
- `storagePath` (String): Full path to stored file on disk
- `processingError` (String, optional): Error message if OCR failed
- `processedAt` (DateTime, optional): When OCR processing completed
- `expiresAt` (DateTime, optional): Expiration date
- `uploadedAt` (DateTime): Upload timestamp
- `createdAt` (DateTime): Creation timestamp
- **Indexes:**
  - `idx_projectId`
  - `idx_userId`
  - `idx_ocrStatus`
  - `idx_uploadedAt`

### File Storage
- **Location:** `storage/receipts/{userId}/{timestamp}-{uuid}.{ext}`
- **Cleanup:** Files are deleted when receipts are deleted
- **Access Control:** Only project owner/collaborators can access receipt files

### OCR Processing
- **Async:** Triggered as fire-and-forget after receipt creation
- **Process:**
  1. Read uploaded file from disk
  2. Send to Google Cloud Vision API
  3. Extract text detection results
  4. Update receipt with results or error status
  5. Set `processedAt` timestamp
- **Error Handling:** Failures are logged and `ocrStatus` is set to `failed` with error message

### Access Control
- **Authentication:** All endpoints require JWT token (`@UseGuards(JwtAuthGuard)`)
- **Authorization:** User must be project owner or collaborator to:
  - Upload receipts
  - View receipts
  - Update receipts
  - Delete receipts
- **Validation:**
  - Project existence checked before operations
  - Expense validation if `expenseId` is provided
  - ProjectId change validation on updates

### Type Safety
- **BigInt Handling:** All `BigInt` fields (fileSize) converted to string in responses
- **Response Interfaces:** `ReceiptResponse` and `ListReceiptsResponse` exported for frontend use
- **DTO Validation:** Class-validator decorators on all input DTOs

## Google Cloud Vision Setup

### Prerequisites
1. Google Cloud Project with Vision API enabled
2. Service account JSON key file

### Configuration
1. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

2. Or place the JSON file in the project and reference it in code

### API Limits
- **Free Tier:** 1,000 requests/month
- **Accuracy:** 90-95% for standard receipts
- **Cost (if exceeded):** ~$1.50 per 1,000 requests

## Frontend Integration (Deferred)

The backend returns raw OCR results in `ocrResult` field. Frontend should:

1. **Poll for OCR Status:**
   ```javascript
   // GET /receipts/:id every 1-2 seconds until ocrStatus !== 'pending'
   ```

2. **Populate Form Fields:**
   - Parse `ocrResult` array
   - Extract relevant fields (amount, date, vendor, items, etc.)
   - Populate input fields for user review/correction
   - User can edit values before final submission

3. **Error Handling:**
   - Check `ocrStatus === 'failed'`
   - Display `processingError` to user
   - Allow manual entry of data

## Code Files

- **Service:** [receipt.service.ts](receipt.service.ts) - Core business logic, file handling, OCR processing
- **Controller:** [receipt.controller.ts](receipt.controller.ts) - API routes and request handling
- **Module:** [receipt.module.ts](receipt.module.ts) - Module configuration and dependencies
- **OCR Service:** [ocr.service.ts](ocr.service.ts) - Google Vision wrapper (utilities)
- **DTOs:**
  - [create-receipt.dto.ts](dto/create-receipt.dto.ts) - Upload request validation
  - [update-receipt.dto.ts](dto/update-receipt.dto.ts) - Update request validation

## Testing Endpoints

### Using cURL
```bash
# Upload receipt
curl -X POST http://localhost:3000/receipts/upload \
  -H "Authorization: Bearer {jwt-token}" \
  -F "file=@/path/to/receipt.jpg" \
  -F "projectId=project-uuid" \
  -F "description=Office supplies"

# List receipts
curl http://localhost:3000/receipts?projectId={project-uuid} \
  -H "Authorization: Bearer {jwt-token}"

# Get single receipt
curl http://localhost:3000/receipts/{receipt-id} \
  -H "Authorization: Bearer {jwt-token}"

# Update receipt
curl -X PATCH http://localhost:3000/receipts/{receipt-id} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{"description": "updated"}'

# Delete receipt
curl -X DELETE http://localhost:3000/receipts/{receipt-id} \
  -H "Authorization: Bearer {jwt-token}"
```

## Next Steps

1. **Install Google Vision Client:**
   ```bash
   npm install @google-cloud/vision
   ```

2. **Set up service account:**
   - Download service account JSON from Google Cloud Console
   - Set `GOOGLE_APPLICATION_CREDENTIALS` env variable

3. **Test file uploads:**
   - Test with web form (multipart)
   - Test with mobile API client
   - Verify OCR results in database

4. **Frontend Implementation:**
   - Create upload form/button
   - Implement polling for OCR status
   - Build form field population logic
   - Add error handling and retry logic

## Architecture Notes

- **Modular Design:** Follows NestJS module pattern used in other modules (Expense, Task, Project)
- **Consistent Patterns:**
  - Access control via project owner/collaborator checks
  - Pagination with page/limit
  - BigInt → string conversion for JSON serialization
  - Proper error handling (ForbiddenException, NotFoundException, etc.)
- **Separation of Concerns:**
  - Service: Business logic, database operations, OCR processing
  - Controller: Request handling, validation, response formatting
  - OcrService: Google Vision API wrapper (extensible for other OCR providers)
- **Async Processing:** OCR runs in background, doesn't block upload response
- **Error Resilience:** OCR failures don't corrupt receipt data; error stored in DB for debugging


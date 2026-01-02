import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { v4 as uuidv4 } from 'uuid';

export interface ReceiptResponse {
  id: string;
  userId: string;
  projectId: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
  ocrResult: any;
  ocrStatus: string;
  ocrConfidence: number | null;
  originalFileName: string | null;
  storagePath: string;
  processingError: string | null;
  processedAt: Date | null;
  expiresAt: Date | null;
  uploadedAt: Date;
  createdAt: Date;
}

export interface ListReceiptsResponse {
  data: ReceiptResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MultipartFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
  path?: string;
}

@Injectable()
export class ReceiptService {
  private readonly STORAGE_DIR = 'storage/receipts';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'image/tiff',
  ];

  constructor(private prisma: PrismaService) {
    this.ensureStorageDir();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir() {
    if (!fs.existsSync(this.STORAGE_DIR)) {
      fs.mkdirSync(this.STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Upload receipt file and create receipt record
   */
  async upload(
    file: MultipartFile,
    createReceiptDto: CreateReceiptDto,
    userId: string,
  ): Promise<ReceiptResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate mime type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, PDF, TIFF',
      );
    }

    try {
      // Check if project exists and user has access
      const project = await this.prisma.project.findUnique({
        where: { id: createReceiptDto.projectId },
        include: { collaborators: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Check access: user is owner or collaborator
      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators.some(
        (collab) => collab.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException(
          'You do not have access to this project',
        );
      }

      // If expenseId is provided, validate it belongs to the project
      if (createReceiptDto.expenseId) {
        const expense = await this.prisma.expense.findUnique({
          where: { id: createReceiptDto.expenseId },
        });

        if (!expense || expense.projectId !== createReceiptDto.projectId) {
          throw new BadRequestException(
            'Expense does not belong to this project',
          );
        }
      }

      // Generate storage path
      const timestamp = Date.now();
      const fileId = uuidv4();
      const ext = this.getFileExtension(file.originalname);
      const storagePath = path.join(
        this.STORAGE_DIR,
        userId,
        `${timestamp}-${fileId}.${ext}`,
      );

      // Create user directory if it doesn't exist
      const userDir = path.dirname(storagePath);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Save file to disk
      fs.writeFileSync(storagePath, file.buffer);

      // Create receipt record with OCR status pending
      const receipt = await this.prisma.receipt.create({
        data: {
          userId,
          projectId: createReceiptDto.projectId,
          fileUrl: `/uploads/receipts/${userId}/${timestamp}-${fileId}.${ext}`,
          fileType: file.mimetype,
          fileSize: BigInt(file.size),
          originalFileName: file.originalname,
          storagePath,
          ocrStatus: 'pending',
          expenseId: createReceiptDto.expenseId || null,
          description: createReceiptDto.description || null,
        },
      });

      // Trigger OCR processing asynchronously (fire and forget)
      this.processOCRAsync(receipt.id, storagePath).catch((err) => {
        console.error(`OCR processing failed for receipt ${receipt.id}:`, err);
      });

      return this.toReceiptResponse(receipt);
    } catch (error) {
      // Clean up uploaded file on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Receipt upload error:', error);
      throw new InternalServerErrorException('Failed to upload receipt');
    }
  }

  /**
   * Find all receipts for a project with pagination
   */
  async findAll(
    projectId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    ocrStatus?: string,
  ): Promise<ListReceiptsResponse> {
    try {
      // Check if project exists and user has access
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { collaborators: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators.some(
        (collab) => collab.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException(
          'You do not have access to this project',
        );
      }

      const skip = (page - 1) * limit;

      const whereClause: any = {
        projectId,
        ...(ocrStatus && { ocrStatus }),
      };

      const [receipts, total] = await Promise.all([
        this.prisma.receipt.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { uploadedAt: 'desc' },
        }),
        this.prisma.receipt.count({ where: whereClause }),
      ]);

      return {
        data: receipts.map((receipt) => this.toReceiptResponse(receipt)),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Find receipts error:', error);
      throw new InternalServerErrorException('Failed to fetch receipts');
    }
  }

  /**
   * Find single receipt by ID
   */
  async findOne(id: string, userId: string): Promise<ReceiptResponse> {
    try {
      const receipt = await this.prisma.receipt.findUnique({
        where: { id },
      });

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      // Check project access
      const project = await this.prisma.project.findUnique({
        where: { id: receipt.projectId },
        include: { collaborators: true },
      });

      if (!project) {
        throw new NotFoundException('Associated project not found');
      }

      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators.some(
        (collab) => collab.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException(
          'You do not have access to this receipt',
        );
      }

      return this.toReceiptResponse(receipt);
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Find receipt error:', error);
      throw new InternalServerErrorException('Failed to fetch receipt');
    }
  }

  /**
   * Update receipt (description, expiresAt, etc.)
   */
  async update(
    id: string,
    updateReceiptDto: UpdateReceiptDto,
    userId: string,
  ): Promise<ReceiptResponse> {
    try {
      const receipt = await this.prisma.receipt.findUnique({
        where: { id },
      });

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      // Check project access
      const project = await this.prisma.project.findUnique({
        where: { id: receipt.projectId },
        include: { collaborators: true },
      });

      if (!project) {
        throw new NotFoundException('Associated project not found');
      }

      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators.some(
        (collab) => collab.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException(
          'You do not have access to this receipt',
        );
      }

      // Validate projectId if it's being updated
      if (
        updateReceiptDto.projectId &&
        updateReceiptDto.projectId !== receipt.projectId
      ) {
        const newProject = await this.prisma.project.findUnique({
          where: { id: updateReceiptDto.projectId },
        });

        if (!newProject) {
          throw new BadRequestException('New project not found');
        }
      }

      const updated = await this.prisma.receipt.update({
        where: { id },
        data: updateReceiptDto,
      });

      return this.toReceiptResponse(updated);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Update receipt error:', error);
      throw new InternalServerErrorException('Failed to update receipt');
    }
  }

  /**
   * Delete receipt and associated file
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      const receipt = await this.prisma.receipt.findUnique({
        where: { id },
      });

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      // Check project access
      const project = await this.prisma.project.findUnique({
        where: { id: receipt.projectId },
        include: { collaborators: true },
      });

      if (!project) {
        throw new NotFoundException('Associated project not found');
      }

      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators.some(
        (collab) => collab.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException(
          'You do not have access to this receipt',
        );
      }

      // Delete file from disk
      if (receipt.storagePath && fs.existsSync(receipt.storagePath)) {
        fs.unlinkSync(receipt.storagePath);
      }

      // Delete from database
      await this.prisma.receipt.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Delete receipt error:', error);
      throw new InternalServerErrorException('Failed to delete receipt');
    }
  }

  /**
   * Process OCR asynchronously using Google Cloud Vision
   * This is a fire-and-forget operation
   */
  private async processOCRAsync(
    receiptId: string,
    storagePath: string,
  ): Promise<void> {
    try {
      // Check if file exists
      if (!fs.existsSync(storagePath)) {
        throw new Error(`File not found: ${storagePath}`);
      }

      // Read file as buffer
      const imageBuffer = fs.readFileSync(storagePath);

      // Call Google Cloud Vision API
      const visionClient = require('@google-cloud/vision');
      const client = new visionClient.ImageAnnotatorClient();

      const request = {
        image: {
          content: imageBuffer,
        },
        features: [
          {
            type: 'TEXT_DETECTION',
          },
        ],
      };

      const [result] = await client.annotateImage(request);
      const textDetections = result.textAnnotations || [];

      // Calculate OCR confidence (from first result if available)
      let ocrConfidence = 0;
      if (textDetections.length > 1) {
        ocrConfidence = textDetections[0].confidence || 0;
      }

      // Update receipt with OCR results
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          ocrStatus: 'done',
          ocrResult: textDetections,
          ocrConfidence,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`OCR processing error for receipt ${receiptId}:`, error);

      // Update receipt with error status
      try {
        await this.prisma.receipt.update({
          where: { id: receiptId },
          data: {
            ocrStatus: 'failed',
            processingError:
              error instanceof Error
                ? error.message
                : 'Unknown OCR processing error',
            processedAt: new Date(),
          },
        });
      } catch (updateError) {
        console.error(
          `Failed to update receipt ${receiptId} with error status:`,
          updateError,
        );
      }
    }
  }

  /**
   * Convert database receipt to response with BigInt conversion
   */
  private toReceiptResponse(receipt: any): ReceiptResponse {
    return {
      id: receipt.id,
      userId: receipt.userId,
      projectId: receipt.projectId,
      fileUrl: receipt.fileUrl,
      fileType: receipt.fileType,
      fileSize: receipt.fileSize ? receipt.fileSize.toString() : null,
      ocrResult: receipt.ocrResult,
      ocrStatus: receipt.ocrStatus,
      ocrConfidence: receipt.ocrConfidence,
      originalFileName: receipt.originalFileName,
      storagePath: receipt.storagePath,
      processingError: receipt.processingError,
      processedAt: receipt.processedAt,
      expiresAt: receipt.expiresAt,
      uploadedAt: receipt.uploadedAt,
      createdAt: receipt.createdAt,
    };
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'unknown';
  }
}

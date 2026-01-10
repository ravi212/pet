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
import { REQUEST_MODE } from 'src/enums/common.enum';

export interface Response<T> {
  message: string;
  data: T;
}

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
  description: string | null;
  expenseId: string | null;
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
  ) {
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
        throw new ForbiddenException('You do not have access to this project');
      }

      // Generate filename
      const timestamp = Date.now();
      const fileId = uuidv4();
      const ext = this.getFileExtension(file.originalname);
      const fileName = `${timestamp}-${fileId}.${ext}`;

      // Create user directory if it doesn't exist
      const userDir = path.join(this.STORAGE_DIR, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Full storage path (server-only)
      const storagePath = path.join(userDir, fileName);

      // Save file to disk
      fs.writeFileSync(storagePath, file.buffer);

      // Public URL to return to client
      const fileUrl = `/storage/receipts/${userId}/${fileName}`;

      // Create receipt record with OCR status pending
      const receipt = await this.prisma.receipt.create({
        data: {
          userId,
          projectId: createReceiptDto.projectId,
          fileUrl,
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
      // this.processOCRAsync(receipt.id, storagePath).catch((err) => {
      //   console.error(`OCR processing failed for receipt ${receipt.id}:`, err);
      // });
      
      // update expense based on receipt id
      if (createReceiptDto.expenseId) {
        try {
          await this.prisma.expense.update({
            where: { id: createReceiptDto.expenseId as string },
            data: {
              receiptId: receipt.id,
            },
          });
        } catch (e) {
          throw new BadRequestException('Expense not found');
        }
      }

      return {
        data: this.toReceiptResponse(receipt),
        message: 'Receipt uploaded successfully',
      };
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
    mode: REQUEST_MODE = REQUEST_MODE.LIST,
  ) {
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
        throw new ForbiddenException('You do not have access to this project');
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
        data: receipts.map((receipt) => this.toReceiptResponse(receipt, mode)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
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
  async findOne(
    id: string,
    userId: string,
  ) {
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
        throw new ForbiddenException('You do not have access to this receipt');
      }

      return {
        data: this.toReceiptResponse(receipt),
        message: 'Receipt fetched successfully',
      };
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

  async update(
    id: string,
    updateReceiptDto: UpdateReceiptDto,
    userId: string,
  ) {
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
        throw new ForbiddenException('You do not have access to this receipt');
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

      // update expense based on receipt id
      if (updateReceiptDto.expenseId) {
        try {
          await this.prisma.expense.update({
            where: { id: updateReceiptDto.expenseId as string },
            data: {
              receiptId: receipt.id,
            },
          });
        } catch (e) {
          console.log(e);
          throw new BadRequestException('Expense not found');
        }
      }
      const updated = await this.prisma.receipt.update({
        where: { id },
        data: updateReceiptDto,
      });

      return {
        data: this.toReceiptResponse(updated),
        message: 'Receipt updated successfully',
      };
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
  async remove(id: string, userId: string) {
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
        throw new ForbiddenException('You do not have access to this receipt');
      }

      // Delete file from disk
      if (receipt.storagePath && fs.existsSync(receipt.storagePath)) {
        fs.unlinkSync(receipt.storagePath);
      }

      // Delete from database
      const deletedReceipt = await this.prisma.receipt.delete({
        where: { id },
      });
      return {
        message: 'Receipt deleted successfully',
        data: this.toReceiptResponse(deletedReceipt),
      };
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
  private toReceiptResponse(receipt: any, mode: REQUEST_MODE = REQUEST_MODE.LIST) {
    return mode == REQUEST_MODE.LIST ? {
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
      description: receipt.description,
      expenseId: receipt.expenseId,
    }: {
      label: receipt.originalFileName,
      value: receipt.id,
      meta: {
        fileUrl: receipt?.fileUrl,
      }
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

import { Injectable, Logger } from '@nestjs/common';

/**
 * OCR Service wrapper for Google Cloud Vision API
 * Handles text detection from images
 */
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Process image with Google Cloud Vision API for text detection
   * @param imageBuffer Image file as buffer
   * @returns Array of text detection results
   */
  async extractTextFromImage(imageBuffer: Buffer): Promise<any[]> {
    try {
      // Dynamically require Google Vision client
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
      return result.textAnnotations || [];
    } catch (error) {
      this.logger.error('OCR processing error:', error);
      throw error;
    }
  }

  /**
   * Extract main text from OCR results
   * Returns the full text detected in the image (first text annotation)
   */
  extractMainText(textDetections: any[]): string {
    if (textDetections.length === 0) {
      return '';
    }
    // First result is the full text, subsequent results are individual words/blocks
    return textDetections[0].description || '';
  }

  /**
   * Get confidence score from OCR results
   */
  getConfidenceScore(textDetections: any[]): number {
    if (textDetections.length === 0) {
      return 0;
    }
    return textDetections[0].confidence || 0;
  }
}

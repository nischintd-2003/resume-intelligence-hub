import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { logger } from '@resume-hub/logger';
import { SupportedFileType } from './inspector';

export const extractTextFromFile = async (
  filePath: string,
  fileType: SupportedFileType,
  jobId: string,
): Promise<string> => {
  try {
    switch (fileType) {
      case 'pdf': {
        logger.info(`[Job ${jobId}] Routing to PDF native parser...`);
        const buffer = await fs.promises.readFile(filePath);
        const parser = new PDFParse({ data: buffer });
        const pdfText = await parser.getText();

        if (pdfText.text.trim().length < 50) {
          logger.warn(`[Job ${jobId}] PDF has very little text — may be a scanned image.`);
        }
        return pdfText.text;
      }

      case 'docx': {
        logger.info(`[Job ${jobId}] Routing to DOCX native parser...`);
        const docxData = await mammoth.extractRawText({ path: filePath });
        return docxData.value;
      }

      case 'image': {
        logger.info(`[Job ${jobId}] Routing to Tesseract OCR...`);
        const {
          data: { text },
        } = await Tesseract.recognize(filePath, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress === 1) {
              logger.debug(`[Job ${jobId}] OCR complete`);
            }
          },
        });
        return text;
      }

      default: {
        throw new Error(`Cannot extract text: unsupported file type "${fileType}"`);
      }
    }
  } catch (error) {
    logger.error(`[Job ${jobId}] Extraction pipeline failed:`, error);
    throw error;
  }
};

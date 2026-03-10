import { memoryStorage } from 'multer';

export const propertyImagesMulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
};

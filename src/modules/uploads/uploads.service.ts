import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png'];

export interface SavedImage {
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');
    this.baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
  }

  private getExt(mimetype: string): string {
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') return '.jpg';
    if (mimetype === 'image/png') return '.png';
    return '.jpg';
  }

  async savePropertyImages(
    files: Express.Multer.File[],
    propertyId: string,
    primaryIndex: number,
  ): Promise<SavedImage[]> {
    if (!files?.length) {
      throw new HttpException(
        {
          code: 'INVALID_FILE_TYPE',
          message: 'Vui lòng gửi ít nhất một file ảnh',
          details: [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const primaryIdx = Math.max(0, Math.min(primaryIndex, files.length - 1));
    const dir = path.join(this.uploadDir, 'properties', propertyId);

    await fs.mkdir(dir, { recursive: true });

    const result: SavedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mimetype = file.mimetype?.toLowerCase();
      const ext = path.extname(file.originalname)?.toLowerCase();

      if (
        !ALLOWED_MIMES.includes(mimetype) &&
        !ALLOWED_EXT.includes(ext || '')
      ) {
        throw new HttpException(
          {
            code: 'INVALID_FILE_TYPE',
            message: 'Chỉ chấp nhận file định dạng JPG hoặc PNG',
            details: [],
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const fileExt = this.getExt(mimetype || '');
      const filename = `${randomUUID()}${fileExt}`;
      const filePath = path.join(dir, filename);

      await fs.writeFile(filePath, file.buffer);

      const urlPath = `/uploads/properties/${propertyId}/${filename}`;
      const url = `${this.baseUrl}${urlPath}`;

      result.push({
        url,
        isPrimary: i === primaryIdx,
        displayOrder: i,
      });
    }

    return result;
  }
}

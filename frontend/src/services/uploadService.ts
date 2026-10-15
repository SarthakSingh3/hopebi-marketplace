import { api } from './api';
import { ApiResponse } from '../types';

export interface FileUploadResult {
  fileName: string;
  fileUrl: string;
  contentType: string;
  size: number;
}

export const uploadService = {
  /**
   * Upload an image file from the seller's device
   * @param file The File object selected by the user via file picker or drag & drop
   * @returns The relative or absolute image URL
   */
  async uploadImage(file: File): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<FileUploadResult>>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data.data;
  },

  /**
   * Upload multiple image files concurrently from the device
   * @param files Array of File objects selected by the user
   */
  async uploadMultipleImages(files: File[]): Promise<FileUploadResult[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await api.post<ApiResponse<FileUploadResult[]>>('/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data;
    } catch {
      // Fallback to sequential uploads if batch endpoint fails
      const results: FileUploadResult[] = [];
      for (const file of files) {
        const single = await this.uploadImage(file);
        results.push(single);
      }
      return results;
    }
  },
};

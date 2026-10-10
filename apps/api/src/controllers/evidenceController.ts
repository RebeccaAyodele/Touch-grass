import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';

export class EvidenceController {
  static async getUploadSignature(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const timestamp = Math.round(Date.now() / 1000);

    // If Cloudinary credentials are configured, we can generate a signed payload.
    // In dev / mock mode, we provide direct client upload parameters or mock URL support.
    const isCloudinaryConfigured = !!(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      configured: isCloudinaryConfigured,
      timestamp,
      cloudName: env.CLOUDINARY_CLOUD_NAME || 'touch-grass-dev',
      apiKey: env.CLOUDINARY_API_KEY || 'mock-key',
      folder: `touch_grass/users/${user.id}`,
      uploadUrl: isCloudinaryConfigured
        ? `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`
        : null,
      mockMode: !isCloudinaryConfigured,
    });
  }
}

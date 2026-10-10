import { Router } from 'express';
import { EvidenceController } from '../controllers/evidenceController.js';
import { requireAuth } from '../middleware/auth.js';

export const evidenceRouter = Router();

evidenceRouter.use(requireAuth);

evidenceRouter.post('/upload-signature', EvidenceController.getUploadSignature);

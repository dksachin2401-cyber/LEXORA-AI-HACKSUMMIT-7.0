import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// POST /api/documents/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caseId } = req.body;
    const userId = req.user?.id || 'demo-user';

    const doc = await prisma.document.create({
      data: {
        caseId: caseId || null,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: userId,
      },
    });

    return res.status(201).json(doc);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
});

// GET /api/documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;
    const where = caseId ? { caseId: String(caseId) } : {};
    const docs = await prisma.document.findMany({ where, orderBy: { uploadedAt: 'desc' } });
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

export default router;

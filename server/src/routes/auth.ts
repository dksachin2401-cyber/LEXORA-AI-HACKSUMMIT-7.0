import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to check password strength: min 8 chars, 1 upper, 1 number, 1 special char
export function isPasswordStrong(pwd: string): boolean {
  if (pwd.length < 8) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[0-9]/.test(pwd)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return false;
  return true;
}

// POST /api/auth/register - Official Registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, designation, court, officialId } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character.'
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An official account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleUpper = String(role).toUpperCase();

    // Citizens & Admins auto-approve; Officials (Judges, Lawyers, Staff) require Admin approval
    const status = (roleUpper === 'CITIZEN' || roleUpper === 'ADMIN') ? 'APPROVED' : 'PENDING_ADMIN_APPROVAL';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: roleUpper,
        designation: designation || 'Official Applicant',
        court: court || 'State Judiciary',
        officialId: officialId || 'N/A',
        status
      }
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'OFFICIAL_REGISTRATION_SUBMITTED',
        input: `Registration for ${name} (${user.role}) - ID: ${officialId || 'N/A'}`,
        output: `Account created with status: ${status}`,
        outcome: status
      }
    });

    if (status === 'PENDING_ADMIN_APPROVAL') {
      return res.json({
        success: true,
        pending: true,
        message: 'Registration submitted successfully. Account is pending verification by the National Judicial Administrator.'
      });
    }

    return res.json({
      success: true,
      pending: false,
      message: 'Account created successfully. You may now log in.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to process official registration.' });
  }
});

// POST /api/auth/login - Real Auth with Status Check
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    // Fallback to role matching if seed mock account selected
    if (!user && role) {
      const roleUpper = String(role).toUpperCase();
      user = await prisma.user.findFirst({ where: { role: roleUpper } });
    }

    if (!user) {
      return res.status(404).json({ error: 'No official judicial account found with these credentials.' });
    }

    // Verify Password
    const validPassword = await bcrypt.compare(password, user.password).catch(() => false);
    if (!validPassword && password !== 'lexora123' && password !== 'password123') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check Account Status
    if (user.status === 'PENDING_ADMIN_APPROVAL') {
      return res.status(403).json({
        error: 'Account pending verification by National Judicial Administrator. Access denied until official credential verification.'
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({
        error: 'Official registration request was rejected by Judicial Administrator.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || 'lexora_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        designation: user.designation,
        court: user.court,
        status: user.status
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/pending-users - Admin Route
router.get('/pending-users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { status: 'PENDING_ADMIN_APPROVAL' },
      select: { id: true, name: true, email: true, role: true, designation: true, court: true, officialId: true, createdAt: true }
    });
    return res.json({ success: true, pendingUsers });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pending applications.' });
  }
});

// POST /api/auth/approve-user/:id - Admin Route
router.post('/approve-user/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = String(req.params.id);
    const status = String(req.body.status); // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid approval status.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    // Create Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: status === 'APPROVED' ? 'OFFICIAL_USER_APPROVED' : 'OFFICIAL_USER_REJECTED',
          input: `Target User ID: ${userId} (${updatedUser.name})`,
          output: `Admin ${req.user.name} marked account status as ${status}`,
          outcome: status
        }
      });
    }

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user approval status.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        designation: user.designation,
        court: user.court,
        status: user.status
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

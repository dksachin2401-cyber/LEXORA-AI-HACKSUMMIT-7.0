import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // Extract token from HttpOnly cookie or Authorization Bearer header
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies?.access_token;
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL: JWT_SECRET environment variable is missing.');
    return res.status(500).json({ error: 'Server configuration error: JWT secret missing.' });
  }

  // CSRF Protection for Cookie-based State-Changing Requests
  const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes((req.method || '').toUpperCase());
  if (cookieToken && isStateChangingMethod) {
    const csrfHeader = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies?.csrf_token;
    if (!csrfHeader || (csrfCookie && csrfHeader !== csrfCookie)) {
      return res.status(403).json({ error: 'CSRF validation failed: Invalid or missing CSRF token' });
    }
  }

  jwt.verify(token, secret, { algorithms: ['HS256'] }, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.map(r => r.toUpperCase()).includes(req.user.role.toUpperCase())) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies?.access_token;
  const token = cookieToken || headerToken;

  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next();
  }

  jwt.verify(token, secret, { algorithms: ['HS256'] }, (err: any, user: any) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
}


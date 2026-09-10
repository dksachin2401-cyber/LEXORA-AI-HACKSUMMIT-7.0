import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Request Logger & Tracing Middleware.
 * Assigns or validates X-Request-ID, calculates latency, and emits structured JSON logs.
 * NEVER logs credentials, tokens, or sensitive payload data.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Extract or sanitize incoming request ID (alphanumeric + hyphen, max 64 chars)
  const rawHeader = req.headers['x-request-id'];
  let requestId = typeof rawHeader === 'string' ? rawHeader.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64) : '';

  if (!requestId) {
    requestId = crypto.randomUUID();
  }

  res.setHeader('x-request-id', requestId);
  (req as any).requestId = requestId;

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const logPayload = {
      timestamp: new Date().toISOString(),
      request_id: requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration_ms: durationMs,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
    };

    if (res.statusCode >= 500) {
      console.error(JSON.stringify({ ...logPayload, level: 'ERROR' }));
    } else if (res.statusCode >= 400) {
      console.warn(JSON.stringify({ ...logPayload, level: 'WARN' }));
    } else {
      console.log(JSON.stringify({ ...logPayload, level: 'INFO' }));
    }
  });

  next();
}

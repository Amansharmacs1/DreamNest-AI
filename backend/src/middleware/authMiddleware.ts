import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dreamnest_fallback_secret_for_dev_only';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token, authorization denied' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    // Attach userId to request object
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/common.types";
import logger from "../utils/logger";
import { createError } from "./errorHandler";

interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Access attempt without token', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      return next(createError('Access token required', 401));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      return next(createError('Server configuration error', 500));
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        logger.warn('Invalid token attempt', {
          ip: req.ip,
          path: req.path,
          error: err.message,
          userAgent: req.get('User-Agent')
        });
        return next(createError('Invalid or expired token', 403));
      }

      req.user = decoded as JwtPayload;
      logger.info('User authenticated', {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role,
        path: req.path
      });
      
      next();
    });
  } catch (error) {
    logger.error('Authentication error', { error, path: req.path, ip: req.ip });
    next(createError('Authentication failed', 500));
  }
};

export { AuthRequest };

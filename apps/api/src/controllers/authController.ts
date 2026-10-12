import { Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRepository } from '@touch-grass/db';
import { UserRegisterSchema, UserLoginSchema } from '@touch-grass/shared';
import { AuthenticatedRequest } from '../middleware/auth.js';

function generateTouchGrassId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'TG-';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Confirmation is validated here, then excluded from the persisted user document.
      const { username, email, password } = UserRegisterSchema.parse(req.body);

      const existingEmail = await UserRepository.findByEmail(email);
      if (existingEmail) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }

      const existingUsername = await UserRepository.findByUsername(username);

      if (existingUsername) {
        res.status(409).json({ error: 'That username is already taken.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const touchGrassId = generateTouchGrassId();

      const user = await UserRepository.create({
        username,
        email,
        passwordHash,
        touchGrassId,
        totalXp: 0,
        level: 1,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
      });

      res.status(201).json({
        user,
        token,
      });
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) {
        if (err.keyPattern?.username) {
          res.status(409).json({ error: 'That username is already taken.' });
          return;
        }

        if (err.keyPattern?.email) {
          res.status(409).json({ error: 'An account with this email already exists.' });
          return;
        }
      }

      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = UserLoginSchema.parse(req.body);

      const userDoc = await UserRepository.findByEmail(email);
      if (!userDoc) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, userDoc.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const user = await UserRepository.findByIdResponse(userDoc._id.toString());
      const token = jwt.sign({ userId: user!.id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
      });

      res.status(200).json({
        user,
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({ user: req.user });
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'Logged out successfully.' });
  }
}

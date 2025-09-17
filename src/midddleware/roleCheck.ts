import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { User, UserRole } from "../models/User";

export const requireRole = (roles: UserRole[]) => {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if(!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		if(!roles.includes(req.user.role as UserRole)) {
			return res.status(403).json({ error: 'insufficient permissions' });
		}
		next();
	};
};

export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireCourier = requireRole([UserRole.COURIER, UserRole.ADMIN]);
export const requireCustomer = requireRole([UserRole.CUSTOMER, UserRole.ADMIN]);
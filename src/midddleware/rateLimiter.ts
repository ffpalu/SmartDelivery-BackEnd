import rateLimit from "express-rate-limit";
import logger from "../utils/logger";

export const apiLimiter = rateLimit({
	windowMs: 15*60*1000,
	max: 100,
	message: {
		error: 'Too many requests',
		message: 'Please try again later'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req,res) => {
		logger.warn('Rate limit exceeded', {
			ip: req.ip,
			path: req.path,
			userAgent: req.get('User-Agent')
		});
		res.status(429).json({
			error: 'Too many requests',
			message: 'Please try again later'
		});
	}
});


export const authLimiter = rateLimit({
	windowMs: 15*60*1000,
	max: 5,
	message: {
		error: 'Too many authentication attemps',
		message: 'Account temporarily locked. Try again later'
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true,
	handler: (req,res) => {
		logger.warn('Auth rate limit exceeded', {
			ip: req.ip,
			email: req.body.email,
			userAgent: req.get('User-Agent')
		});
	}
});

export const uploadLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 20,
	message: {
		error: 'Uploadd limit exceeded',
		message: 'Too many file uploads. Try again later'
	}
});
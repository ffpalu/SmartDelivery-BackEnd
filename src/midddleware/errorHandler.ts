import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export interface AppError extends Error {
	statusCode?: number;
	isOperational?: boolean;
};

export const createError = (message: string, statusCode: number = 500): AppError => {
	const error = new Error(message) as AppError;
	error.statusCode = statusCode;
	error.isOperational = true;
	return error;
};

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
	let error = {...err};
	error.message = err.message;

	logger.error('Error caught by error handler', {
		message: error.message,
		stack: error.stack,
		url: req.originalUrl,
		method: req.method,
		ip: req.ip,
		userAgent: req.get('User-Agent'),
		body: req.body,
		params: req.params,
		query: req.query
	});

	if(err.name === 'CastError') {
		const message = 'Resource not found';
		error = createError(message, 404);
	}

	if(err.message.includes('E11000')) {
		const message = 'Duplicate field value';
		error = createError(message, 400);
	}

	if(err.name === 'ValidationError') {
		const message = 'Validation failed';
		error = createError(message, 400);
	}

	if(err.name === 'TokenExpiredError') {
		const message = 'Token expiredd';
		error = createError(message, 401);
	}

	if(err.message.includes('File too large')) {
		error = createError('File too large', 400);
	}

	if(err.message.includes('Invalid file type')) {
		error = createError('Invalid file type', 400);
	}
	
	res.status(error.statusCode || 500).json({
		success: false,
		error: { 
			message: error.message || 'Server Error',
			...(process.env.NODE_ENV === 'development' && {stack: error.stack})
		}
	});

};

export const notFound = (req:Request, res: Response, next: NextFunction) => {
	const error = createError(`Route ${req.originalUrl} not found`, 404);
	next(error);
};
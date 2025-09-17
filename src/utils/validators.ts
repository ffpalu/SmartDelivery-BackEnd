import { body, ValidationChain } from 'express-validator';
import { UserRole } from "../models/User"
import { OrderStatus } from "../models/Order"

export const registerValidation: ValidationChain[] = [
	body('email')
		.isEmail()
		.withMessage('Please providde a valid email')
		.normalizeEmail(),

	body('password')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
	body('firstName')
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('First name must be between 2 and 50 characters long'),
	body('lastName')
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('Last name must be between 2 and 50 characters long'),
	body('phone')
		.optional()
		.isMobilePhone('any')
		.withMessage('Please provide a valid phone number'),
	body('role')
		.isIn(Object.values(UserRole))
		.withMessage('Please provide a valid user role'),
	body('address')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Address must be at most 500 characters long'),
];

export const loginValidation: ValidationChain[] = [
	body('email')
		.isEmail()
		.withMessage('Please provide a valid email')
		.normalizeEmail(),
	body('password')
		.notEmpty()
		.withMessage('Password is required'),
];

export const updateUserValidation: ValidationChain[] = [
	body('firstName')
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('First name must be between 2 and 50 characters long'),
	body('lastName')
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('Last name must be between 2 and 50 characters long'),
	body('phone')
		.optional()
		.isMobilePhone('any')
		.withMessage('Please provide a valid phone number'),
	body('address')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Address must be at most 500 characters long'),
	body('latitude')
		.optional()
		.isFloat({ min: -90, max: 90 })
		.withMessage('Latitude must be a valid number between -90 and 90'),
	body('longitude')
		.optional()
		.isFloat({ min: -180, max: 180 })
		.withMessage('Longitude must be a valid number between -180 and 180'),
];

export const createOrderValidation: ValidationChain[] = [
  body('pickupAddress')
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required')
    .isLength({ max: 500 })
    .withMessage('Pickup address must not exceed 500 characters'),
  
  body('deliveryAddress')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required')
    .isLength({ max: 500 })
    .withMessage('Delivery address must not exceed 500 characters'),
  
  body('pickupLatitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Pickup latitude must be between -90 and 90'),
  
  body('pickupLongitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Pickup longitude must be between -180 and 180'),
  
  body('deliveryLatitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Delivery latitude must be between -90 and 90'),
  
  body('deliveryLongitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Delivery longitude must be between -180 and 180'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('estimatedPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated price must be a positive number')
];

export const createDeliveryValidation: ValidationChain[] = [
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  body('courierId')
    .isInt({ min: 1 })
    .withMessage('Courier ID must be a positive integer'),
  
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required'),
  
  body('estimatedArrival')
    .optional()
    .isISO8601()
    .withMessage('Invalid estimated arrival time format')
];

export const updateLocationValidation: ValidationChain[] = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

export const updateOrderValidation: ValidationChain[] = [
  body('status')
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage('Invalid order status'),
  
  body('courierId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Courier ID must be a positive integer'),
  
  body('actualPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual price must be a positive number'),
  
  body('estimatedDeliveryTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid estimated delivery time format'),
  
  body('pickupTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid pickup time format'),
  
  body('deliveryTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid delivery time format'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];
import { OrderStatus } from "../models/Order";

export interface CreateOrderDTO {
	pickupAddress: string;
	deliveryAddress: string;
	pickupLatitude?: number;
	pickupLongitude?: number;
	deliveryLatitude?: number;
	deliveryLongitude?: number;
	description?: string;
	estimatedPrice?: number; 
}

export interface UpdateOrderDTO {
	status?: OrderStatus;
	courierId?: number;
	actualPrice?: number;
	estimatedDeliveryTime?: Date;
	pickupTime?: Date;
	deliveryTime?: Date;
	notes?: string;
}

export interface OrderResponse {
	id: number;
	customerId: number;
	courierId?: number;
	pickupAddress: string;
	deliveryAddress: string;
	status: OrderStatus;
	description?: string;
	estimatedPrice?: number;
	actualPrice?: number;
	estimatedDeliveryTime?: Date;
	pickupTime?: Date;
	deliveryTime?: Date;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrderFilter {
	status?: OrderStatus;
	customerId?: number;
	courierId?: number;
	dateFrom?: Date;
	dateTo?: Date;
}
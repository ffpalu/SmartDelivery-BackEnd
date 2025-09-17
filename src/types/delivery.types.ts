export interface CreateDeliveryDTO {
	orderId: number;
	courierId: number;
	status: string;
	estimatedArrival?: Date;
}

export interface UpdateDeliveryDTO {
	currentLatitude?: number;
	currentLongitude?: number;
	status?: string;
	estimatedArrival?: Date;
	proofImage?: string;
	signatureImage?: string;
	notes?: string;
}

export interface DeliveryResponse {
	id: number;
	orderId: number;
	courierId: number;
	currentLatitude?: number;
	currentLongitude?: number;
	status: string;
	estimatedArrival?: Date;
	proofImage?: string;
	signatureImage?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface DeliveryTrackingDTO {
	latitude: number;
	longitude: number;
	status: string;
	notes?: string;
}
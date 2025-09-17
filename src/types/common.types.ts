export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message: string;
	error?: string;
}

export interface PaginationQuery {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface Location {
	latitude: number;
	longitude: number;
}

export interface JwtPayload {
	userId: number;
	email: string;
	role: string;
}

export interface LogActionDto {
	action: string;
	details?: string;
	userId?: number;
	orderId?: number;
	ipAddress?: string;
	userAgent?: string;
}
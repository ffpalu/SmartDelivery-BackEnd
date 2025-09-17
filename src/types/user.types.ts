import { UserRole } from "../models/User";

export interface CreateUserDTO {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone?: string;
	role: UserRole;
	address?: string;
}

export interface UpdateUserDTO {
	firstName?: string;
	lastName?: string;
	phone?: string;
	address?: string;
	latitude?: number;
	longitude?: number;
}


export interface LoginDTO {
	email: string;
	password: string;
}

export interface UserResponse {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	phone?: string;
	role: UserRole;
	address?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuthResponse {
	user: UserResponse;
	token: string;
}
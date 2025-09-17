import { Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../midddleware/auth";
import { dataSource } from "../utils/database";
import { User, UserRole } from "../models/User";
import { UpdateUserDTO, UserResponse } from "../types/user.types";
import { PaginationQuery } from "../types/common.types";

export class UserController {
	private userRepository = dataSource.getRepository(User);

	getProfile = async (req:AuthRequest, res: Response) => {
		try {
			const user = await this.userRepository.findOne({
				where: {id: req.user!.userId}
			});

			if(!user) 
				return res.status(404).json({
					success: false,
					message: 'User not found'
				});

			res.status(200).json({
				success: false,
				message: 'Profile retrieved successfully',
				data: this.formatUserResponse(user)
			})


		}
		catch(error: any){ 

			res.status(500).json({
				success: false,
				message: 'Failed to retrive profile',
				error: error.message
			});
		}
	};

	updateProfile = async (req:AuthRequest, res: Response) => {
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty)
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				});
			
				const updateData: UpdateUserDTO = req.body;

				await this.userRepository.update(req.user!.userId, updateData);

				const updatedUser = await this.userRepository.findOne({
					where: {id: req.user!.userId}
				});

				res.status(200).json({
					success: true,
					message: 'Profile updated successfully',
					data: this.formatUserResponse(updatedUser!)
				});

		}
		catch (error: any){
			res.status(400).json({
				success:false,
				message: 'Failed to update profile',
				error: error.message
			});
		}
	};


	getAllUsers = async (req: AuthRequest, res: Response) => {
		try{
			const page = Number(req.query.page) || 1;
			const limit = Number(req.query.limit) || 10
			const role = req.query.role as UserRole;
			const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined

			const skip = (page - 1) * limit;

			const queryBuilder = this.userRepository.createQueryBuilder('user'); 

			if(role) 
				queryBuilder.where('user.role = :role', {role})
			if(isActive!== undefined)
				queryBuilder.andWhere('user.isActive = :isActive', {isActive})

			const [user, total] = await queryBuilder
					.orderBy('user.createdAt', 'DESC')
					.skip(skip)
					.take(limit)
					.getManyAndCount();

				res.status(200).json({
					success: true,
					message:'Users retrivedd successfully',
					data: {
						data: user.map(user => this.formatUserResponse(user)),
						total,
						page,
						limit,
						totalPages: Math.ceil(total/limit)
					} 
				});
		}
		catch(error: any){
			res.status(500).json({
				success: false,
				message: 'Failed to retrieve users',
				error: error.message
			});
		}
	};


	getUserById = async(req: AuthRequest, res: Response) => {
		try {
			const userId = Number(req.params.id);

			const user = await this.userRepository.findOne({
				where: {id: userId}
			});

			if(!user)
				return res.status(404).json({
					success:false,
					message: 'User not found'
				});

			res.status(200).json({
				success: true,
				message: 'User retrieved successfully',
				data: this.formatUserResponse(user)
			});

		}
		catch(error: any) {
			res.status(500).json({
				success: false,
				message: 'Failed to retrive user',
				error: error.message
			});
		}
	};


	updateUser = async (req:AuthRequest, res: Response) => {
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty)
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				});

			const userId = Number(req.params.id);

			const updateData: UpdateUserDTO & { isActive?: boolean} = req.body;

			const user = await this.userRepository.findOne({
				where: {id:userId}
			});

			await this.userRepository.update(userId, updateData);

			const updatedUser = await this.userRepository.findOne({
				where: {id:userId}
			});

			res.status(200).json({
				success: true,
				message: 'User updated successfully',
				data: this.formatUserResponse(updatedUser!)
			});
		}
		catch(error: any){
			res.status(400).json({
				success: false,
				message: 'Failed to update user',
				error: error.message
			});
		}
	};


	deactivateUser = async (req: AuthRequest, res: Response) => {
		try{
			const userId = Number(req.params.id);

			const user = await this.userRepository.findOne({
				where: {id:userId}
			});


			if(!user)
				return res.status(404).json({
					success:false,
					message: 'User not found'
				});

			
			await this.userRepository.update(userId, {isActive: false});

			res.status(200).json({
				success: true,
				message: 'User dedactivated successfully'
			});
		}
		catch(error: any){
			res.status(400).json({
				success: false,
				message: 'Failed to deactivate user',
				error: error.message
			});
		}
	};

	getAvailableCouriers = async (req:AuthRequest, res: Response) => {
		try{
			const couriers = await this.userRepository.find({
				where: {
					role:UserRole.COURIER,
					isActive: true
				},
				order: { createdAt: 'DESC' }
			})

			res.status(200).json({
				success: false,
				message: 'Available couriers retrieved successfully',
				data: couriers.map(courier => this.formatUserResponse(courier))
			});

		}
		catch(error: any){
			res.status(500).json({
				success: false,
				message: 'Failed to retrieve couriers',
				error: error.message
			});
		}
	};



	private formatUserResponse(user: User): UserResponse {
		return {
			id:user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone,
			role: user.role,
			address: user.address,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		}
	}
}
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthService } from "../services/authService";
import { CreateUserDTO, LoginDTO } from "../types/user.types";
import { ApiResponse } from "../types/common.types";

export class AuthController {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();
	}

	register = async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				});
			}

			const userData: CreateUserDTO = req.body;
			const result = await this.authService.register(userData)

			res.status(201).json({
				success:true,
				message: 'User registered successfully',
				data: result
			});
		}
		catch(error: any) {
			res.status(400).json({
				success: false,
				message: 'Registration failed',
				error: error.message
			});
		}
	};

	login = async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				})
			}

			const loginData: LoginDTO = req.body;
			const result = await this.authService.login(loginData)

			res.status(200).json({
				success: true,
				message: 'Login successful',
				data: result
			});
		}
		catch(error: any) {
			res.status(401).json({
				success: false,
				message: 'Login failed',
				error: error.message
			});
		}
	};

	logout = async (req: Request, res: Response) => {
		try{
			res.status(200).json({
				success:true,
				message: 'Logout successful'
			})

		}
		catch(error: any){
			res.status(500).json({
				success: false,
				message: 'Logout failed',
				error: error.message
			});
		}
	};

}
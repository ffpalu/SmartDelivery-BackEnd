import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dataSource } from '../utils/database';
import { User } from '../models/User';
import { CreateUserDTO, LoginDTO, AuthResponse, UserResponse } from '../types/user.types';
import { JwtPayload } from '../types/common.types';

export class AuthService {
	private userRepository = dataSource.getRepository(User);

	async register(userData: CreateUserDTO): Promise<AuthResponse> {
		const existingUser = await this.userRepository.findOne({
			where: { email: userData.email }
		});
	
		if(existingUser) {
			throw new Error('User with this email already exists');
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
		
		const user = this.userRepository.create( {
			...userData,
			password: hashedPassword
		});

		const savedUser = await this.userRepository.save(user);

		const token = this.generateToken(savedUser)

		return {
			user: this.formatUserResponse(savedUser),
			token
		}
	}


	async login(loginData: LoginDTO):Promise<AuthResponse> {
		const user = await this.userRepository.findOne({
			where: { email: loginData.email }
		})

		if(!user){
			throw new Error('Invalid email or password')
		}


		if(!user.isActive) {
			throw new Error('Account is deactivated')
		}

		const isValidPassword = await bcrypt.compare(loginData.password, user.password);

		if(!isValidPassword)
			throw new Error('Invalid email or password')

		const token = this.generateToken(user);

		return {
			user: this.formatUserResponse(user),
			token
		}
	}


	private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, jwtSecret, {
      expiresIn: '24h'
    });
  }



	private formatUserResponse(user: User): UserResponse {
		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone,
			role: user.role,
			address: user.address,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
	}

}
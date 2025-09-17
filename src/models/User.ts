import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Order } from "./Order";

export enum UserRole {
	CUSTOMER = 'customer',
	COURIER = 'courier',
	ADMIN = 'admin'
}

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({unique: true})
	email: string;

	@Column()
	password: string;

	@Column({name: 'first_name'})
	firstName: string;

	@Column({name: 'last_name'})
	lastName: string;

	@Column({nullable: true})
	phone?: string;

	@Column({
		type: 'enum',
		enum: UserRole
	})
	role: UserRole;

	@Column({type: 'text', nullable: true})
	address?: string;

	@Column({name: 'is_active', default: true})
	isActive: boolean;

	@Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
	latitude?: number;

	@Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
	longitude?: number;

	@OneToMany( () => Order, order => order.customer)
	ordersAsCustomer: Order[];


	@OneToMany( () => Order, order => order.courier)
	ordersAsCourier: Order[];

	@CreateDateColumn({name: 'created_at'})
	createdAt: Date;

	@UpdateDateColumn({name: 'updated_at'})
	updatedAt: Date;

}

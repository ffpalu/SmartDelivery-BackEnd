import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Order } from "./Order";

@Entity('logs')
export class Log {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'user_id', nullable: true })
	userId?: number;

	@Column({ name: 'order_id', nullable: true })
	orderId?: number;

	@Column()
	action: string;

	@Column({ type: 'json', nullable: true })
	details?: any;

	@Column({ name: 'ip_address', nullable: true })
	ipAddress?: string;

	@Column({ name: 'user_agent', type: 'text', nullable: true })
	userAgent?: string;

	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: 'user_id' })
	user?: User;

	@ManyToOne(() => Order, { nullable: true })
	@JoinColumn({ name: 'order_id' })
	order?: Order;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	}
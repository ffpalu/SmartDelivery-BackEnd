import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./Order";
import { User } from "./User";

@Entity('deliveries')
export class Delivery {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'order_id' })
	orderId: number;

	@Column({ name: 'courier_id' })
	courierId: number;

	@Column({ name: 'current_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
	currentLatitude?: number;

	@Column({ name: 'current_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
	currentLongitude?: number;

	@Column()
	status: string;

	@Column({ name: 'estimated_arrival', nullable: true })
	estimatedArrival?: Date;

	@Column({ name: 'proof_image', nullable: true })
	proofImage?: string;

	@Column({ name: 'signature_image', nullable: true })
	signatureImage?: string;

	@Column({ type: 'text', nullable: true })
	notes?: string;


	@ManyToOne(() => Order, order => order.deliveries)
	@JoinColumn({ name: 'order_id' })
	order: Order;

	@ManyToOne(() => User, user => user.id)
	@JoinColumn({ name: 'courier_id' })
	courier: User;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Delivery } from "./Delivery";

export enum OrderStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	IN_TRANSIT = 'in_transit',
	DELIVERED = 'delivered',
	CANCELLED = 'cancelled'
}

@Entity('orders')
export class Order {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'customer_id' })
	customerId: number;

	@Column({ name: 'courier_id', nullable: true })
	courierId?: number;

	@Column({ name: 'pickup_address' , type: 'text'})
	pickupAddress: string;

	@Column({ name: 'delivery_address', type: 'text' })
	deliveryAddress: string;

	@Column({ name: 'pickup_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
	pickupLatitude?: number;

	@Column({ name: 'pickup_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
	pickupLongitude?: number;

	@Column({ name: 'delivery_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
	deliveryLatitude?: number;

	@Column({ name: 'delivery_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
	deliveryLongitude?: number;

	@Column( { 
		type: 'enum',
		enum: OrderStatus,
		default: OrderStatus.PENDING
	})
	status: OrderStatus;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({name: 'estimated_price', type: 'decimal', precision: 10, scale: 2, nullable: true})
	estimatedPrice?: number;

	@Column({ name: 'actual_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
	actualPrice?: number;

	@Column({name: 'estimated_delivery_time', nullable: true})
	estimatedDeliveryTime?: Date;

	@Column({ name: 'pickup_time', nullable: true })
	pickupTime?: Date;

	@Column({ name: 'delivery_time', nullable: true })
	deliveryTime?: Date;

	@Column({type: 'text', nullable: true})
	notes?: string

	@ManyToOne( () => User, user => user.ordersAsCustomer )
	@JoinColumn({ name: 'customer_id' })
	customer: User;

	@ManyToOne( () => User, user => user.ordersAsCourier )
	@JoinColumn({ name: 'courier_id' })
	courier?: User;

	@OneToMany( () => Delivery, delivery => delivery.order )
	deliveries: Delivery[];

	@CreateDateColumn({name: 'created_at'})
	createdAt: Date;

	@UpdateDateColumn({name: 'updated_at'})
	updatedAt: Date;


}
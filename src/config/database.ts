import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Delivery } from "../models/Delivery";
import { Log } from "../models/Log";

export const AppDataSource = new DataSource({
	type: "mysql",
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || "3306"),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.NODE_ENV === 'test' ? 'smartdelivery_test' : (process.env.DB_NAME || 'smartdelivery'),
	synchronize: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
	logging: process.env.NODE_ENV === "development",
	entities: [User, Order, Delivery, Log],
	migrations: ['src/migrations/*.ts'],
	subscribers: ['src/subscribers/*.ts'],
});
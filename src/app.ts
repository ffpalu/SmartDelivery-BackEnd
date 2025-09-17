import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import 'reflect-metadata';
dotenv.config();

import { connectDatabase } from './utils/database';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import deliveryRoutes from './routes/deliveries';
import { createServer } from 'http';
import { Server } from 'socket.io';


connectDatabase();

import { SocketHandlers } from './sockets/socketHandlers';
import { NotificationService } from './services/notificationService';
import { errorHandler, notFound } from './midddleware/errorHandler';
import logger from './utils/logger';

const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }

});

new SocketHandlers(io)

NotificationService.initialize(io);
app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: "*"
}));

app.use((req, res, next) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

app.use(morgan('combined'));

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true}));

app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/deliveries', deliveryRoutes);

app.use('/api/v1', (req,res) => {
	res.status(200).json({
		message: "SmartDelivery API v1.0",
		version: "1.0.0"
	});
});

app.use(notFound); 
app.use(errorHandler);

export default app;
export { httpServer };
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/common.types';
import { UserRole } from '../models/User';

interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

export class SocketHandlers {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.user?.email} connected`);
      
      // Join user-specific room
      socket.join(`user_${socket.user?.userId}`);
      
      // Join role-specific room
      socket.join(`role_${socket.user?.role}`);

      // Handle courier location updates
      if (socket.user?.role === UserRole.COURIER) {
        socket.on('location_update', (data) => this.handleLocationUpdate(socket, data));
        socket.on('courier_status', (data) => this.handleCourierStatus(socket, data));
      }

      // Handle order tracking
      socket.on('track_order', (data) => this.handleTrackOrder(socket, data));
      
      socket.on('disconnect', () => {
        console.log(`User ${socket.user?.email} disconnected`);
      });
    });
  }

  private handleLocationUpdate(socket: AuthenticatedSocket, data: any) {
    const { latitude, longitude, orderId } = data;
    
    if (!latitude || !longitude) {
      socket.emit('error', { message: 'Invalid location data' });
      return;
    }

    // Emit to customer tracking this order
    this.io.to(`order_${orderId}`).emit('location_update', {
      courierId: socket.user?.userId,
      latitude,
      longitude,
      timestamp: new Date()
    });
  }

  private handleCourierStatus(socket: AuthenticatedSocket, data: any) {
    const { status, orderId } = data;
    
    // Emit to customer and admin
    this.io.to(`order_${orderId}`).emit('courier_status', {
      courierId: socket.user?.userId,
      status,
      timestamp: new Date()
    });
  }

  private handleTrackOrder(socket: AuthenticatedSocket, data: any) {
    const { orderId } = data;
    
    // Join order-specific room for real-time updates
    socket.join(`order_${orderId}`);
    
    socket.emit('tracking_started', { orderId });
  }

  // Public methods for emitting events from services
  public emitOrderStatusUpdate(orderId: number, customerId: number, data: any) {
    this.io.to(`user_${customerId}`).emit('order_status_update', {
      orderId,
      ...data
    });
  }

  public emitOrderAssigned(orderId: number, courierId: number, data: any) {
    this.io.to(`user_${courierId}`).emit('order_assigned', {
      orderId,
      ...data
    });
  }

  public emitNewOrder(data: any) {
    this.io.to(`role_${UserRole.COURIER}`).emit('new_order', data);
  }

  public emitDeliveryUpdate(orderId: number, customerId: number, data: any) {
    this.io.to(`user_${customerId}`).emit('delivery_update', {
      orderId,
      ...data
    });
  }
}
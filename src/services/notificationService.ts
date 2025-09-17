import { Server } from 'socket.io';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../sockets/socketEvents';
import { OrderStatus } from '../models/Order';
import { UserRole } from '../models/User';

export class NotificationService {
  private static io: Server;

  static initialize(io: Server) {
    this.io = io;
  }

  static notifyOrderCreated(orderId: number, customerId: number, orderData: any) {
    // Notify customer
    this.io.to(SOCKET_ROOMS.USER(customerId)).emit(SOCKET_EVENTS.ORDER_CREATED, {
      orderId,
      message: 'Your order has been created successfully',
      data: orderData,
      timestamp: new Date()
    });

    // Notify available couriers
    this.io.to(SOCKET_ROOMS.ROLE(UserRole.COURIER)).emit(SOCKET_EVENTS.NEW_ORDER, {
      orderId,
      message: 'New order available',
      data: orderData,
      timestamp: new Date()
    });
  }

  static notifyOrderStatusUpdate(orderId: number, customerId: number, status: OrderStatus, data?: any) {
    const messages = {
      [OrderStatus.ACCEPTED]: 'Your order has been accepted by a courier',
      [OrderStatus.IN_TRANSIT]: 'Your order is on the way',
      [OrderStatus.DELIVERED]: 'Your order has been delivered',
      [OrderStatus.CANCELLED]: 'Your order has been cancelled',
			[OrderStatus.PENDING]: 'Your order is pending'
    };
		console.log(`Emitting to user_${customerId}:`, status);

    this.io.to(SOCKET_ROOMS.USER(customerId)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATE, {
      orderId,
      status,
      message: messages[status],
      data,
      timestamp: new Date()
    });
  }

  static notifyOrderAssigned(orderId: number, courierId: number, orderData: any) {
    this.io.to(SOCKET_ROOMS.USER(courierId)).emit(SOCKET_EVENTS.ORDER_ASSIGNED, {
      orderId,
      message: 'New order assigned to you',
      data: orderData,
      timestamp: new Date()
    });
  }

  static notifyLocationUpdate(orderId: number, customerId: number, location: any) {
    this.io.to(SOCKET_ROOMS.USER(customerId)).emit(SOCKET_EVENTS.LOCATION_UPDATE, {
      orderId,
      location,
      timestamp: new Date()
    });

    // Also notify order tracking room
    this.io.to(SOCKET_ROOMS.ORDER(orderId)).emit(SOCKET_EVENTS.LOCATION_UPDATE, {
      orderId,
      location,
      timestamp: new Date()
    });
  }

  static notifyDeliveryUpdate(orderId: number, customerId: number, deliveryData: any) {
    this.io.to(SOCKET_ROOMS.USER(customerId)).emit(SOCKET_EVENTS.DELIVERY_UPDATE, {
      orderId,
      message: 'Delivery status updated',
      data: deliveryData,
      timestamp: new Date()
    });
  }

  static notifyError(userId: number, error: string) {
    this.io.to(SOCKET_ROOMS.USER(userId)).emit(SOCKET_EVENTS.ERROR, {
      message: error,
      timestamp: new Date()
    });
  }

  static notifyGeneral(userId: number, message: string, data?: any) {
    this.io.to(SOCKET_ROOMS.USER(userId)).emit(SOCKET_EVENTS.NOTIFICATION, {
      message,
      data,
      timestamp: new Date()
    });
  }

  // Admin notifications
  static notifyAdmins(event: string, data: any) {
    this.io.to(SOCKET_ROOMS.ADMIN).emit(event, {
      data,
      timestamp: new Date()
    });
  }
}
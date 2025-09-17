import { dataSource } from '../utils/database';
import { Order, OrderStatus } from '../models/Order';
import { User, UserRole } from '../models/User';
import { CreateOrderDTO, UpdateOrderDTO, OrderResponse, OrderFilter } from '../types/order.types';
import { PaginationQuery, PaginatedResponse } from '../types/common.types';
import { NotificationService } from './notificationService';

export class OrderService {
  private orderRepository = dataSource.getRepository(Order);
  private userRepository = dataSource.getRepository(User);

  async createOrder(customerId: number, orderData: CreateOrderDTO): Promise<OrderResponse> {
    const order = this.orderRepository.create({
      ...orderData,
      customerId,
      status: OrderStatus.PENDING
    });

    const savedOrder = await this.orderRepository.save(order);
    return this.formatOrderResponse(savedOrder);
  }

  async getOrderById(orderId: number, userId: number, userRole: string): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'courier']
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check permissions
    if (userRole !== UserRole.ADMIN && 
        order.customerId !== userId && 
        order.courierId !== userId) {
      throw new Error('Access denied');
    }

    return this.formatOrderResponse(order);
  }

  async getOrders(
    userId: number, 
    userRole: string, 
    filters: OrderFilter = {}, 
    pagination: PaginationQuery = {}
  ): Promise<PaginatedResponse<OrderResponse>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.courier', 'courier');

    // Apply role-based filtering
    if (userRole === UserRole.CUSTOMER) {
      queryBuilder.where('order.customerId = :userId', { userId });
    } else if (userRole === UserRole.COURIER) {
      queryBuilder.where('order.courierId = :userId OR order.courierId IS NULL', { userId });
    }

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }
    if (filters.customerId && userRole === UserRole.ADMIN) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
    }
    if (filters.courierId && userRole === UserRole.ADMIN) {
      queryBuilder.andWhere('order.courierId = :courierId', { courierId: filters.courierId });
    }
    if (filters.dateFrom) {
      queryBuilder.andWhere('order.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      queryBuilder.andWhere('order.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    // Apply sorting and pagination
    queryBuilder
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders.map(order => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateOrder(orderId: number, updateData: UpdateOrderDTO, userId: number, userRole: string): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check permissions
    if (userRole === UserRole.CUSTOMER && order.customerId !== userId) {
      throw new Error('Access denied');
    }
    if (userRole === UserRole.COURIER && order.courierId !== userId) {
      throw new Error('Access denied');
    }

    // Validate status transitions
    if (updateData.status) {
      this.validateStatusTransition(order.status, updateData.status, userRole);
    }

    await this.orderRepository.update(orderId, updateData);
    const updatedOrder = await this.orderRepository.findOne({ 
      where: { id: orderId },
      relations: ['customer', 'courier']
    });

    const result = this.formatOrderResponse(updatedOrder!);

    // Emit real-time notification for status changes
    if (updateData.status) {
      NotificationService.notifyOrderStatusUpdate(orderId, order.customerId, updateData.status, result);
    }

    return result;
  }

  async assignCourier(orderId: number, courierId: number): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order cannot be assigned');
    }

    const courier = await this.userRepository.findOne({ 
      where: { id: courierId, role: UserRole.COURIER } 
    });

    if (!courier) {
      throw new Error('Courier not found');
    }

    await this.orderRepository.update(orderId, {
      courierId,
      status: OrderStatus.ACCEPTED
    });

    const updatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'courier']
    });

    const result = this.formatOrderResponse(updatedOrder!);

    // Emit real-time notifications
    NotificationService.notifyOrderAssigned(orderId, courierId, result);
    NotificationService.notifyOrderStatusUpdate(orderId, order.customerId, OrderStatus.ACCEPTED, result);

    return result;
  }

  async deleteOrder(orderId: number, userId: number, userRole: string): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new Error('Order not found');
    }

    // Only customers can delete their pending orders
    if (userRole !== UserRole.ADMIN && 
        (order.customerId !== userId || order.status !== OrderStatus.PENDING)) {
      throw new Error('Cannot delete this order');
    }

    await this.orderRepository.delete(orderId);
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus, userRole: string): void {
    const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Role-based restrictions
    if (userRole === UserRole.CUSTOMER && newStatus !== OrderStatus.CANCELLED) {
      throw new Error('Customers can only cancel orders');
    }
  }

  private formatOrderResponse(order: Order): OrderResponse {
    return {
      id: order.id,
      customerId: order.customerId,
      courierId: order.courierId,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      description: order.description,
      estimatedPrice: order.estimatedPrice,
      actualPrice: order.actualPrice,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      pickupTime: order.pickupTime,
      deliveryTime: order.deliveryTime,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
}
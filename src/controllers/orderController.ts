import { Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../midddleware/auth";
import { OrderService } from "../services/orderService";
import { CreateOrderDTO,UpdateOrderDTO, OrderFilter } from "../types/order.types";
import { PaginationQuery } from "../types/common.types";
import { error } from "console";

export class OrderController {
	private orderService: OrderService;

	constructor() {
		this.orderService = new OrderService();
	}

	createOrder = async (req:AuthRequest, res: Response) => {
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				});
			}

			const orderData: CreateOrderDTO = req.body;
			const result = await this.orderService.createOrder(req.user!.userId, orderData)

			res.status(201).json({
				success: true,
				message: 'Order created successfully',
				data: result
			});

		}
		catch(error: any){
			res.status(400).json({
				success: false,
				message: 'Failed to create ordder',
				error: error.message
			});
		}
	};

	getOrders = async (req: AuthRequest, res: Response) => {
    try {
      const filters: OrderFilter = {
        status: req.query.status as any,
        customerId: req.query.customerId ? Number(req.query.customerId) : undefined,
        courierId: req.query.courierId ? Number(req.query.courierId) : undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };

      const pagination: PaginationQuery = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC' || 'DESC'
      };

      const result = await this.orderService.getOrders(
        req.user!.userId,
        req.user!.role,
        filters,
        pagination
      );

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error.message
      });
    }
  };

	

	getOrderById = async (req: AuthRequest, res: Response) => {
		try {
			const orderId = Number(req.params.id);
			const result = await this.orderService.getOrderById(
				orderId,
				req.user!.userId,
				req.user!.role
			);

			res.status(200).json({
				success: true,
				message: 'Ordder retreved successfully',
				data: result
			});
		}
		catch(error:any){
			const statusCode = error.message === 'Order not found' ? 404 : 403;

			res.status(statusCode).json({
				success: false,
				message: 'Failed to retrive order',
				error: error.message
			});

		}
	};

	updateOrder = async (req:AuthRequest, res: Response) =>{
		try{
			const errors = validationResult(req)
			if(!errors.isEmpty()){
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				});
			}

			const orderId = Number(req.params.id)
			const updateData: UpdateOrderDTO = req.body;

			const result = await this.orderService.updateOrder(
				orderId,
				updateData,
				req.user!.userId,
				req.user!.role
			);

			res.status(200).json({
				success:true,
				message: 'Order updated successfully',
				data: result
			});

		}
		catch(error:any) {
			const statusCode = error.message.includes('not found') ? 404 : error.message.includes('denied') ? 403: 400;

			res.status(statusCode).json({
				success: false,
				message: 'Failed to update ordder',
				error: error.message
			});
		}
	};


	assignCourier = async (req:AuthRequest, res: Response) => {
		try{
			const orderId = Number(req.params.id);
			const {courierId} = req.body;

			const result = await this.orderService.assignCourier(orderId, courierId);

			res.status(200).json({
				success: true,
				message: 'Courier assigned successfully',
				data: result
			});
		}
		catch(error: any) {
			const statusCode = error.message.includes('not found')? 404: 400;
			res.status(statusCode).json({
				success: false,
				message: 'Faile to assign courier',
				error: error.message
			});
		}
	};

	deleteOrder = async (req:AuthRequest, res: Response) => {
		try{
			const orderId = Number(req.params.id);
			await this.orderService.deleteOrder(
				orderId,
				req.user!.userId,
				req.user!.role
			);

			res.status(200).json({
				success: true,
				message: 'Order ddeleted successfully'
			});
		}catch(error: any){
			const statusCode = error.message.includes('not found') ? 404 : 403;
			res.status(statusCode).json({
				success: false,
				message: 'failed to delete order',
				error: error.message
			});
		}
	};

}
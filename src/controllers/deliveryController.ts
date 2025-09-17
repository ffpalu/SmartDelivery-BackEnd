import { Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../midddleware/auth";
import { dataSource } from "../utils/database";
import { Delivery } from "../models/Delivery";
import { Order, OrderStatus } from "../models/Order";
import { UserRole } from "../models/User";
import { CreateDeliveryDTO, UpdateDeliveryDTO, DeliveryTrackingDTO } from "../types/delivery.types";
import { NotificationService } from "../services/notificationService";
import { LocationService } from "../services/locationService";
import { FileService } from "../services/fileService";

export class DeliveryController {
	private deliveryRepository = dataSource.getRepository(Delivery);
	private orderRepository = dataSource.getRepository(Order);

	createDelivery = async (req:AuthRequest, res: Response) => {
		try{
			const errors = validationResult(req); 
			if(!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				});
			}

			const deliveryData: CreateDeliveryDTO = req.body;
			const order = await this.orderRepository.findOne({where: {id: deliveryData.orderId}});

			if(!order){ 
				return res.status(404).json({
					success: false,
					message: 'Order not found'
				}); 
			}
				
			const delivery = this.deliveryRepository.create(deliveryData);
			const savedDelivery = await this.deliveryRepository.save(delivery);

			res.status(201).json({
				success: true,
				message: 'Delivery created successfully',
				data: savedDelivery
			});


		} catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Failed to create delivery',
        error: error.message
      });
    }
	};

	updateLocation = async (req:AuthRequest, res: Response) => {
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					error: errors.array()
				});
			}

			const deliveryId = Number(req.params.id); 
			const trackingData: DeliveryTrackingDTO = req.body;

			const delivery = await this.deliveryRepository.findOne({
				where: {id:deliveryId},
				relations: ['order']
			});

			if(!delivery) {
				return res.status(404).json({
					success: false,
					message: 'Delivery not found'
				});
			}

			if(req.user!.role === UserRole.COURIER && delivery.courierId !== req.user!.userId) {
				return res.status(403).json({
					success: false,
					message: 'Access denied'
				});
			}

			await this.deliveryRepository.update(deliveryId, {
				currentLatitude: trackingData.latitude,
				currentLongitude: trackingData.longitude,
				status: trackingData.status,
				notes: trackingData.notes
			})

			NotificationService.notifyLocationUpdate(
				delivery.order.id,
				delivery.order.customerId,
				{
					latitude: trackingData.latitude,
					longitude: trackingData.longitude,
					status: trackingData.status
				}
			);

			res.status(200).json({
				success: true,
				message: 'Location updated sucessfully'
			})


		}
		catch(error: any){
			res.status(400).json({
        success: false,
        message: 'Failed to update location',
        error: error.message
      });
		}
	};

	uploadProof = async (req: AuthRequest, res: Response) => {
		try{
			const deliveryId = Number(req.params.id);
			const file = req.file;
			
			if(!file) {
				return res.status(400).json({
					success: false,
					message: 'No file uploaded'
				});
			}

			FileService.validateFile(file);

			const delivery = await this.deliveryRepository.findOne({
				where: {id:deliveryId},
				relations: ['ordder']
			});

			if(!delivery)
				return res.status(404).json({
					success: false,
					message: 'Delivery not found'
				});

			if(req.user!.role === UserRole.COURIER && delivery.courierId !== req.user!.userId) {
				res.status(403).json({
					success: false,
					message: 'Access denied'
				});
			}

			const filename = FileService.generateFileName(file.originalname, 'proof_');
			const updateData: any = {};

			if(req.body.type === 'signature') {
				updateData.signatureImage = filename;
			}
			else {
				updateData.proofImage = filename; 
			}

			await this.deliveryRepository.update(deliveryId, updateData);

			res.status(200).json({
				success: true,
				message: 'Proof uploadedd successfully',
				data:{
					filename,
					url: FileService.getFileUrl(filename)
				}
			});
		}
		catch(error: any){
			res.status(400).json({
				success: false,
				message: 'Failed to upload proof',
				error: error.message
			});
		}
	}

	completeDelivery = async (req: AuthRequest, res: Response) =>{
		try{
			const deliveryId = Number(req.params.id);
			const { notes } = req.body;

			const delivery = await this.deliveryRepository.findOne({
				where: {id: deliveryId},
				relations: ['order']
			});

			if(!delivery) {
				return res.status(404).json({
					success: false,
					message: 'Delivery not found'
				});
			}

			if(req.user!.role === UserRole.COURIER && delivery.courierId !== req.user!.userId){
				return res.status(403).json({
					success: false,
					message: 'Access denied'
				});
			}

			await this.deliveryRepository.update(deliveryId, {
				status: 'delivered',
				notes: notes || delivery.notes
			});

			await this.orderRepository.update(delivery.order.id, {
				status: OrderStatus.DELIVERED,
				deliveryTime: new Date()
			});

			NotificationService.notifyOrderStatusUpdate(
				delivery.order.id,
				delivery.order.customerId,
				OrderStatus.DELIVERED,
				{deliveryId, notes}
			);

			res.status(200).json({
				success: true,
				message: 'Delivery completed successfully'
			});


		}
		catch(error: any){
			res.status(400).json({
				success: false,
				message: 'Failed to complete delivery',
				error: error.message
			});
		}
	};

	getDeliveryById = async (req:AuthRequest, res: Response) => {
		try {
			const deliveryId = Number(req.params.id);

			const delivery = await this.deliveryRepository.findOne({
				where: { id: deliveryId },
				relations: ['order', 'courier']
			});

			if(!delivery) {
				return res.status(404).json({
					success: false,
					message: 'Delivery not found'
				});
			}

			if(req.user!.role !== UserRole.ADMIN && 
				delivery.courierId !== req.user!.userId &&
				delivery.order.customerId !== req.user!.userId
			)
			return res.status(403).json({
				success: false,
				message: 'Access denied'
			});

			res.status(200).json({
				success: true,
				message: 'Delivery retrived successfully',
				data: delivery
			});
		}
		catch(error: any) {
			res.status(400).json({
				success: false,
				messege: 'Failed to retrieve delivery',
				error: error.message
			});
		}
	};



}
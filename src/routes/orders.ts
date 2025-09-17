import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import { authenticateToken } from "../midddleware/auth";
import { requireRole, requireAdmin } from "../midddleware/roleCheck";
import { UserRole } from "../models/User";
import { createOrderValidation, updateOrderValidation } from "../utils/validators"

const router = Router();
const orderController = new OrderController();

router.use(authenticateToken);

router.get('/', orderController.getOrders)

router.post('/',
	requireRole([UserRole.CUSTOMER]),
	createOrderValidation,
	orderController.createOrder
);

router.get('/:id', orderController.getOrderById);

router.put('/:id', updateOrderValidation, orderController.updateOrder);

router.delete('/:id', orderController.deleteOrder);

router.put('/:id/assign', requireAdmin, orderController.assignCourier)


export default router; 

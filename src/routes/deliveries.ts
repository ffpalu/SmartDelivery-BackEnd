import { Router } from "express";
import { DeliveryController } from "../controllers/deliveryController";
import { authenticateToken } from "../midddleware/auth";
import { requireCourier } from "../midddleware/roleCheck";
import { uploadProof } from "../midddleware/upload";
import { createDeliveryValidation, updateLocationValidation } from "../utils/validators";

const router = Router();
const deliveryController = new DeliveryController();

router.use(authenticateToken)

router.post('/',
	createDeliveryValidation,
	deliveryController.createDelivery
);

router.get('/:id', deliveryController.getDeliveryById); 

router.put('/:id/location',
	requireCourier,
	updateLocationValidation,
	deliveryController.updateLocation
)

router.post('/:id/proof',
	requireCourier,
	uploadProof,
	deliveryController.uploadProof
);

router.put('/:id/complete',
	requireCourier,
	deliveryController.completeDelivery
);

export default router;

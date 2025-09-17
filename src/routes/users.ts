import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../midddleware/auth";
import { requireAdmin } from "../midddleware/roleCheck";
import { updateUserValidation } from "../utils/validators";

const router = Router();
const userController = new UserController();

router.use(authenticateToken);

router.get('/profile', userController.getProfile);

router.put('/profile',
	updateUserValidation,
	userController.updateProfile
);

router.get('/couriers', userController.getAvailableCouriers);

router.get('/', 
	requireAdmin, 
	userController.getAllUsers
);

router.get('/:id',
	requireAdmin,
	userController.getUserById
);

router.put('/:id',
	requireAdmin,
	updateUserValidation,
	userController.updateUser
);

router.put('/:id/deactivate',
	requireAdmin,
	userController.deactivateUser
);

export default router;
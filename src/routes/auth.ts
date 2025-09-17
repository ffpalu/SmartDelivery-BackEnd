import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { registerValidation, loginValidation } from "../utils/validators";

const router = Router();
const authController = new AuthController()

router.post('/register', registerValidation, authController.register);

router.post('/login', loginValidation, authController.login);

router.post('/logout', authController.logout);

export default router;
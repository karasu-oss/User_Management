import { Router } from "express";
import { UsersController } from "../controllers/users.controller.js";
import { AuthGuard } from '../middleware/jwt-auth.guard.js';
import { SelfGuard } from '../middleware/self.guard.js';
import { AdminGuard } from "../middleware/admin.guard.js";

const router = Router();
const controller = new UsersController();

router
    .post('/', controller.createUser)
    .get('/', AdminGuard, controller.getAllUsers)
    .get('/:id', SelfGuard, controller.getUserById)
    .post('/signIn', controller.signIn)
    .post('/confirmSignIn', controller.confirmSignIn)
    .post('/token', controller.getAccessToken)
    .put('/:id/block', AuthGuard, SelfGuard, controller.blockUser)
    .delete('/:id', AuthGuard, SelfGuard, controller.deleteUser)

export default router;
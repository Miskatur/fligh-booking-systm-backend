import express from "express";
import { UserController } from "./user.controller";
import verifyToken from "../../middleware/verifyToken";

const router = express.Router();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.patch("/update", verifyToken, UserController.updateUser);
router.patch("/change-password", verifyToken, UserController.changePassword);

export const UserRoutes = router;

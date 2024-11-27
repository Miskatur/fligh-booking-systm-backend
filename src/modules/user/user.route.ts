import express from "express";
import { UserController } from "./user.controller";
import verifyToken from "../../middleware/verifyToken";

const router = express.Router();

router.post("/register/agent", verifyToken, UserController.registerUser);
router.post("/login", UserController.loginUser);
router.get("/agents", UserController.getAllUsers);
router.patch("/agents/remove/:id", verifyToken, UserController.deleteUser);

export const UserRoutes = router;

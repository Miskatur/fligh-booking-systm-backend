"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const verifyToken_1 = __importDefault(require("../../middleware/verifyToken"));
const router = express_1.default.Router();
router.get("/overview", verifyToken_1.default, user_controller_1.UserController.overViewData);
router.post("/register", user_controller_1.UserController.registerUser);
router.post("/login", user_controller_1.UserController.loginUser);
router.patch("/update", verifyToken_1.default, user_controller_1.UserController.updateUser);
router.patch("/change-password", verifyToken_1.default, user_controller_1.UserController.changePassword);
exports.UserRoutes = router;

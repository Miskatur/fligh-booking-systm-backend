"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const baseController_1 = __importDefault(require("../../shared/baseController"));
const user_service_1 = require("./user.service");
class Controller extends baseController_1.default {
    constructor() {
        super(...arguments);
        this.registerUser = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield user_service_1.UserService.registerUser(req.body);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "A User Registered successfully",
                data: result,
            });
        }));
        this.loginUser = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield user_service_1.UserService.loginUser(req.body);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "User Logged In successfully",
                data: result,
            });
        }));
        this.changePassword = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const user_id = req.id;
            const result = yield user_service_1.UserService.changePassword(user_id, req.body);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Password changed successfully",
                data: result,
            });
        }));
        this.updateUser = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const user_id = req.id;
            const result = yield user_service_1.UserService.updateUser(user_id, req.body);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Profile updated successfully",
                data: result,
            });
        }));
    }
}
exports.UserController = new Controller();

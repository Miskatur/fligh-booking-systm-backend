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
exports.UserService = void 0;
const error_1 = __importDefault(require("../../middleware/error"));
const hashPassword_1 = require("../../shared/hashPassword");
const jsonWebTokenHelpers_1 = __importDefault(require("../../shared/jsonWebTokenHelpers"));
const user_model_1 = __importDefault(require("./user.model"));
class Service {
    registerUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = payload;
            const isExistUser = yield user_model_1.default.findOne({ email });
            if (isExistUser) {
                throw new error_1.default(409, "User Email already in use");
            }
            const hashedPassword = yield hashPassword_1.HashPassword.hash(payload === null || payload === void 0 ? void 0 : payload.password);
            payload.password = hashedPassword;
            const user = new user_model_1.default(payload);
            yield user.save();
            return true;
        });
    }
    loginUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserExist = yield user_model_1.default.findOne({
                email: payload === null || payload === void 0 ? void 0 : payload.email,
            });
            if (!isUserExist) {
                throw new error_1.default(404, "User not found");
            }
            const isPasswordCorrect = yield hashPassword_1.HashPassword.compare(payload === null || payload === void 0 ? void 0 : payload.password, isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.password);
            if (!isPasswordCorrect) {
                throw new error_1.default(403, "Password is incorrect");
            }
            const userData = yield user_model_1.default.findOne({ email: payload.email }, {
                password: 0,
            });
            const token = jsonWebTokenHelpers_1.default.createToken({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                phone: userData.phone,
            }, process.env.JWT_ACCESS_TOKEN_SECRET, "1yr");
            return {
                userData,
                accessToken: token,
            };
        });
    }
    changePassword(user_id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const IsUserAvailable = yield user_model_1.default.findById(user_id);
            if (!IsUserAvailable) {
                throw new error_1.default(404, "User not found");
            }
            const isOldPasswordCorrect = yield hashPassword_1.HashPassword.compare(payload === null || payload === void 0 ? void 0 : payload.oldPassword, IsUserAvailable === null || IsUserAvailable === void 0 ? void 0 : IsUserAvailable.password);
            if (!isOldPasswordCorrect) {
                throw new error_1.default(403, "Old password is incorrect");
            }
            const hashedNewPassword = yield hashPassword_1.HashPassword.hash(payload === null || payload === void 0 ? void 0 : payload.newPassword);
            IsUserAvailable.password = hashedNewPassword;
            yield IsUserAvailable.save();
            return IsUserAvailable;
        });
    }
    updateUser(user_id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserExist = yield user_model_1.default.findById(user_id);
            if (!isUserExist) {
                throw new error_1.default(404, "User not found");
            }
            const result = yield user_model_1.default.findByIdAndUpdate(user_id, payload, {
                new: true,
            }).select({
                password: 0,
            });
            return result;
        });
    }
}
exports.UserService = new Service();

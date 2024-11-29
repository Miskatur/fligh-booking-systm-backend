"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtHelpers {
    static createToken(payload, secret, expireTime) {
        return jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: expireTime,
        });
    }
    static verifyToken(token, secret) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
}
exports.default = JwtHelpers;

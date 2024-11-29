"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
const jsonWebTokenHelpers_1 = __importDefault(require("../shared/jsonWebTokenHelpers"));
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        const isVerified = jsonWebTokenHelpers_1.default.verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        if (!isVerified) {
            throw new error_1.default(409, "Invalid token");
        }
        else {
            req.email = isVerified.email;
            req.role = isVerified.role;
            req.name = isVerified.name;
            req.id = isVerified.id;
            next();
        }
    }
    else {
        throw new error_1.default(409, "Token not found");
    }
};
exports.default = verifyToken;

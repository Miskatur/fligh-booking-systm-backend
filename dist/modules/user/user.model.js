"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: false,
        enum: ["ADMIN", "USER"],
        default: "USER",
    },
    phone: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;

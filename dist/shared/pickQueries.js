"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pickQueries = (obj, keys) => {
    const queryObj = {};
    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            queryObj[key] = obj[key];
        }
    }
    return queryObj;
};
exports.default = pickQueries;

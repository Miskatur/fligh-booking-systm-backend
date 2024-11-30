"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationHelpers = void 0;
const calculatePagination = (options) => {
    const page = Number((options === null || options === void 0 ? void 0 : options.page) || 1);
    const limit = Number((options === null || options === void 0 ? void 0 : options.limit) || 10);
    const sortBy = options.sortBy || "date";
    const sortOrder = options.sortOrder || "asc";
    const skip = (page - 1) * limit;
    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    };
};
exports.paginationHelpers = {
    calculatePagination,
};

export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type IFilterRequest = {
  origin?: string;
  destination?: string;
  date?: string;
  admin?: string;
};

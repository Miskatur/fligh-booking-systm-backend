export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type IFilterRequest = {
  searchQuery?: string;
  minDate?: string;
  maxDate?: string;
  agent?: string;
};

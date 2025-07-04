export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  panNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  panNumber: string;
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: string;
}

export interface BulkUploadError {
  row: number;
  errors: string[];
}

export interface BulkUploadResult {
  success: boolean;
  message: string;
  errors?: BulkUploadError[];
  successCount?: number;
}

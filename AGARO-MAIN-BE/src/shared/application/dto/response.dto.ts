export class ApiResponseDto<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;

  constructor(success: boolean, data?: T, message?: string, error?: any) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(true, data, message);
  }

  static error(error: any, message?: string): ApiResponseDto<undefined> {
    return new ApiResponseDto(false, undefined, message, error);
  }
}

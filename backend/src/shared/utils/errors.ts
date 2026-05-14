export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 400, errorCode: string = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errorCode?: string, details?: any) {
    return new AppError(message, 400, errorCode || 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized', errorCode?: string) {
    return new AppError(message, 401, errorCode || 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden', errorCode?: string) {
    return new AppError(message, 403, errorCode || 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found', errorCode?: string) {
    return new AppError(message, 404, errorCode || 'NOT_FOUND');
  }

  static conflict(message: string, errorCode?: string) {
    return new AppError(message, 409, errorCode || 'CONFLICT');
  }

  static internal(message: string = 'Internal server error', errorCode?: string) {
    return new AppError(message, 500, errorCode || 'INTERNAL_ERROR');
  }
}

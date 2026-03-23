import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`[Error] ${code} - ${status}: ${message}`, err);

  res.status(status).json({
    success: false,
    status,
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export class AppError extends Error implements ApiError {
  status: number;
  code: string;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const BadRequest = (message: string, code: string = 'BAD_REQUEST'): AppError => {
  return new AppError(message, 400, code);
};

export const Unauthorized = (message: string = 'Unauthorized', code: string = 'UNAUTHORIZED'): AppError => {
  return new AppError(message, 401, code);
};

export const Forbidden = (message: string = 'Forbidden', code: string = 'FORBIDDEN'): AppError => {
  return new AppError(message, 403, code);
};

export const NotFound = (message: string = 'Not Found', code: string = 'NOT_FOUND'): AppError => {
  return new AppError(message, 404, code);
};

export const InternalError = (message: string = 'Internal Server Error', code: string = 'INTERNAL_ERROR'): AppError => {
  return new AppError(message, 500, code);
};

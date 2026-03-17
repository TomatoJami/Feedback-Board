import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  status?: number;
}

const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${status}: ${message}`);

  res.status(status).json({
    error: {
      status,
      message,
    },
  });
};

export default errorHandler;

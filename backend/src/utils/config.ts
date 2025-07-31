import { Response } from "express";

export const PORT = 4545;

export const DB_URIMONGODB = "mongodb://mongodb:27017/test";

export const SECRET_KEY = "tRuBEf1A0l8Heth3qAgO";

const HttpStatus: Record<number, string> = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error",
  503: "Service Unavailable",
  409: "already exists",
};

export function sendResponse(
  res: Response,
  statusCode: number,
  data: any = ""
) {
  if (statusCode == 200) {
    return res.status(statusCode).json({
      ...data,
    });
  } else {
    return res.status(statusCode).json({
      status: statusCode,
      message: HttpStatus[statusCode],
      err: data,
    });
  }
}

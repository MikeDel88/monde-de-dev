import {HttpErrorResponse} from "@angular/common/http";

export class AppError extends Error {
  constructor(message: string, public readonly status: number, public readonly cause?: HttpErrorResponse) {
    super(message);
  }
}

import {FieldError} from "./field-error";

export interface ApiProblemDetail {
  status: number;
  detail?: string;
  errors?: FieldError[];
}

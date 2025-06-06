import { AxiosError } from "axios";
import { NextResponse } from "next/server";

interface ServiceTitanError {
  type: string;
  title: string;
  status: number;
  traceId: string;
  errors: object;
  data: object;
}

interface ApiError {
  message?: string;
  stack?: string;
  code?: string | number;
  status?: number;
  name?: string;
  [key: string]: any;
}

interface ErrorHandlerOptions {
  message?: string;
  status?: number;
  logPrefix?: string;
}

export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): NextResponse {
  const {
    message = "Internal server error",
    status = 500,
    logPrefix = "[API Error]"
  } = options;

  // Convert the error to a serializable object
  let errorObject: ApiError = {};

  // add logic to handle axios error
  if (error instanceof AxiosError) {
    // TODO: might not need this. See stringify below
    if (error.response?.data?.errors) {
      const serviceTitanError = error.response?.data as ServiceTitanError;
      console.log(JSON.stringify(serviceTitanError, null, 2));
    }
  }

  if (error instanceof Error) {
    errorObject = {
      ...error,
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  } else if (typeof error === 'object' && error !== null) {
    errorObject = { ...error } as ApiError;
  } else {
    errorObject = { message: String(error) };
  }

  // Log the stringified error object
  console.error(`${logPrefix} ${JSON.stringify(errorObject, null, 2)}`);

  return NextResponse.json(
    { error: message, errors: errorObject },
    { status }
  );
} 
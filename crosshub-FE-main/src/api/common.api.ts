type ErrorResponse = {
  message: string | Array<{message: string; path: string[]}>;
  error: string;
  statusCode: number;
};

export type { ErrorResponse };

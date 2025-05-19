export type ValidationIssue = {
  message: string;
  path?: Array<PropertyKey>;
};

export interface ValidationPipeOptions {
  exceptionFactory?: (issues: ValidationIssue[]) => Error;
}

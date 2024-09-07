export interface IErrorhandler extends Error {
  status?: number;
  message: string;
}

export interface IPasswordHasher {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  validatePassword(password: string): void;
}

export interface IError {
  message: string;
  status: number;
  error: string;
  stack: string;
}

export interface ILogger {
  info(message: string): void;
  error(message: string): void;
}

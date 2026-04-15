export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(422, 'VALIDATION_ERROR', message, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, 'DATABASE_ERROR', message, details);
  }
}

export class InvalidInstructorCountError extends AppError {
  constructor(message: string, details?: unknown) {
    super(422, 'INVALID_INSTRUCTOR_COUNT', message, details);
  }
}

export class RenderError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, 'RENDER_ERROR', message, details);
  }
}

export class StorageError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, 'STORAGE_ERROR', message, details);
  }
}

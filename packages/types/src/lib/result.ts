export type Result<T, U> = Failure<T> | Success<U>;

export type Success<T> = { success: true, result: T };
export type Failure<T> = { success: false, error: T }

export function success<T, U>(result?: U): Result<T, U> {
  return { success: true, result: result as U };
}

export function failure<T, U>(error: T): Result<T, U> {
  return { success: false, error };
}
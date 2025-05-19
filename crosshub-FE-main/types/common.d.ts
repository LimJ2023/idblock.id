type Success<T> = {
  success: true;
  value: T;
};

type Failure<E> = {
  success: false;
  error: E;
};

type Result<T, E> = Success<T> | Failure<E>;

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

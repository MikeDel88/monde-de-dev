export interface CursorPage<T> {
  content: T[];
  hasNext: boolean;
  nextCursor: number | null;
}

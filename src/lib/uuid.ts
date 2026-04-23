import { uuidv7 } from "uuidv7";

/**
 * Generate a UUIDv7 identifier.
 * UUIDv7 is time-ordered, making it ideal for database primary keys
 * as it preserves insertion order and works well with B-tree indexes.
 */
export function generateId(): string {
  return uuidv7();
}

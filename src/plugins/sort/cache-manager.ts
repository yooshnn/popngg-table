import { TShape, Columns } from "../../core/types";
import { Direction } from "./types";

export class CacheManager<T extends TShape> {
  private cache: Record<Direction, Record<keyof T, T[]>>;

  constructor() {
    this.cache = { asc: {}, desc: {} } as Record<"asc" | "desc", Record<keyof T, T[]>>;
  }

  // Get sorted data
  readCache(field: keyof T, direction: Direction, data: readonly T[], columns: Columns<T>): T[] {
    const cached = this.cache[direction][field];
    if (cached) return cached;

    // Cache miss
    const sorted = this.createSorted(field, data, columns);
    this.cache[direction][field] = direction === "desc" ? sorted.reverse() : sorted;
    return this.cache[direction][field];
  }

  // Copy & Sort if not cached
  private createSorted(field: keyof T, data: readonly T[], columns: Columns<T>): T[] {
    const { compareFn } = columns[field];
    const replica = [...data];

    if (compareFn) {
      return replica.sort((a, b) => compareFn(a[field], b[field]));
    }

    if (replica.length > 0 && this.isPrimitive(replica[0][field])) {
      return replica.sort((a, b) => (a[field] < b[field] ? -1 : 1));
    }

    // Either data is empty or errornous configuration
    return replica;
  }

  // Utility
  private isPrimitive(value: unknown): boolean {
    return value !== Object(value);
  }

  // Cache reset
  clearCache() {
    this.cache = { asc: {}, desc: {} } as Record<"asc" | "desc", Record<keyof T, T[]>>;
  }
}

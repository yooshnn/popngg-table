import { TShape, StringKey } from "../../core/types";
import { Comparators, Direction, Cache } from "./types";

export class CacheManager<T extends TShape, O extends Comparators<T>> {
  private cache: Cache<T, O>;
  private options: Comparators<T>;

  constructor(options: O) {
    this.cache = { asc: {}, desc: {} } as Cache<T, O>;
    this.options = options;
  }

  // Get sorted data
  readCache(field: StringKey<O>, direction: Direction, data: readonly T[]): T[] {
    const cached = () => this.cache[direction][field];

    // Cache miss
    if (!cached()) {
      const sorted = this.createSorted(field, data);
      this.cache["asc"][field] = sorted;
      this.cache["desc"][field] = sorted.slice().reverse();
    }

    return cached();
  }

  // Copy & Sort if not cached
  private createSorted(field: StringKey<O>, data: readonly T[]): T[] {
    const compare = this.options[field];
    const replica = data.slice();
    return replica.sort(compare);
  }

  // Cache reset
  clearCache() {
    this.cache = { asc: {}, desc: {} } as Cache<T, O>;
  }
}

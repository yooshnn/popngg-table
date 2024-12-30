import { TShape } from "./types";

export class Cache<T extends TShape> {
  private data: T[][];

  constructor(init: T[]) {
    this.data = [init];
    // the rest will be implicitly allocated while useTable hook initializing it's table.
  }

  /** returns  */
  public get = (index: number): T[] => {
    if (this.data.length === 0) throw Error("Cache was not initialized.");

    if (index < this.data.length) {
      return this.data[index].slice();
    }

    return this.data[this.data.length - 1];
  };

  public set = (index: number, table: T[]) => {
    if (this.data.length === 0) throw Error("Cache was not initialized.");

    while (index >= this.data.length) {
      this.data.push(this.data[this.data.length - 1]);
    }

    this.data[index] = table;
  };
}

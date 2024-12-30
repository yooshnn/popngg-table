import { StringKey, TShape } from "../../core/types";

export type Direction = "asc" | "desc";
export type Comparators<T> = Record<string, (i: T, j: T) => number>;

export type Sort<T extends TShape> = StringKey<Config<T>["comparators"]>;
export type Options<T extends TShape> = Array<StringKey<Config<T>["comparators"]>>;

export interface Config<T extends TShape> {
  comparators: Comparators<T>;
  fallback: {
    sort: StringKey<Config<T>["comparators"]>;
    direction: Direction;
  };
}

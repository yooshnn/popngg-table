import { TShape, PluginResult, StringKey } from "../../core/types";

export type Cache<T extends TShape, O extends Comparators<T>> = Record<Direction, Record<StringKey<O>, T[]>>;

export type Direction = "asc" | "desc";
export type Comparators<T> = Record<string, (i: T, j: T) => number>;

export interface Config<T extends TShape> {
  comparators: Comparators<T>;
  fallback: {
    sort: StringKey<Config<T>["comparators"]>;
    direction: Direction;
  };
}

export interface Result<T extends TShape> extends PluginResult<T> {
  state: {
    sort: string;
    direction: Direction;
  };
  func: {
    setSort: React.Dispatch<React.SetStateAction<StringKey<Config<T>["comparators"]>>>;
    setDirection: React.Dispatch<React.SetStateAction<Direction>>;
  };
  misc: {
    sortOptions: Array<StringKey<Config<T>["comparators"]>>;
  };
}

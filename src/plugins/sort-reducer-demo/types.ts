import { TShape, PluginResult, StringKey } from "../../core/types";

export type Direction = "asc" | "desc";

export interface Result<T extends TShape> extends PluginResult<T> {
  state: {
    sort: StringKey<T>;
    direction: Direction;
  };
  func: {
    setSort: (newSort: StringKey<T>) => void;
    setDirection: (newDirection: Direction) => void;
  };
  misc: {
    sortOptions: Array<StringKey<T>>;
  };
}

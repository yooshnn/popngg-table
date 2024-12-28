import { TShape, PluginResult, StringKey } from "../../core/types";

export type Direction = "asc" | "desc";

export interface Result<T extends TShape> extends PluginResult<T> {
  state: {
    sort: StringKey<T>;
    direction: Direction;
  };
  func: {
    setSort: React.Dispatch<React.SetStateAction<StringKey<T>>>;
    setDirection: React.Dispatch<React.SetStateAction<Direction>>;
  };
  misc: {
    sortOptions: Array<StringKey<T>>;
  };
}

import React from "react";
import { Columns, PluginFactory, PluginResult, StringKey, TShape } from "../../core/types";
import { useTableStore } from "../../store/store";
import { Direction, Result } from "./types";
import { CacheManager } from "./cache-manager";
import { useStateUrl } from "../util/state-url/hooks";

export function plugSort<T extends TShape>(fallback: {
  sort: StringKey<T>;
  direction: Direction;
}): PluginFactory<T, Result<T>["state"], Result<T>["func"], Result<T>["misc"]> {
  return (): PluginResult<T, Result<T>["state"], Result<T>["func"], Result<T>["misc"]> => {
    const columns = useTableStore<T, Columns<T>>((state) => state.columns);
    const [cache] = React.useState<CacheManager<T>>(new CacheManager());

    const [sort, setSort] = useStateUrl<StringKey<T>>({
      key: "sort",
      parser: (str) => (Object.prototype.hasOwnProperty.call(columns, str) ? (str as StringKey<T>) : undefined),
      fb: fallback.sort,
    });

    const [direction, setDirection] = useStateUrl<Direction>({
      key: "direction",
      parser: (str) => (str === "asc" || str === "desc" ? str : undefined),
      fb: fallback.direction,
    });

    const transformer = React.useCallback<(_: T[]) => T[]>(
      (data) => {
        return cache.readCache(sort, direction, data, columns);
      },
      [cache, sort, direction, columns]
    );

    const state = { sort: sort, direction };

    const func = React.useMemo(() => ({ setSort, setDirection }), [setDirection, setSort]);

    const misc = React.useMemo(
      () => ({
        sortOptions: Object.keys(columns).filter((i) => columns[i].sortable) as StringKey<T>[],
      }),
      [columns]
    );

    return {
      transformer,
      state,
      func,
      misc,
    };
  };
}

import React from "react";
import { Columns, PluginFactory, PluginResult, StringKey, TShape } from "../../core/types";
import { useTableStore } from "../../store/store";
import { Direction, Result } from "./types";
import { CacheManager } from "../sort/cache-manager";
import { useReducerUrl } from "../../util/state-url/hooks";

export function plugSort<T extends TShape>(fallback: {
  sort: StringKey<T>;
  direction: Direction;
}): PluginFactory<T, Result<T>["state"], Result<T>["func"], Result<T>["misc"]> {
  return (): PluginResult<T, Result<T>["state"], Result<T>["func"], Result<T>["misc"]> => {
    const columns = useTableStore<T, Columns<T>>((state) => state.columns);
    const [cache] = React.useState<CacheManager<T>>(new CacheManager());

    type SortState = { sort: StringKey<T>; direction: Direction };
    type Payload = { what: "sort"; how: StringKey<T> } | { what: "direction"; how: Direction };
    const testFn = React.useCallback((state: SortState, payload: Payload) => {
      switch (payload.what) {
        case "sort":
          return { ...state, sort: payload.how };
        case "direction":
          return { ...state, direction: payload.how };
      }
    }, []);

    const [{ sort, direction }, sortDispatch] = useReducerUrl<SortState, Payload>(testFn, {
      sort: {
        key: "sort",
        parser: (str) => (Object.prototype.hasOwnProperty.call(columns, str) ? (str as StringKey<T>) : undefined),
        fb: fallback.sort,
      },
      direction: {
        key: "direction",
        parser: (str) => (str === "asc" || str === "desc" ? str : undefined),
        fb: fallback.direction,
      },
    });

    const setDirection = React.useCallback(
      (newDirection: Direction) => sortDispatch({ what: "direction", how: newDirection }),
      [sortDispatch]
    );

    const setSort = React.useCallback(
      (newSort: StringKey<T>) => sortDispatch({ what: "sort", how: newSort }),
      [sortDispatch]
    );

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

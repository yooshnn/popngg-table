import React from "react";
import { PluginFactory, StringKey, TShape } from "../../core/types";
import { Direction, Config, Result } from "./types";
import { CacheManager } from "./cache-manager";
import { useStateUrl } from "../util/state-url/hooks";

export function plugSort<T extends TShape>({
  comparators,
  fallback,
}: Omit<Config<T>, "comparators"> & { comparators: Config<T>["comparators"] }): PluginFactory<T, Result<T>> {
  return (): Result<T> => {
    const [cache] = React.useState(new CacheManager<T, Config<T>["comparators"]>(comparators));

    const [sort, setSort] = useStateUrl<StringKey<Config<T>["comparators"]>>({
      key: "sort",
      parser: (str) =>
        Object.prototype.hasOwnProperty.call(comparators, str)
          ? (str as StringKey<Config<T>["comparators"]>)
          : undefined,
      fb: fallback.sort,
    });

    const [direction, setDirection] = useStateUrl<Direction>({
      key: "direction",
      parser: (str) => (str === "asc" || str === "desc" ? str : undefined),
      fb: fallback.direction,
    });

    const transformer = React.useCallback<(_: T[]) => T[]>(
      (data) => cache.readCache(sort, direction, data),
      [cache, sort, direction]
    );

    const state = React.useMemo(() => ({ sort, direction }), [sort, direction]);

    const func = React.useMemo(() => ({ setSort, setDirection }), [setDirection, setSort]);

    const misc = React.useMemo(
      () => ({
        sortOptions: Object.keys(comparators) as Array<StringKey<Config<T>["comparators"]>>,
      }),
      []
    );

    return {
      transformer,
      state,
      func,
      misc,
    };
  };
}

import React from "react";
import {
  CoreReturn,
  CoreOption,
  Plugin,
  TShape,
  Transformer,
  CombinedPlugins,
  Dispatch,
  PluginDispatches,
  PluginDispatch,
  PluginDispatchFunction,
  PluginTransformer,
  Misc,
  State,
} from "./types";
import { Cache } from "./cache";

// Main hook

export function useTable<T extends TShape, P extends readonly Plugin<T>[]>(option: CoreOption<T, P>): CoreReturn<T, P> {
  // List of provided plugins.
  const plugins = React.useMemo(() => (option.plugins ?? []) as readonly [...P], [option.plugins]);

  const data = option.data;
  const cache = React.useMemo(() => new Cache(data), [data]);
  const [latestTf, setLatestTf] = React.useState<number | null>(null);

  // Transformer

  /** Array of `{ key: string; transformer: (data: T[]) => T[]; }` */
  const transformer = React.useMemo(
    () => createTfChain(combinePlugins<T, P>(plugins, "transformer") as Transformer<T, P>),
    [plugins]
  );

  /** Calculate TF result */
  const calcTfResult = React.useCallback(
    (key?: keyof Transformer<T, P>) => {
      const from = Math.max(
        0,
        transformer.findIndex((i) => i.key === key)
      );

      let res = cache.get(from);

      transformer.slice(from).forEach(({ fn }, index) => {
        if (index !== 0) cache.set(from + index, res);
        // A transformer must NOT mutate the passed array.
        res = fn(res);
      });

      setLatestTf(Date.now());

      return res;
    },
    [cache, transformer]
  );

  /** Calculate TF result & update table and states. */
  const tf = React.useCallback(
    (key?: keyof Transformer<T, P>) => {
      const res = calcTfResult(key);
      setTable(res);
      setLatestTf(Date.now());
    },
    [calcTfResult]
  );

  // State

  /** When the state changes:
   * - The table is recalculated (starting from the specified point by the exporting plugin.)
   * - The hook synchronizes all subscribed state information. (TODO: sync relevant states only)
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const state = React.useMemo(() => combinePlugins<T, P>(plugins, "state") as State<T, P>, [plugins, tf, latestTf]);

  const dispatch = React.useMemo(() => {
    return plugins.reduce(
      (acc, plugin) => ({ ...acc, ...wrapPluginDispatch<T, P>(plugin.exports.dispatch, tf) }),
      {}
    ) as Dispatch<T, P>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugins, tf, latestTf]);

  // Misc
  const misc = React.useMemo(() => combinePlugins<T, P>(plugins, "misc") as Misc<T, P>, [plugins]);

  // Table

  const initialResult = React.useMemo(() => calcTfResult(), [calcTfResult]);
  const [table, setTable] = React.useState<T[]>(initialResult);

  // Return

  return { state, dispatch, misc, tf, table };
}

// Helpers

function combinePlugins<T extends TShape, P extends readonly Plugin<T>[]>(
  plugins: readonly [...P],
  key: "state" | "transformer" | "misc"
): CombinedPlugins<T, P>[typeof key] {
  return plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.exports[key] }), {}) as CombinedPlugins<T, P>[typeof key];
}

function createTfChain<T extends TShape, P extends readonly Plugin<T>[]>(
  transformer: Transformer<T, P>
): { key: string; fn: PluginTransformer<T>["fn"] }[] {
  const temp = Object.entries(transformer).map(([key, { fn, priority = Infinity }], index) => ({
    key,
    fn,
    priority,
    index,
  }));

  temp.sort((a, b) => (a.priority !== b.priority ? a.priority - b.priority : a.index - b.index));

  return temp.map(({ key, fn }) => ({ key, fn }));
}

function wrapPluginDispatch<T extends TShape, P extends readonly Plugin<T>[]>(
  dispatch: PluginDispatches,
  tf: (key?: keyof Transformer<T, P>) => void
): Record<string, PluginDispatchFunction> {
  return Object.entries(dispatch).reduce((acc, [key, dispatchFn]) => {
    acc[key] = tfAttachedDispatch<T, P>(tf, dispatchFn);
    return acc;
  }, {} as Record<string, PluginDispatchFunction>);
}

function tfAttachedDispatch<T extends TShape, P extends readonly Plugin<T>[]>(
  tf: (key?: keyof Transformer<T, P>) => void,
  dispatchFn: PluginDispatch
): (...args: [...Parameters<(typeof dispatchFn)[0]>]) => void {
  const [func, key] = dispatchFn;

  if (!key) return func;

  return (...args: [...Parameters<typeof func>]): void => {
    func(...args);
    tf(key);
  };
}

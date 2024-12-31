import React from "react";
import {
  Plugin,
  HookOption,
  HookReturn,
  TShape,
  CombineState,
  CombineFunc,
  CombineMisc,
  CombineTransformer,
  Transformer,
  PluginState,
  CombinePlugin,
} from "./types";
import { useTableStore } from "../store/store";
import { Cache } from "./cache";

// Main hook

export function useTable<T extends TShape, P extends readonly Plugin<T>[]>(option: HookOption<T, P>): HookReturn<T, P> {
  // List of provided plugins.
  const plugins = React.useMemo(() => (option.plugins ?? []) as readonly [...P], [option.plugins]);

  const data = useTableStore<T, T[]>((state) => state.data);
  const [cache] = React.useState(new Cache(data));
  const [latestTf, setLatestTf] = React.useState<number | null>(null);

  // Transformer

  /** Array of `{ key: string; transformer: (data: T[]) => T[]; }` */
  const transformer = React.useMemo(
    () => createTfChain(combinePlugins<T, P>(plugins, "transformer") as CombineTransformer<T, P>),
    [plugins]
  );

  /** Calculate TF result */
  const calcTfResult = React.useCallback(
    (key?: keyof CombineTransformer<T, P>) => {
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

      return res;
    },
    [cache, transformer]
  );

  /** Calculate TF result & update table and states. */
  const tf = React.useCallback(
    (key?: keyof CombineTransformer<T, P>) => {
      const res = calcTfResult(key);
      setTable(res);
      setLatestTf(Date.now());
    },
    [calcTfResult]
  );

  // State

  /** When the state changes:
   * - The table is recalculated (starting from the specified point by the exporting plugin).
   * - The hook synchronizes all subscribed state information. (TODO: sync relevant states only)
   */
  const state = React.useMemo(() => {
    return plugins.reduce(
      (acc, plugin) => ({ ...acc, ...wrapPluginState<T, P>(plugin.exports.state, tf) }),
      {} as CombineState<T, P>
    );
  }, [plugins, tf]);

  // Func & Misc

  const func = React.useMemo(() => combinePlugins<T, P>(plugins, "func") as CombineFunc<T, P>, [plugins]);
  const misc = React.useMemo(() => combinePlugins<T, P>(plugins, "misc") as CombineMisc<T, P>, [plugins]);

  // Table

  const [table, setTable] = React.useState<T[]>(calcTfResult());

  // Return

  return { state, func, misc, tf, table };
}

// Helpers

function combinePlugins<T extends TShape, P extends readonly Plugin<T>[]>(
  plugins: readonly [...P],
  key: "transformer" | "func" | "misc"
): CombinePlugin<T, P>[typeof key] {
  return plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.exports[key] }), {} as CombinePlugin<T, P>[typeof key]);
}

function createTfChain<T extends TShape, P extends readonly Plugin<T>[]>(
  transformer: CombineTransformer<T, P>
): { key: string; fn: Transformer<T>["fn"] }[] {
  const temp = Object.entries(transformer).map(([key, { fn, priority = Infinity }], index) => ({
    key,
    fn,
    priority,
    index,
  }));

  temp.sort((a, b) => (a.priority !== b.priority ? a.priority - b.priority : a.index - b.index));

  return temp.map(({ key, fn }) => ({ key, fn }));
}

function wrapPluginState<T extends TShape, P extends readonly Plugin<T>[]>(
  state: PluginState,
  tf: (key?: keyof CombineTransformer<T, P>) => void
) {
  return Object.entries(state || {}).reduce((stateAcc, [key, s]) => {
    stateAcc[key] = wrapState(tf, s);
    return stateAcc;
  }, {} as PluginState);
}

function wrapState<T extends TShape, P extends readonly Plugin<T>[]>(
  tf: (key?: keyof CombineTransformer<T, P>) => void,
  state: PluginState[string]
) {
  const [value, dispatch, key] = state;

  if (!key) return [value, dispatch] as const;

  return [
    value,
    (...args: [...Parameters<typeof dispatch>]): void => {
      dispatch(...args);
      tf(key);
    },
  ] as const;
}

import React from "react";
import { useTableStore } from "../store/store";
import { CombineFunc, CombineMisc, CombineState, HookOption, HookReturn, PluginFactory, TShape } from "./types";

/** Main hook.\
 * IMPORTANT: **NEVER** mutate the plugins array. */
export function useTable<T extends TShape, P extends readonly PluginFactory<T>[]>(
  option: HookOption<T, P>
): HookReturn<T, P> {
  const { plugins } = option;

  const pluginRes = (plugins ?? []).map((plugin) => plugin());
  const data = useTableStore<T, T[]>((state) => state.data);

  /** TODO: 가능하면 최적화 */
  const state = React.useMemo(
    () => pluginRes.reduce((res, i) => ({ ...res, ...i.state }), {}) as CombineState<T, P>,
    [pluginRes]
  );
  const func = React.useMemo(
    () => pluginRes.reduce((res, i) => ({ ...res, ...i.func }), {}) as CombineFunc<T, P>,
    [pluginRes]
  );
  const misc = React.useMemo(
    () => pluginRes.reduce((res, i) => ({ ...res, ...i.misc }), {}) as CombineMisc<T, P>,
    [pluginRes]
  );

  /** TODO:
   *  1. Dependency graph나 Priority 등 시스템을 하나 정해 불필요한 transform 스킵
   *  2. 한 플러그인이 여러 transformer를 export할 수 있게 함 */
  const table = React.useMemo(() => {
    return pluginRes.reduce((res, i) => i.transformer(res), data);
  }, [data, pluginRes]);

  return {
    table,
    state,
    func,
    misc,
  };
}

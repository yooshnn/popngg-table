// TABLE SHAPE DEFINITIONS

import { UnionToIntersection } from "../util/types";

/** Table row (i.e. data) shape */
export type TShape = Record<string, unknown>;

// CORE

/** Hook options */
export interface CoreOption<T extends TShape, Plugins extends readonly Plugin<T>[]> {
  data: T[];
  plugins?: readonly [...Plugins];
}

/** Hook returns */
export interface CoreReturn<T extends TShape, P extends readonly Plugin<T>[]> {
  table: T[];
  tf: (key: keyof Transformer<T, P>) => void;
  state: State<T, P>;
  dispatch: Dispatch<T, P>;
  misc: Misc<T, P>;
}

export interface CombinedPlugins<T extends TShape, P extends readonly Plugin<T>[]> {
  transformer: Transformer<T, P>;
  state: State<T, P>;
  dispatch: Dispatch<T, P>;
  misc: Misc<T, P>;
}

/** Data the core combines */
export type Transformer<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, PluginTransformer<T>> &
  UnionToIntersection<{ [Index in keyof P]: ExtractTransformer<T, P[Index]> }[number]>;
export type State<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, PluginState> &
  UnionToIntersection<{ [Index in keyof P]: P[Index] extends Plugin<T> ? ExtractState<T, P[Index]> : never }[number]>;
export type Dispatch<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, unknown> &
  UnionToIntersection<{ [Index in keyof P]: ExtractDispatch<T, P[Index]> }[number]>;
export type Misc<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, PluginMisc> &
  UnionToIntersection<{ [Index in keyof P]: ExtractMisc<T, P[Index]> }[number]>;

/** Utilities to extract each field from plugin exports */
export type ExtractTransformer<T extends TShape, P> = P extends Plugin<T>
  ? NonNullable<P["exports"]["transformer"]>
  : never;
export type ExtractMisc<T extends TShape, P> = P extends Plugin<T> ? NonNullable<P["exports"]["misc"]> : never;
export type ExtractState<T extends TShape, P> = P extends Plugin<T> ? NonNullable<P["exports"]["state"]> : never;
export type ExtractDispatch<T extends TShape, P> = P extends Plugin<T>
  ? NonNullable<{
      [K in keyof P["exports"]["dispatch"]]: P["exports"]["dispatch"][K][0];
    }>
  : never;

// PLUGIN

/** A valid interface for a popngg table plugin. */
export abstract class Plugin<T extends TShape> {
  public abstract get exports(): {
    transformer: PluginTransformers<T>;
    state: PluginStates;
    dispatch: PluginDispatches;
    misc: PluginMiscs;
  };
}

/** Transformers are prioritized by their id. */
export type PluginTransformers<T extends TShape> = Record<string, PluginTransformer<T>>;
export type PluginStates = Record<string, unknown>;
export type PluginDispatches = Record<string, PluginDispatch>;
export type PluginMiscs = Record<string, unknown>;

export type PluginTransformer<T extends TShape> = { priority?: number; fn: (data: T[]) => T[] };
export type PluginState = unknown;
export type PluginDispatch = readonly [PluginDispatchFunction, string?];
export type PluginMisc = unknown;

export type PluginDispatchFunction = (...args: never[]) => unknown;

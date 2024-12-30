// TABLE SHAPE DEFINITIONS

/** Table row (i.e. data) shape */
export type TShape = Record<string, unknown>;

// CORE

/** Hook options */
export interface HookOption<T extends TShape, Plugins extends readonly Plugin<T>[]> {
  plugins?: readonly [...Plugins];
}

/** Hook returns */
export interface HookReturn<T extends TShape, P extends readonly Plugin<T>[]> {
  table: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tf: (key: keyof CombineTransformer<T, P>, cb?: (...args: any[]) => any, ...rest: any[]) => void;
  state: CombineState<T, P>;
  func: CombineFunc<T, P>;
  misc: CombineMisc<T, P>;
}

export interface CombinePlugin<T extends TShape, P extends readonly Plugin<T>[]> {
  transformer: CombineTransformer<T, P>;
  state: CombineState<T, P>;
  func: CombineFunc<T, P>;
  misc: CombineMisc<T, P>;
}

/** Combine data */
export type CombineTransformer<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, Transformer<T>> &
  UnionToIntersection<
    { [Index in keyof P]: P[Index] extends Plugin<T> ? ExtractTransformer<T, P[Index]> : never }[number]
  >;
export type CombineState<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, [unknown, () => void]> &
  UnionToIntersection<{ [Index in keyof P]: P[Index] extends Plugin<T> ? ExtractState<T, P[Index]> : never }[number]>;
export type CombineFunc<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, unknown> &
  UnionToIntersection<{ [Index in keyof P]: P[Index] extends Plugin<T> ? ExtractFunc<T, P[Index]> : never }[number]>;
export type CombineMisc<T extends TShape, P extends readonly Plugin<T>[]> = Record<string, unknown> &
  UnionToIntersection<{ [Index in keyof P]: P[Index] extends Plugin<T> ? ExtractMisc<T, P[Index]> : never }[number]>;

/** Extract expose */
export type ExtractTransformer<T extends TShape, P> = P extends Plugin<T>
  ? NonNullable<P["exports"]["transformer"]>
  : never;
export type ExtractState<T extends TShape, P> = P extends Plugin<T> ? NonNullable<P["exports"]["state"]> : never;
export type ExtractFunc<T extends TShape, P> = P extends Plugin<T> ? NonNullable<P["exports"]["func"]> : never;
export type ExtractMisc<T extends TShape, P> = P extends Plugin<T> ? NonNullable<P["exports"]["misc"]> : never;

// PLUGIN

/** A valid interface for a popngg table plugin. */
export abstract class Plugin<T extends TShape> {
  public abstract get exports(): {
    transformer: PluginTransformer<T>;
    state: PluginState;
    func: PluginFunc;
    misc: PluginMisc;
  };
}

/** Transformers are prioritized by their id. */
export type PluginTransformer<T extends TShape> = Record<string, Transformer<T>>;
export type PluginState = Record<string, readonly [unknown, (arg: never) => void, string?]>;
export type PluginFunc = Record<string, (...args: never[]) => unknown>;
export type PluginMisc = Record<string, unknown>;

export type Transformer<T extends TShape> = { priority?: number; fn: (data: T[]) => T[] };

// UTIL

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export type StringKey<T> = Extract<keyof T, string>;

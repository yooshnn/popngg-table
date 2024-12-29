// TABLE SHAPE DEFINITIONS

/** Table row (i.e. data) shape */
export type TShape = Record<string, unknown>;

/** Table column definition */
export interface Column<T> {
  title: string;
  compareFn?: CompareFn<T>;
}

/** Collection of table column definitions */
export type Columns<T extends TShape> = {
  [id in keyof T]: Column<T[id]>;
};

// CORE

/** Hook options */
export interface HookOption<T extends TShape, Plugins extends readonly PluginFactory<T>[]> {
  plugins?: readonly [...Plugins];
}

/** Hook returns */
export interface HookReturn<T extends TShape, P extends readonly PluginFactory<T>[]> {
  table: T[];
  state: CombineState<T, P>;
  func: CombineFunc<T, P>;
  misc: CombineMisc<T, P>;
}

/** Combine data */
export type CombineState<T extends TShape, P extends readonly PluginFactory<T>[]> = UnionToIntersection<
  {
    [Index in keyof P]: P[Index] extends PluginFactory<T> ? ExtractState<T, ReturnType<P[Index]>> : never;
  }[number]
>;
export type CombineFunc<T extends TShape, P extends readonly PluginFactory<T>[]> = UnionToIntersection<
  {
    [Index in keyof P]: P[Index] extends PluginFactory<T> ? ExtractFunc<T, ReturnType<P[Index]>> : never;
  }[number]
>;
export type CombineMisc<T extends TShape, P extends readonly PluginFactory<T>[]> = UnionToIntersection<
  {
    [Index in keyof P]: P[Index] extends PluginFactory<T> ? ExtractMisc<T, ReturnType<P[Index]>> : never;
  }[number]
>;

/** Extract expose */
export type ExtractState<T extends TShape, P> = P extends PluginResult<T> ? NonNullable<P["state"]> : never;
export type ExtractFunc<T extends TShape, P> = P extends PluginResult<T> ? NonNullable<P["func"]> : never;
export type ExtractMisc<T extends TShape, P> = P extends PluginResult<T> ? NonNullable<P["misc"]> : never;

/** Function to compare two values from the same column */
type CompareFn<T> = (i: T, j: T) => number;

// PLUGIN

/** Plugin factory function */
export type PluginFactory<T extends TShape, R extends PluginResult<T> = PluginResult<T>> = () => PluginResult<
  T,
  R["state"],
  R["func"],
  R["misc"]
>;

/** A valid interface for a popngg table plugin. */
export interface PluginResult<
  T extends TShape,
  S extends PluginState = PluginState,
  F extends PluginFunc = PluginFunc,
  M extends PluginMisc = PluginMisc
> {
  transformer: PluginTransformer<T>;
  state?: S;
  func?: F;
  misc?: M;
}

export type PluginTransformer<T extends TShape> = (data: T[]) => T[];
export type PluginState = Record<string, unknown> | undefined;
export type PluginFunc = Record<string, (...args: never[]) => unknown> | undefined;
export type PluginMisc = Record<string, unknown> | undefined;

// UTIL

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export type StringKey<T> = Extract<keyof T, string>;

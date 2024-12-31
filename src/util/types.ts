export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export type StringKey<T> = Extract<keyof T, string>;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

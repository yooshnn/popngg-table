import { z } from "zod";

export type Primitives = string | number | boolean | undefined;
export type Encodable = Primitives | Array<Primitives>;
export type EncodableRecord = Record<string, Encodable>;

export type EncodableValue = string | number | Array<string> | Array<number>;
export type EncodableState = Record<string, EncodableValue>;

export type GetStateUrlOption = Record<string, (value: string) => unknown>;
export type GetStateUrlReturn<Request extends GetStateUrlOption> = {
  [Key in keyof Request]: ReturnType<Request[Key]> | undefined;
};

export type StateUrlConfig<T extends Encodable> = {
  key: string;
  parse: (data: unknown, params?: Partial<z.ParseParams>) => T;
  fb: T;
};

export type ReducerUrlConfig<T extends EncodableRecord> = {
  [key in keyof T]: {
    key?: string;
    parse: (data: unknown, params?: Partial<z.ParseParams>) => T[key];
    fb: T[key];
  };
};

export type MakeStateUrlOption =
  | { state: { key: string; value: Encodable }; states?: undefined }
  | { state?: undefined; states: { key: string; value: Encodable }[] };

export type StateUrl<T extends Encodable> = {
  value: T;
  updateUrl: (oldState: T, newState: T) => void;
};

// null: 필드의 값을 비움 (e.g. 최대 팝클 = 제한 없음)
// undefined: 정의할 수 없음 (e.g. parser fails)

import { Encodable, EncodableRecord } from "./types";

// UTILITY

/** Encode state for URL. */
const URLEncoder = (value: Encodable): string | null => {
  const type = typeof value;

  if (type === "string") return encodeURIComponent(value as string);
  if (type === "number" || type === "boolean") return `${value}`;
  if (Array.isArray(value)) return value.map((i) => URLEncoder(i)).toString();
  return null;
};

export type StateUrlConfig<T extends Encodable> = {
  key: string;
  parser: (fromUrl: string) => T | undefined;
  fb: T;
};

export type ReducerUrlConfig<T extends EncodableRecord> = {
  [key in keyof T]: {
    key: string;
    parser: (fromUrl: string) => T[key] | undefined;
    fb: T[key];
  };
};

type MakeStateUrlOption =
  | { state: { key: string; value: Encodable }; states?: undefined }
  | { state?: undefined; states: { key: string; value: Encodable }[] };

export function makeStateUrl({ state, states }: MakeStateUrlOption) {
  const url = new URL(window.location.toString());
  const searchParams = new URLSearchParams(url.search);

  const register = ({ key, value }: { key: string; value: Encodable }) => {
    const encoded = URLEncoder(value);
    if (encoded) searchParams.set(key, encoded);
  };

  if (state) register(state);
  if (states) states.forEach((state) => register(state));

  return `${url.origin}${url.pathname}?${searchParams.toString()}`;
}

function parseStateUrl<T extends Encodable>(config: StateUrlConfig<T>): T {
  const url = new URL(window.location.toString());
  const searchParams = new URLSearchParams(url.search);

  const { key, parser, fb } = config;

  const fromUrl = searchParams.get(key);
  const parsed = fromUrl ? parser(fromUrl) : undefined;
  const safe = typeof parsed === "undefined" ? fb : parsed;

  return safe;
}

function parseReducerUrl<T extends EncodableRecord>(config: ReducerUrlConfig<T>): T {
  const url = new URL(window.location.toString());
  const searchParams = new URLSearchParams(url.search);

  return Object.entries(config).reduce((acc, [id, { key, parser, fb }]) => {
    const fromUrl = searchParams.get(key);
    const parsed = fromUrl ? parser(fromUrl) : undefined;
    const safe = typeof parsed === "undefined" ? fb : parsed;

    return {
      ...acc,
      [id]: safe,
    };
  }, {}) as T;
}

export type StateUrl<T extends Encodable> = {
  value: T;
  updateUrl: (oldState: T, newState: T) => void;
};

export function stateUrl<T extends Encodable>(config: StateUrlConfig<T>): StateUrl<T> {
  return {
    value: parseStateUrl(config),
    updateUrl: (oldState: T, newState: T) => {
      if (oldState === newState) return;
      const newUrl = makeStateUrl({ state: { key: config.key, value: newState } });
      window.history.replaceState({ path: newUrl }, "", newUrl);
    },
  };
}

export function reducerUrl<T extends EncodableRecord>(config: ReducerUrlConfig<T>) {
  return {
    value: parseReducerUrl(config),
    updateUrl: (oldState: T, newState: T) => {
      const newUrl = makeStateUrl({
        states: Object.values(config)
          .filter((i) => oldState[i.key] !== newState[i.key])
          .map((i) => ({ key: i.key, value: newState[i.key] })),
      });
      window.history.replaceState({ path: newUrl }, "", newUrl);
    },
  };
}

import { Encodable, EncodableRecord, MakeStateUrlOption, ReducerUrlConfig, StateUrl, StateUrlConfig } from "./types";

// Main functions to use

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
      const states = Object.entries(config)
        .filter(([key, i]) => oldState[i.key ?? key] !== newState[i.key ?? key])
        .map(([key, i]) => ({ key: i.key ?? key, value: newState[i.key ?? key] }));
      const newUrl = makeStateUrl({ states });
      window.history.replaceState({ path: newUrl }, "", newUrl);
    },
  };
}

// Utility

function URLEncoder(value: Encodable): string | null {
  const type = typeof value;

  if (type === "string") return encodeURIComponent(value as string);
  if (type === "number" || type === "boolean") return `${value}`;
  if (Array.isArray(value)) return value.map((i) => URLEncoder(i)).toString();
  return null;
}

function makeStateUrl({ state, states }: MakeStateUrlOption) {
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

  const { key, parse, fb } = config;

  try {
    return parse(searchParams.get(key));
  } catch {
    return fb;
  }
}

function parseReducerUrl<T extends EncodableRecord>(config: ReducerUrlConfig<T>): T {
  const url = new URL(window.location.toString());
  const searchParams = new URLSearchParams(url.search);

  type Entries<T> = {
    [K in keyof T]: [K, T[K]];
  }[keyof T][];

  return (Object.entries(config) as Entries<ReducerUrlConfig<T>>).reduce((acc, [id, { key, parse, fb }]) => {
    const fromUrl = searchParams.get(key ?? String(id));
    try {
      return { ...acc, [id]: parse(fromUrl) };
    } catch {
      return { ...acc, [id]: fb };
    }
  }, {} as T);
}

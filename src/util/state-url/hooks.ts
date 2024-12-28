import React from "react";

// null: 필드의 값을 비움 (e.g. 최대 팝클 = 제한 없음)
// undefined: 정의할 수 없음 (e.g. parser fails)

type Primitives = string | number | boolean | null;
type Encodable = Primitives | Array<Primitives>;

// UTILITY

/** Encode state for URL. */
const URLEncoder = (value: Encodable): string | null => {
  const type = typeof value;

  if (type === "string") return encodeURIComponent(value as string);
  if (type === "number" || type === "boolean") return `${value}`;
  if (Array.isArray(value)) return value.map((i) => URLEncoder(i)).toString();
  return null;
};

type StateUrlConfig<T extends Encodable> = {
  key: string;
  parser: (fromUrl: string) => T | undefined;
  fb: T;
};

type ReducerUrlConfig<T extends EncodableRecord> = {
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

function usePrevState<T>(state: T, initialState: T) {
  const ref = React.useRef(initialState);
  React.useEffect(() => {
    ref.current = state;
  });
  return ref.current;
}

export function useStateUrl<T extends Encodable>(
  config: StateUrlConfig<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [init] = React.useState(parseStateUrl(config));

  const [state, setState] = React.useState<T>(init);
  const prevState = usePrevState<T>(state, init);

  React.useEffect(() => {
    if (state === prevState) return;
    const newUrl = makeStateUrl({ state: { key: config.key, value: state } });
    window.history.pushState({ path: newUrl }, "", newUrl);
  }, [state, prevState, config.key]);

  return [state, setState];
}

type EncodableRecord = Record<string, Encodable>;

export function useReducerUrl<T extends EncodableRecord, P>(
  reducer: (state: T, payload: P) => T,
  config: ReducerUrlConfig<T>
): [T, React.Dispatch<P>] {
  const [init] = React.useState(parseReducerUrl(config));

  const [state, dispatch] = React.useReducer<React.Reducer<T, P>>(reducer, init);
  const prevState = usePrevState<T>(state, init);

  React.useEffect(() => {
    if (state === prevState) return;
    const newUrl = makeStateUrl({ states: Object.values(config).map((i) => ({ key: i.key, value: state[i.key] })) });
    window.history.pushState({ path: newUrl }, "", newUrl);
  }, [config, prevState, state]);

  return [state, dispatch];
}

export type EncodableValue = string | number | Array<string> | Array<number>;
export type EncodableState = Record<string, EncodableValue>;

export type GetStateUrlOption = Record<string, (value: string) => unknown>;
export type GetStateUrlReturn<Request extends GetStateUrlOption> = {
  [Key in keyof Request]: ReturnType<Request[Key]> | undefined;
};

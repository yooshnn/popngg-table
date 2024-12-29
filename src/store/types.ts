import { TShape } from "../core/types";

export type TableState<T extends TShape> = {
  data: T[];
};

export type TableProviderInitializer<T extends TShape> = Pick<TableState<T>, "data">;

import { Columns, TShape } from "../core/types";

export type TableState<T extends TShape> = {
  data: T[];
  columns: Columns<T>;
};

export type TableProviderInitializer<T extends TShape> = Pick<TableState<T>, "data" | "columns">;

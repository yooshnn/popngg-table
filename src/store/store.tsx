import React from "react";
import { createStore, StoreApi, useStore } from "zustand";
import { TableProviderInitializer, TableState } from "./types";
import { TShape } from "../core/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TableContext = React.createContext<StoreApi<TableState<any>>>(undefined as any);

export function TableProvider<T extends TShape>({
  children,
  data,
}: React.PropsWithChildren<TableProviderInitializer<T>>) {
  const [store] = React.useState(() => createStore<TableState<T>>((/* set */) => ({ data })));

  return <TableContext.Provider value={store}>{children}</TableContext.Provider>;
}

export function useTableStore<T extends TShape, U>(selector: (state: TableState<T>) => U): U {
  const context = React.useContext(TableContext);
  if (!context) throw new Error("Invalid use of useTableStore.");
  return useStore(context, selector);
}

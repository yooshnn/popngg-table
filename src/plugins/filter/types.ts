import { TShape } from "../../core/types";
import { EncodableRecord, ReducerUrlConfig } from "../../util/state-url";

export type JudgeFn<T extends TShape> = (row: T) => boolean;
export type Query = EncodableRecord;

export type MakeJudgeFn<T extends TShape, Q extends Query> = (query: Q) => JudgeFn<T>;

export interface Config<T extends TShape, Q extends Query> {
  makeJudgeFn: MakeJudgeFn<T, Q>;
  queryConfig: ReducerUrlConfig<Q>;
}

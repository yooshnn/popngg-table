import { Plugin, TShape } from "../../core/types";
import { reducerUrl } from "../../util/state-url";
import { Config, MakeJudgeFn, Query } from "./types";

export class PlugFilter<T extends TShape, Q extends Query> extends Plugin<T> {
  // State
  private query: Q;
  private setQuery: (arg: Q) => void;

  // Transformer
  private tfFilter = {
    priority: -1,
    fn: (data: T[]) => data.filter(this.makeJudgeFn(this.query)),
  };

  // Internal use
  private makeJudgeFn: MakeJudgeFn<T, Q>;

  // Constructor
  constructor({ makeJudgeFn, queryConfig }: Config<T, Q>) {
    super();

    const query = reducerUrl<Q>(queryConfig);

    this.query = query.value;
    this.setQuery = (newQuery) => {
      query.updateUrl(this.query, newQuery);
      this.query = newQuery;
    };

    this.makeJudgeFn = makeJudgeFn;
  }

  // Export
  public get exports() {
    return {
      transformer: {
        tfFilter: this.tfFilter,
      },
      state: {
        query: this.query,
      },
      dispatch: {
        setQuery: [this.setQuery, "tfFilter"] as const,
      },
      misc: {},
    };
  }
}

import { z } from "zod";
import { PlugFilter } from "../plugins/filter";
import { PlugSort } from "../plugins/sort";
import { ReducerUrlConfig } from "../plugins/util/state-url";
import { parseOptionalArray } from "../plugins/util/state-url/utils";

// SCHEMA

/** Define your data. */
export const SampleSchema = z.object({
  id: z.number(),
  team: z.object({ leader: z.string(), teammate: z.string() }),
  power: z.number(),
  types: z.array(z.string()),
});

export type Sample = z.infer<typeof SampleSchema>;

/** Define query. */
export const QuerySchema = z.object({
  power: z.tuple([z.coerce.number().optional(), z.coerce.number().optional()]),
});

export type Query = z.infer<typeof QuerySchema>;

const queryConfig: ReducerUrlConfig<Query> = {
  power: {
    parse: parseOptionalArray(QuerySchema.shape.power),
    fb: [undefined, undefined],
  },
};

// PLUGIN

export const plugSort = new PlugSort<Sample>({
  comparators: {
    id: (a, b) => (a.id < b.id ? -1 : 1),
    power: (a, b) => (a.power < b.power ? -1 : 1),
    leader: (a, b) => {
      if (a.team.leader !== b.team.leader) return a.team.leader < b.team.leader ? -1 : 1;
      return a.id < b.id ? -1 : 1;
    },
  },
  fallback: { sort: "id", direction: "asc" },
});

export const plugFilter = new PlugFilter<Sample, Query>({
  makeJudgeFn: (query) => {
    return (row) => (query.power[0] ?? 0) <= row.power && row.power <= (query.power[1] ?? Infinity);
  },
  queryConfig,
});

import React from "react";
import { useTable } from "../core/core";
import { PlugSort } from "../plugins/sort";
import { TableProvider } from "../store/store";
import { data } from "./data";
import { PlugFilter } from "../plugins/filter/main";
import { z } from "zod";

type MyShape = {
  id: number;
  team: { leader: string; teammate: string };
  power: number;
  types: string[];
};

const QuerySchema = z.object({
  power: z.tuple([z.nullable(z.coerce.number()), z.nullable(z.coerce.number())]),
});

type Query = z.infer<typeof QuerySchema>;

const FormSchema = z.object({
  power: z.tuple([z.coerce.string(), z.coerce.string()]),
});

type Form = z.infer<typeof FormSchema>;

const initialForm: Form = {
  power: ["", ""],
};

type FormAction = { type: "SET_MIN_POWER"; payload: string } | { type: "SET_MAX_POWER"; payload: string };

const formReducer = (state: Form, action: FormAction): Form => {
  switch (action.type) {
    case "SET_MIN_POWER":
      return { ...state, power: [action.payload, state.power[1]] };
    case "SET_MAX_POWER":
      return { ...state, power: [state.power[0], action.payload] };
    default:
      return state;
  }
};

const columns = ["#", "TEAM", "POWER", "TYPES"];

const plugins = [
  new PlugSort<MyShape>({
    comparators: {
      id: (a, b) => (a.id < b.id ? -1 : 1),
      power: (a, b) => (a.power < b.power ? -1 : 1),
      leader: (a, b) => {
        if (a.team.leader !== b.team.leader) return a.team.leader < b.team.leader ? -1 : 1;
        return a.id < b.id ? -1 : 1;
      },
    },
    fallback: { sort: "id", direction: "asc" },
  }),
  new PlugFilter<MyShape, Query>({
    makeJudgeFn: (query) => {
      return (row) => {
        return (query.power[0] ?? 0) <= row.power && row.power <= (query.power[1] ?? Infinity);
      };
    },
    queryConfig: {
      power: {
        key: "power",
        parser: (fromUrl) => {
          const arr: (string | null)[] = fromUrl.split(",");
          console.log(arr);
          const result = z.tuple([z.coerce.number().min(0), z.coerce.number().max(10000)]).safeParse(arr);
          if (!result.success) return undefined;
          if (arr[0] === "") arr[0] = null;
          if (arr[1] === "") arr[1] = null;
          console.log(arr);
          return [Number(arr[0]), Number(arr[1])];
        },
        fb: [null, null],
      },
    },
  }),
];

function Table() {
  const { table, state, misc } = useTable<MyShape, typeof plugins>({ plugins });

  // sort
  const [sort, setSort] = state.sort;
  const [direction, setDirection] = state.direction;

  // filter
  const [query, setQuery] = state.query;
  const [filter, setFilter] = React.useReducer(formReducer, FormSchema.parse(query));

  const filterSchema = z.object({
    power: z.tuple([z.coerce.number(), z.coerce.number()]),
  });

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = QuerySchema.safeParse(filter);
    if (result.success) {
      if (filter.power[0] === "") result.data.power[0] = null;
      if (filter.power[1] === "") result.data.power[1] = null;
      setQuery(result.data);
    }
  };

  const Sort = (
    <>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        {misc.options.map((i) => (
          <option key={i} value={i} label={i} />
        ))}
      </select>
      <button onClick={() => setDirection(direction === "asc" ? "desc" : "asc")}>{direction}</button>
    </>
  );

  const Filter = (
    <form onSubmit={submitHandler}>
      <input
        value={filter.power[0] ?? ""}
        onChange={(e) => setFilter({ type: "SET_MIN_POWER", payload: e.target.value })}
        placeholder="power min"
      />
      <input
        value={filter.power[1] ?? ""}
        onChange={(e) => setFilter({ type: "SET_MAX_POWER", payload: e.target.value })}
        placeholder="power max"
      />
      <button type="submit">Submit</button>
    </form>
  );

  const Table = (
    <>
      <caption>sample table</caption>
      <thead>
        <tr>
          {Object.values(columns).map((i) => (
            <th key={i}>{i}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.slice(0, 50).map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>
              {row.team.leader} &amp; {row.team.teammate}
            </td>
            <td>{row.power}</td>
            <td>{row.types.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </>
  );

  return (
    <div>
      <section>{Sort}</section>
      <section>{Filter}</section>
      <table>{Table}</table>
    </div>
  );
}

function App() {
  return (
    <TableProvider<MyShape> data={data}>
      <Table />
    </TableProvider>
  );
}

export default App;

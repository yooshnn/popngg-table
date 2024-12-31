import { useTable } from "../core/core";
import { TableProvider } from "../store/store";
import { data } from "./data";
import { useForm } from "react-hook-form";
import { plugFilter, plugSort, Query, QuerySchema, Sample } from "./config";
import { zodResolver } from "@hookform/resolvers/zod";

const columns = ["#", "TEAM", "POWER", "TYPES"];

const plugins = [plugSort, plugFilter];

function Table() {
  const { table, state, misc } = useTable<Sample, typeof plugins>({ plugins });

  // sort
  const [sort, setSort] = state.sort;
  const [direction, setDirection] = state.direction;

  // filter
  const [query, setQuery] = state.query;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Query>({
    resolver: zodResolver(QuerySchema),
    defaultValues: query,
  });

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
    <form onSubmit={handleSubmit(setQuery)}>
      <div>
        <label>Min Power</label>
        <input type="string" {...register("power.0", { setValueAs: (v) => (v === "" ? undefined : parseInt(v)) })} />
        {errors.power?.[0] && <p>{errors.power[0]?.message}</p>}
      </div>
      <div>
        <label>Max Power</label>
        <input type="string" {...register("power.1", { setValueAs: (v) => (v === "" ? undefined : parseInt(v)) })} />
        {errors.power?.[1] && <p>{errors.power[1]?.message}</p>}
      </div>
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
    <TableProvider<Sample> data={data}>
      <Table />
    </TableProvider>
  );
}

export default App;

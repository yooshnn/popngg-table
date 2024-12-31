import { useTable } from "../core/core";
import { useForm } from "react-hook-form";
import { plugFilter, plugSort, Query, QuerySchema, Sample } from "./config";
import { zodResolver } from "@hookform/resolvers/zod";
import { data } from "./data";

const columns = ["#", "TEAM", "POWER", "TYPES"];

const plugins = [plugSort, plugFilter];

function App() {
  const { table, state, misc } = useTable<Sample, typeof plugins>({ data, plugins });

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
    <div className="sort">
      <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
        {misc.options.map((i) => (
          <option key={i} value={i} label={i} />
        ))}
      </select>
      <button className="sort-button" onClick={() => setDirection(direction === "asc" ? "desc" : "asc")}>
        {direction}
      </button>
    </div>
  );

  const Filter = (
    <form className="filter-form" onSubmit={handleSubmit(setQuery)}>
      <div className="filter-group">
        <label className="filter-label">Min Power</label>
        <input
          className="filter-input"
          type="string"
          {...register("power.0", { setValueAs: (v) => (v === "" ? undefined : parseInt(v)) })}
        />
        {errors.power?.[0] && <p className="filter-error">{errors.power[0]?.message}</p>}
      </div>
      <div className="filter-group">
        <label className="filter-label">Max Power</label>
        <input
          className="filter-input"
          type="string"
          {...register("power.1", { setValueAs: (v) => (v === "" ? undefined : parseInt(v)) })}
        />
        {errors.power?.[1] && <p className="filter-error">{errors.power[1]?.message}</p>}
      </div>
      <button className="filter-submit" type="submit">
        Submit
      </button>
    </form>
  );

  const Table = (
    <>
      <caption className="table-caption">Sample Table</caption>
      <thead className="table-head">
        <tr>
          {Object.values(columns).map((i) => (
            <th key={i} className="table-header">
              {i}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="table-body">
        {table.slice(0, 50).map((row) => (
          <tr key={row.id} className="table-row">
            <td className="table-cell">{row.id}</td>
            <td className="table-cell">
              {row.team.leader} &amp; {row.team.teammate}
            </td>
            <td className="table-cell">{row.power}</td>
            <td className="table-cell">{row.types.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </>
  );

  return (
    <div className="container">
      <section className="sort-section">{Sort}</section>
      <section className="filter-section">{Filter}</section>
      <table className="table">{Table}</table>
    </div>
  );
}

export default App;

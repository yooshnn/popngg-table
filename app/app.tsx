import React from "react";

import { useTable } from "../src";
import { useForm } from "react-hook-form";
import { plugFilter, plugPage, plugSort, Query, QuerySchema, Sample } from "./config";
import { zodResolver } from "@hookform/resolvers/zod";
import { data } from "./data";

const columns = ["#", "TEAM", "POWER", "TYPES"];

const plugins = [plugSort, plugFilter, plugPage];

function App() {
  const { table, state, dispatch, misc } = useTable<Sample, typeof plugins>({ data, plugins });

  // sort
  const [sort, setSort] = [state.sort, dispatch.setSort];
  const [direction, setDirection] = [state.direction, dispatch.setDirection];

  // filter
  const [query, setQuery] = [state.query, dispatch.setQuery];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Query>({
    resolver: zodResolver(QuerySchema),
    defaultValues: query,
  });

  // page
  const [page, setPage] = [state.page, dispatch.setPage];
  const lastPage = state.lastPage;

  const Sort = (
    <div className="sort">
      <label className="sort-label">Sort</label>
      <div className="sort-form">
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          {misc.options.map((i) => (
            <option key={i} value={i} label={i} />
          ))}
        </select>
        <button className="sort-button" onClick={() => setDirection(direction === "asc" ? "desc" : "asc")}>
          {direction}
        </button>
      </div>
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

  const Page = (
    <div className="pagination">
      <span className="pagination-info">
        Page {page} of {lastPage}
      </span>
      <button className="pagination-button" onClick={() => setPage(page - 1)} disabled={page === 1}>
        &lt;
      </button>
      <button className="pagination-button" onClick={() => setPage(page + 1)} disabled={page === lastPage}>
        &gt;
      </button>
    </div>
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
      <div>{Page}</div>
    </div>
  );
}

export default App;

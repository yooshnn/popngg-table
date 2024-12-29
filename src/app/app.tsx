import React from "react";
import { useTable } from "../core/core";
import { plugSort } from "../plugins/sort";
import { TableProvider } from "../store/store";
import { data } from "./data";

type MyShape = {
  id: number;
  team: { leader: string; teammate: string };
  power: number;
  types: string[];
};

const columns = ["#", "TEAM", "POWER", "TYPES"];

function Table() {
  const [plugins] = React.useState([
    plugSort<MyShape>({
      comparators: {
        id: (a, b) => (a.id < b.id ? -1 : 1),
        power: (a, b) => (a.power < b.power ? -1 : 1),
        leader: (a, b) => {
          if (a.team.leader !== b.team.leader) return a.team.leader < b.team.leader ? -1 : 1;
          return a.id < b.id ? -1 : 1;
        },
      },
      fallback: { sort: "test", direction: "asc" },
    }),
  ]);

  const { table, state, func, misc } = useTable<MyShape, typeof plugins>({ plugins });

  const Sort = (
    <>
      <select value={state.sort} onChange={(e) => func.setSort(e.target.value as keyof MyShape)}>
        {misc.sortOptions.map((i) => (
          <option key={i} value={i} label={i} />
        ))}
      </select>
      <button onClick={() => func.setDirection(state.direction === "asc" ? "desc" : "asc")}>{state.direction}</button>
    </>
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

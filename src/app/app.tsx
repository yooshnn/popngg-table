import React from "react";
import { useTable } from "../core/core";
import { Columns } from "../core/types";
import { plugSort } from "../plugins/sort";
import { TableProvider } from "../store/store";
import { data } from "./data";

type MyShape = {
  id: number;
  team: { leader: string; teammate: string };
  power: number;
  types: string[];
};

const columns: Columns<MyShape> = {
  id: { title: "ID", sortable: true },
  team: {
    title: "Team",
    sortable: true,
    compareFn: (t1, t2) => {
      if (t1.leader !== t2.leader) return t1.leader < t2.leader ? -1 : 1;
      return t1.teammate < t2.teammate ? -1 : 1;
    },
  },
  power: { title: "Power", sortable: true },
  types: { title: "Types" },
};

function Table() {
  const [plugins] = React.useState([plugSort<MyShape>({ sort: "id", direction: "asc" })]);

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
            <th key={i.title}>{i.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.map((row) => (
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
    <TableProvider<MyShape> data={data} columns={columns}>
      <Table />
    </TableProvider>
  );
}

export default App;

import { z } from "zod";
import { Plugin, TShape } from "../../core/types";
import { stateUrl } from "../../util/state-url";
import { Config, Direction, Sort, Options } from "./types";

export class PlugSort<T extends TShape> extends Plugin<T> {
  // States
  private sort: Sort<T>;
  private direction: Direction;

  private setSort: (newSort: Sort<T>) => void;
  private setDirection: (newDirection: Direction) => void;

  // Misc
  private options: Options<T>;
  private comparators: Config<T>["comparators"];

  // Transformer
  private tfSort = {
    priority: 0,
    fn: (data: T[]) => {
      const comparator = this.comparators[this.sort];
      const direction = this.direction === "asc" ? 1 : -1;
      return data.slice().sort((a, b) => comparator(a, b) * direction);
    },
  };

  // Constructor
  constructor({ comparators, fallback }: Config<T>) {
    super();

    const sort = stateUrl<Sort<T>>({
      key: "sort",
      parse: z.enum(Object.keys(comparators) as [keyof typeof comparators]).parse,
      fb: fallback.sort,
    });

    const direction = stateUrl({
      key: "direction",
      parse: z.union([z.literal("asc"), z.literal("desc")]).parse,
      fb: fallback.direction,
    });

    this.sort = sort.value;
    this.setSort = (newSort) => {
      sort.updateUrl(this.sort, newSort);
      this.sort = newSort;
    };

    this.direction = direction.value;
    this.setDirection = (newDirection) => {
      direction.updateUrl(this.direction, newDirection);
      this.direction = newDirection;
    };

    this.options = Object.keys(comparators) as Options<T>;
    this.comparators = comparators;
  }

  // Export
  public get exports() {
    return {
      transformer: {
        tfSort: this.tfSort,
      },
      state: {
        sort: this.sort,
        direction: this.direction,
      },
      dispatch: {
        setSort: [this.setSort, "tfSort"] as const,
        setDirection: [this.setDirection, "tfSort"] as const,
      },
      misc: {
        options: this.options,
      },
    };
  }
}

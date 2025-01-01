import { z } from "zod";
import { Plugin, TShape } from "../../core/types";
import { stateUrl } from "../../util/state-url";
import { Config } from "./types";

export class PlugPage<T extends TShape> extends Plugin<T> {
  // State
  private page: number;
  private setPage: (arg: number) => void;

  private lastPage: number;
  private setLastPage: (arg: number) => void;

  // Misc
  private rowsPerPage: number;

  // Internal use
  private prevData: T[] | undefined;

  // Transformer
  private tfPage = {
    fn: (data: T[]) => {
      if (!this.prevData) {
        this.prevData = data;
      } else if (data.length !== this.prevData.length || data.some((value, index) => value !== this.prevData![index])) {
        this.setPage(1);
        this.prevData = data;
      }

      this.setLastPage(Math.ceil(data.length / this.rowsPerPage));
      return data.slice((this.page - 1) * this.rowsPerPage, this.page * this.rowsPerPage);
    },
  };

  // Constructor
  constructor({ rowsPerPage }: Config) {
    super();

    const page = stateUrl<number>({ key: "page", parse: z.coerce.number().min(1).parse, fb: 1 });

    this.page = page.value;
    this.setPage = (newPage) => {
      page.updateUrl(this.page, newPage);
      this.page = newPage;
    };

    this.lastPage = 0;
    this.setLastPage = (newLastPage) => {
      this.lastPage = newLastPage;
    };

    this.rowsPerPage = rowsPerPage;
  }

  public get exports() {
    return {
      transformer: {
        tfPage: this.tfPage,
      },
      state: {
        page: this.page,
        lastPage: this.lastPage,
      },
      dispatch: {
        setPage: [this.setPage, "tfPage"] as const,
      },
      misc: {
        rowsPerPage: this.rowsPerPage,
      },
    };
  }
}

import { z, ZodTypeAny } from "zod";
import { Encodable } from "./types";

const parseEmptyAsUndefined = (q: unknown) => (typeof q === "string" && q.trim().length !== 0 ? q : undefined);
const parseArrayInUrl = (q: unknown) => (typeof q === "string" ? q.split(",").map(parseEmptyAsUndefined) : undefined);

export function URLEncoder(value: Encodable): string | null {
  const type = typeof value;

  if (type === "string") return encodeURIComponent(value as string);
  if (type === "number" || type === "boolean") return `${value}`;
  if (Array.isArray(value)) return value.map(URLEncoder).toString();
  return null;
}

export const encodableEquals = (a: Encodable, b: Encodable) => {
  return typeof a === typeof b && URLEncoder(a) === URLEncoder(b);
};

export const parseOptionalPrimitive = <T extends ZodTypeAny>(schema: T) =>
  z.preprocess(parseEmptyAsUndefined, schema).parse;

export const parseOptionalArray = <T extends ZodTypeAny>(schema: T) => z.preprocess(parseArrayInUrl, schema).parse;

import { z, ZodTypeAny } from "zod";

const parseEmptyAsUndefined = (q: unknown) => (typeof q === "string" && q.trim().length !== 0 ? q : undefined);
const parseArrayInUrl = (q: unknown) => (typeof q === "string" ? q.split(",").map(parseEmptyAsUndefined) : undefined);

export const parseOptionalPrimitive = <T extends ZodTypeAny>(schema: T) =>
  z.preprocess(parseEmptyAsUndefined, schema).parse;

export const parseOptionalArray = <T extends ZodTypeAny>(schema: T) => z.preprocess(parseArrayInUrl, schema).parse;

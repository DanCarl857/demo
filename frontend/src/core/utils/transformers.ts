import camelcaseKeys from "camelcase-keys";
import { z } from "zod";

const RecordOrUnknown = z
  .record(z.unknown())
  .transform((data) => camelcaseKeys(data, { deep: true }))
  .or(z.unknown());

export function camelCase(data: unknown) {
  return RecordOrUnknown.parse(data);
}

export function keyToCamelCase(key: string) {
  return Object.keys(camelcaseKeys({ [key]: true })).pop();
}

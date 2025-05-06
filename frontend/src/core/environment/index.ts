import type { ZodType } from "zod";

export type EnvironmentOptions<TEnvironment> = {
  [TKey in keyof TEnvironment]: TEnvironment[TKey] | undefined;
};

export function getEnvironment<TEnvironment>(
  schema: ZodType<TEnvironment>,
  options: EnvironmentOptions<TEnvironment>,
) {
  return schema.parse(options);
}

import { createContext, type Provider, useContext } from "react";

type StrictContext<T> = [Provider<T>, () => T];

export const createStrictContext = <T>(defaultValue?: T): StrictContext<T> => {
  const context = createContext(defaultValue);

  const provider = context.Provider as Provider<T>;
  const useStrictContext = () => {
    const value = useContext(context);
    if (!value) throw new Error("Strict context accessed without provider.");
    return value;
  };

  return [provider, useStrictContext];
};

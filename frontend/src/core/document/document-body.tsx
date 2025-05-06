import { type ReactNode } from "react";
import { tv } from "tailwind-variants";

import { poppinsFont } from "@/ui/fonts";

export const documentBody = tv({
  base: [poppinsFont.className, "bg-surface", "text-neutral-12", "antialiased"],
});

interface Properties {
  children: ReactNode;
}

export function DocumentBody({ children }: Properties) {
  return (
    <body className={documentBody()}>
      {children}
    </body>
  );
}

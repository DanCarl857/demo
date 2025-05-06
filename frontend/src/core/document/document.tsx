"use client";
import type { ReactNode } from "react";

import { DocumentBody } from "./document-body";
import { DocumentHead } from "./document-head";
import { DocumentProviders } from "./document-providers";

interface Properties {
  children: ReactNode;
}

export function Document({ children }: Properties) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <DocumentHead />
      <DocumentBody>
        <DocumentProviders>{children}</DocumentProviders>
      </DocumentBody>
    </html>
  );
}

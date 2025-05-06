import "./globals.css";
import { DocumentHead } from "@/core/document/document-head";
import { DocumentBody } from "@/core/document/document-body";
import { DocumentProviders } from "@/core/document/document-providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <DocumentHead />
      <DocumentBody>
        <DocumentProviders>
          {children}
        </DocumentProviders>
      </DocumentBody>
    </html>
  );
}

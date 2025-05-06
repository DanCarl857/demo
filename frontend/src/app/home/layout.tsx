"use client";
import { Suspense } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex-1 overflow-x-hidden h-screen bg-background-1">
        {children}
      </div>
    </Suspense>
  )
}

export default Layout;

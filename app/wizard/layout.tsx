import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <main role="main" className="flex w-full flex-col items-center">
        {children}
      </main>
    </div>
  );
}

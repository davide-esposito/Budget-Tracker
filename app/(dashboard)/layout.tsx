"use client";

import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar aria-label="Main navigation bar" />
      <main className="w-full" role="main">
        {children}
      </main>
    </div>
  );
}

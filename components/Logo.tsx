import { PiggyBank } from "lucide-react";
import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="Go to home page"
    >
      <PiggyBank
        className="stroke h-11 w-11 stroke-amber-500 stroke-[1.5]"
        aria-hidden="true"
      />
      <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent">
        BudgetTracker
      </p>
    </Link>
  );
}

function LogoMobile() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="Go to home page"
    >
      <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent">
        BudgetTracker
      </p>
    </Link>
  );
}

export { Logo, LogoMobile };

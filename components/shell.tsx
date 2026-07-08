"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar/sidebar";

const AUTH_ROUTES = ["/login", "/signup"];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen">
      {!isAuth && <Sidebar />}
      <main className={`flex-1 min-h-screen ${!isAuth ? "ml-60" : ""}`}>
        {children}
      </main>
    </div>
  );
}

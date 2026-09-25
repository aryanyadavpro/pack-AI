"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Activity, ShieldCheck } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  // On chat page, hide MobileNav so the chat prompt input bar takes full ergonomic focus
  if (pathname === "/chat") {
    return null;
  }

  const navItems = [
    { href: "/chat", label: "Assistant", icon: Sparkles },
    { href: "/recommend", label: "Wizard", icon: Compass },
    { href: "/simulate", label: "Simulate", icon: Activity },
    { href: "/audit", label: "Audit", icon: ShieldCheck },
  ];

  return (
    <nav className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-sm md:hidden">
      <div className="flex items-center justify-around py-1.5 px-2 rounded-full bg-white/95 backdrop-blur-xl border border-[#E8E1D5] shadow-[0_12px_30px_-5px_rgba(20,25,40,0.12)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all min-w-[54px] ${
                isActive
                  ? "bg-[#141928] text-white shadow-xs"
                  : "text-[#546071] hover:text-[#141928] hover:bg-[#FAF7F2]"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#F7D25C]" : "text-[#8592A6]"}`} />
              <span className="text-[10px] font-bold tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

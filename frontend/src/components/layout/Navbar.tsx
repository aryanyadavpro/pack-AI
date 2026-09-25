"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Activity, Database, FileText, ChevronDown } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/chat", label: "AI Copilot", icon: Sparkles },
    { href: "/recommend", label: "Packaging Wizard", icon: Compass },
    { href: "/simulate", label: "Shelf-Life Simulator", icon: Activity },
    { href: "/audit", label: "Statutory Audit", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full iridescent-sphere shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xs">BP</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">BioPack<span className="text-emerald-600">.ai</span></span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                FSSAI 2018
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">Sustainable Food Packaging Platform</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Model Badge & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Manus-style Model Pill */}
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200/80 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>BioPack 2.5 Flash</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>

          {pathname !== "/chat" && (
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span className="hidden xs:inline">Open Chat</span>
              <span className="xs:hidden">Chat</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


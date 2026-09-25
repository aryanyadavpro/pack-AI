"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Activity, FileText } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/chat", label: "AI Assistant", icon: Sparkles },
    { href: "/recommend", label: "Packaging Wizard", icon: Compass },
    { href: "/simulate", label: "Shelf-Life Simulator", icon: Activity },
    { href: "/audit", label: "Statutory Audit", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E1D5] shadow-[0_2px_12px_-3px_rgba(20,25,40,0.03)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2A45FE] text-white shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-black text-xs tracking-wider">PC</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-[#141928]">PackCraft<span className="text-[#2A45FE]">.ai</span></span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#F7D25C]/30 px-2 py-0.5 text-[10px] font-extrabold text-[#141928] border border-[#F7D25C]">
                FSSAI 2018
              </span>
            </div>
            <p className="text-[10px] text-[#697586] hidden sm:block font-medium">Sustainable Food Packaging Platform</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white p-1 rounded-full border border-[#E8E1D5] shadow-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#141928] text-white shadow-xs"
                    : "text-[#546071] hover:text-[#141928] hover:bg-[#FAF7F2]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#F7D25C]" : "text-[#8592A6]"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Model Badge & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#141928] border border-[#E8E1D5]">
            <span className="h-2 w-2 rounded-full bg-[#1F8756]"></span>
            <span>PackCraft 2.5</span>
          </div>

          {pathname !== "/chat" && (
            <Link
              href="/chat"
              className="btn-cobalt inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">AI Assistant</span>
              <span className="xs:hidden">Chat</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

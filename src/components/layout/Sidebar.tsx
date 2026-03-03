"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  BarChart3,
  History,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    href: "/checklist",
    label: "Novo Checklist",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/historico",
    label: "Histórico",
    icon: History,
  },
  {
    href: "/configuracao",
    label: "Configuração",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "somaq-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1B0F8E] text-white h-14 flex items-center justify-between px-4 shadow-lg">
        <button
          onClick={() => setOpen(true)}
          className="touch-target flex items-center justify-center"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">SOMAQ</span>
          <span className="text-[#00E676] text-sm font-semibold">LOCAÇÕES</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(open || true) && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: open ? 0 : "-100%" }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:translate-x-0 lg:static top-0 left-0 bottom-0 w-72 bg-[#0D0745] text-white z-50 flex flex-col shadow-2xl lg:shadow-none"
          >
            {/* Logo */}
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#1B0F8E] rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-[#00E676]" />
                </div>
                <div>
                  <span className="font-bold text-lg block leading-tight">SOMAQ</span>
                  <span className="text-[#00E676] text-xs font-semibold">LOCAÇÕES</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="lg:hidden touch-target flex items-center justify-center"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl touch-target transition-all ${
                      isActive
                        ? "bg-[#1B0F8E] text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-[#00E676]" : ""}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00E676]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10 touch-target"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

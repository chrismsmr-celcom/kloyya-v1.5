"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  MapPin,
  Boxes,
  KanbanSquare,
  MessageSquare,
  BarChart3,
  Settings,
  LifeBuoy,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Définition des sections du menu, alignées sur tes routes API existantes
const MENU_SECTIONS = [
  {
    title: "Supervision",
    items: [
      { label: "Dashboard", href: "/command-center", icon: LayoutDashboard },
      { 
        label: "Centre d'Approbation", 
        href: "/approvals", 
        icon: ShieldCheck, 
        highlight: true // Mise en avant pour le "Human-in-the-loop"
      },
    ],
  },
  {
    title: "Opérations Physiques",
    items: [
      { label: "Sites & Lieux", href: "/locations", icon: MapPin },
      { label: "Ressources", href: "/resources", icon: Boxes },
      { label: "Travail & Tâches", href: "/work", icon: KanbanSquare },
    ],
  },
  {
    title: "Intelligence Kloyya",
    items: [
      { label: "Chat avec Kloyya", href: "/chat", icon: MessageSquare },
      { label: "Rapports & Insights", href: "/outcomes", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface transition-all duration-300">
      {/* Logo & Branding */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground">Kloyya</h1>
          <p className="text-[10px] text-muted">AI Chief of Staff</p>
        </div>
      </div>

      {/* Navigation Principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {MENU_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                // Gestion précise de l'état actif, même pour les sous-routes
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-muted hover:bg-white/5 hover:text-foreground",
                        // Si c'est un élément mis en avant (comme les approbations) et qu'il n'est pas actif
                        item.highlight && !isActive && "border border-accent/30 text-accent hover:bg-accent/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isActive ? "text-accent" : "text-muted group-hover:text-foreground"
                          )}
                        />
                        {item.label}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Section Basse (Paramètres, Support, Profil) */}
      <div className="border-t border-border p-3">
        <ul className="space-y-1">
          <li>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
          </li>
          <li>
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <LifeBuoy className="h-4 w-4" />
              Support & Contact
            </button>
          </li>
        </ul>

        {/* Profil Utilisateur / Institution */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-md border border-border bg-surface p-2.5 transition-colors hover:bg-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-semibold text-foreground">Mon Organisation</p>
            <p className="text-[10px] text-muted">Plan Team · Owner</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted" />
        </button>
      </div>

      {/* --- MODALES --- */}
      
      {/* Modale Support */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Contacter le Support</h3>
            <p className="mb-4 text-sm text-muted">Notre équipe est disponible pour vous aider sur le terrain.</p>
            <div className="space-y-3">
              <div className="rounded-md border border-border bg-white/5 p-3 text-sm text-foreground">
                📧 support@kloyya.com
              </div>
              <div className="rounded-md border border-border bg-white/5 p-3 text-sm text-foreground">
                📞 +33 1 23 45 67 89
              </div>
            </div>
            <button
              onClick={() => setIsSupportModalOpen(false)}
              className="mt-6 w-full rounded-md bg-accent py-2 text-sm font-semibold text-white hover:bg-accent/90"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modale Profil */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Paramètres du Compte</h3>
            <p className="mb-4 text-sm text-muted">Gérez votre institution, vos intégrations et votre session.</p>
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full rounded-md border border-border bg-surface py-2 text-sm font-semibold text-foreground hover:bg-white/5"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

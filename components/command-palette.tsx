"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AlertTriangle, LogOut, RotateCcw } from "lucide-react";
import { navItems } from "@/lib/nav";
import { useDemo } from "@/lib/store";

/**
 * ⌘K. Also the presenter's parachute: if the thread is lost on stage, every
 * page and every demo state is two keystrokes away.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const reset = useDemo((s) => s.reset);
  const signOut = useDemo((s) => s.signOut);
  const detectRisk = useDemo((s) => s.detectRisk);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      shouldFilter
      overlayClassName="fixed inset-0 z-[90] bg-void/70 backdrop-blur-sm"
      contentClassName="glass glass-blur fixed left-1/2 top-[16vh] z-[100] w-[min(92vw,560px)] -translate-x-1/2 overflow-hidden !bg-surface/85 !p-0"
    >
      <div className="border-b border-hairline px-4">
        <Command.Input
          autoFocus
          placeholder="Jump to a page, or run a demo action…"
          className="h-14 w-full bg-transparent text-[15px] text-paper outline-none placeholder:text-paper-faint"
        />
      </div>

      <Command.List className="max-h-[52vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-paper-faint">
          Nothing matches that.
        </Command.Empty>

        <Group heading="Go to">
          {navItems.map((item) => (
            <Item
              key={item.href}
              value={item.label}
              onSelect={() => run(() => router.push(item.href))}
            >
              <item.icon className="size-4 text-paper-faint" />
              {item.label}
            </Item>
          ))}
        </Group>

        <Group heading="Demo">
          <Item
            value="Jump to risk detection"
            onSelect={() =>
              run(() => {
                detectRisk();
                router.push("/dashboard");
              })
            }
          >
            <AlertTriangle className="size-4 text-signal" />
            Jump to risk detection
          </Item>
          <Item
            value="Reset demo"
            onSelect={() =>
              run(() => {
                reset();
                router.push("/");
              })
            }
          >
            <RotateCcw className="size-4 text-paper-faint" />
            Reset demo
          </Item>
          <Item
            value="Sign out"
            onSelect={() =>
              run(() => {
                signOut();
                router.push("/login");
              })
            }
          >
            <LogOut className="size-4 text-paper-faint" />
            Sign out
          </Item>
        </Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Group({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-paper-faint"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  children,
  value,
  onSelect,
}: {
  children: React.ReactNode;
  value: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] text-paper-dim transition-colors duration-150 data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-paper"
    >
      {children}
    </Command.Item>
  );
}

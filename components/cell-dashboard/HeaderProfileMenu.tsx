"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useOfflineContext } from "@/components/offline/offline-context";
import { IconAvatar } from "@/components/cell-dashboard/icons";
import { switchActiveRole } from "@/app/auth/active-role-actions";
import type { RoleSwitchMenuProps } from "@/lib/auth/role-switch-menu";
import { clearCellSnapshots } from "@/lib/offline/cell-snapshot-store";
import { clearOfflineSyncQueue, syncQueueCount } from "@/lib/offline/offline-db";

type HeaderProfileMenuProps = {
  /** Called when user chooses “View profile”; menu closes first. */
  onProfile?: () => void;
  /** Dual admin+leader: switch workspace without signing out. */
  roleSwitch?: RoleSwitchMenuProps | null;
  /** `dark` = menus on #0B0E14 header */
  surface?: "dark";
};

export function HeaderProfileMenu({ onProfile, roleSwitch, surface = "dark" }: HeaderProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const { online, refreshPendingCount } = useOfflineContext();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const handleSignOut = useCallback(async () => {
    if (!navigator.onLine || !online) {
      window.alert(
        "Sign out requires an internet connection. Your session stays on this device so you can keep using the app offline until you connect and sign out.",
      );
      return;
    }

    const pending = await syncQueueCount();
    if (pending > 0) {
      const ok = window.confirm(
        `You have ${pending} change(s) on this device that have not synced to Supabase yet. Signing out will permanently discard them from this device (they will not be sent later).\n\nCancel to stay signed in and sync first, or OK to sign out and clear this local queue.`,
      );
      if (!ok) return;
    }

    setSigningOut(true);
    try {
      const res = await fetch("/auth/signout", {
        method: "POST",
        credentials: "same-origin",
        redirect: "manual",
      });

      if (res.status === 303 || res.status === 302) {
        await clearOfflineSyncQueue();
        await clearCellSnapshots();
        await refreshPendingCount();
        const loc = res.headers.get("Location");
        if (loc) {
          try {
            window.location.href = new URL(loc, window.location.origin).href;
          } catch {
            window.location.href = "/";
          }
        } else {
          window.location.href = "/";
        }
        return;
      }

      if (res.type === "opaqueredirect") {
        await clearOfflineSyncQueue();
        await clearCellSnapshots();
        await refreshPendingCount();
        window.location.href = "/";
        return;
      }

      if (res.ok) {
        await clearOfflineSyncQueue();
        await clearCellSnapshots();
        await refreshPendingCount();
        window.location.href = "/";
        return;
      }

      window.alert("Could not sign out. Please try again.");
    } catch {
      window.alert("Network error while signing out. Check your connection and try again.");
    } finally {
      setSigningOut(false);
      close();
    }
  }, [close, online, refreshPendingCount]);

  const panelClass =
    surface === "dark"
      ? "absolute right-0 top-full z-[100] mt-2 min-w-[200px] rounded-xl border border-white/10 bg-[#141922] py-1.5 shadow-xl shadow-black/40 ring-1 ring-white/5"
      : "absolute right-0 top-full z-[100] mt-2 min-w-[200px] rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg";

  const itemClass =
    surface === "dark"
      ? "block w-full px-4 py-2.5 text-left text-sm font-medium text-white/90 hover:bg-white/10"
      : "block w-full px-4 py-2.5 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50";

  const dangerClass =
    surface === "dark"
      ? "block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-300/95 hover:bg-white/10"
      : "block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-700 hover:bg-rose-50";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="min-h-10 min-w-10 touch-manipulation rounded-full bg-white/10 px-0 py-0 text-white/90 ring-1 ring-white/15 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:min-h-11 lg:min-w-11"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex h-10 w-10 items-center justify-center lg:h-11 lg:w-11">
          <IconAvatar className="h-[22px] w-[22px] lg:h-6 lg:w-6" />
        </span>
      </button>
      {open ? (
        <div id={menuId} role="menu" aria-orientation="vertical" className={panelClass}>
          <Link
            href="/account/profile"
            role="menuitem"
            className={`${itemClass} no-underline`}
            onClick={close}
          >
            Profile & password
          </Link>
          {roleSwitch ? (
            <button
              type="button"
              role="menuitem"
              disabled={switchingRole || signingOut}
              className={`${itemClass} w-full cursor-pointer border-0 bg-transparent font-sans disabled:opacity-60`}
              onClick={() => {
                close();
                setSwitchingRole(true);
                void switchActiveRole(roleSwitch.target).finally(() => setSwitchingRole(false));
              }}
            >
              {switchingRole ? "Switching…" : roleSwitch.label}
            </button>
          ) : null}
          {onProfile ? (
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => {
                close();
                onProfile();
              }}
            >
              View profile
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            className={`${dangerClass} w-full cursor-pointer border-0 bg-transparent font-sans disabled:opacity-60`}
            onClick={() => void handleSignOut()}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

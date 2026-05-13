"use client";

import { useCallback, useState } from "react";
import { updateMyCellName, type CellNameState } from "@/app/account/actions";
import { useOfflineContext } from "@/components/offline/offline-context";
import { enqueueSyncMutation } from "@/lib/offline/offline-db";

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10";

const submitClass =
  "min-h-11 rounded-lg bg-[#0B0E14] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#141922] disabled:opacity-60";

export function ProfileCellNameForm({ initialName }: { initialName: string }) {
  const { online, refreshPendingCount } = useOfflineContext();
  const [state, setState] = useState<CellNameState>({});
  const [pending, setPending] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fd = new FormData(form);
      const name = String(fd.get("cellName") ?? "").trim();
      setPending(true);
      setState({});

      if (!online) {
        if (name.length < 2) {
          setState({ error: "Use at least 2 characters for the cell name." });
          setPending(false);
          return;
        }
        if (name.length > 120) {
          setState({ error: "Keep the cell name at 120 characters or fewer." });
          setPending(false);
          return;
        }
        await enqueueSyncMutation("update_cell_name", { name });
        await refreshPendingCount();
        setState({ success: true });
        setPending(false);
        return;
      }

      const result = await updateMyCellName({}, fd);
      setState(result);
      setPending(false);
    },
    [online, refreshPendingCount],
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {online ? "Cell name saved." : "Saved on this device. It will sync when you are back online."}
        </p>
      ) : null}

      <div>
        <label htmlFor="profile-cell-name" className="mb-1.5 block text-sm font-medium text-neutral-800">
          Cell name
        </label>
        <input
          id="profile-cell-name"
          name="cellName"
          type="text"
          required
          minLength={2}
          maxLength={120}
          defaultValue={initialName}
          className={inputClass}
          autoComplete="organization"
        />
        <p className="mt-1 text-xs text-neutral-500">Shown on your cell dashboard and in admin lists.</p>
      </div>

      <button type="submit" className={submitClass} disabled={pending}>
        {pending ? "Saving…" : "Save cell name"}
      </button>
    </form>
  );
}

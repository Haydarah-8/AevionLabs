"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";

export type StudioCommand = {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
};

export function StudioCommandPalette({
  commands,
}: {
  commands: StudioCommand[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "?" && !event.metaKey && !event.ctrlKey) {
        const tag = (event.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="ae-cmdk-root" role="dialog" aria-label="Command palette">
      <button
        type="button"
        className="ae-cmdk-backdrop"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <Command className="ae-cmdk" label="Command palette">
        <Command.Input placeholder="Search actions…" autoFocus />
        <Command.List>
          <Command.Empty>No results</Command.Empty>
          <Command.Group heading="Studio">
            {commands.map((command) => (
              <Command.Item
                key={command.id}
                value={`${command.label} ${command.hint || ""}`}
                onSelect={() => {
                  setOpen(false);
                  command.run();
                }}
              >
                <span>{command.label}</span>
                {command.hint ? <small>{command.hint}</small> : null}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Shortcuts">
            <Command.Item value="shortcuts help" onSelect={() => setOpen(false)}>
              <span>⌘/Ctrl+K · Command palette</span>
            </Command.Item>
            <Command.Item value="shortcuts save" onSelect={() => setOpen(false)}>
              <span>Autosave on edit · Publish from header</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

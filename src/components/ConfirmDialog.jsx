"use client";

import { useId, useRef } from "react";
import { Button } from "./Controls";

export function ConfirmDialog({ trigger, title, description, confirmLabel, onConfirm }) {
  const dialog = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <Button onClick={() => dialog.current.showModal()}>{trigger}</Button>
      <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-border bg-surface p-6 text-foreground backdrop:bg-black/40">
        <h2 id={titleId} className="font-primary text-xl font-bold">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm text-muted">{description}</p>
        <form method="dialog" className="mt-5 flex flex-wrap justify-end gap-2"
          onSubmit={(event) => {
            if (event.nativeEvent.submitter?.value === "confirm") onConfirm();
          }}>
          <Button type="submit" variant="secondary" value="cancel" autoFocus>Batal</Button>
          <Button type="submit" value="confirm">{confirmLabel}</Button>
        </form>
      </dialog>
    </>
  );
}

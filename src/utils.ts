// Small helpers shared by every page.

/** Get an element by id (throws a clear error if it is missing). */
export function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

/** Format a number with a fixed number of decimals. */
export function fmt(x: number, decimals = 4): string {
  return Number.isFinite(x) ? x.toFixed(decimals) : "—";
}

/** Format a p-value. */
export function fmtP(p: number): string {
  return p < 0.0001 ? "< 0.0001" : p.toFixed(4);
}

/** Segmented button group (one active button). Returns a getter for the active value. */
export function bindSeg(id: string, onChange: () => void): () => string {
  const root = $(id);
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.classList.toggle("active", x === b));
      onChange();
    })
  );
  return () => buttons.find((b) => b.classList.contains("active"))!.dataset.v!;
}

/** Show or hide an error message box. */
export function showError(id: string, message: string | null): void {
  const box = $(id);
  box.textContent = message ?? "";
  box.hidden = message === null;
}

/** Replay the fade-in animation on an element. */
export function replay(el: HTMLElement): void {
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

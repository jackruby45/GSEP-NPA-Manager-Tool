// Small DOM helpers and file download

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

export function qs<T extends Element = Element>(sel: string, ctx: ParentNode = document): T | null {
  return ctx.querySelector(sel) as T | null;
}

export function setHidden(el: HTMLElement | null, hidden: boolean) {
  if (!el) return;
  el.classList.toggle('hidden', hidden);
}

export function download(filename: string, content: string, mime = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function toNumberOrNull(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300): T {
  let t: number | undefined;
  return function (this: any, ...args: any[]) {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn.apply(this, args), wait);
  } as T;
}

let lastId = 0;
export const genId = () => ++lastId;
export function syncIdGenerator(maxId: number) {
  if (maxId > lastId) {
    lastId = maxId;
  }
}
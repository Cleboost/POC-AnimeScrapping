import type { Platform } from "./types.js";
import type { InternalRef } from "./webanime/types.js";

export interface InternalPlatformRef {
  platform: Platform;
  title: string;
  ref: InternalRef;
}

export interface InternalEntry {
  title: string;
  query: string;
  refs: InternalPlatformRef[];
}

export class Session {
  private entries = new Map<number, InternalEntry>();
  private nextId = 1;

  reset(): void {
    this.entries.clear();
    this.nextId = 1;
  }

  add(entry: InternalEntry): number {
    const id = this.nextId++;
    this.entries.set(id, entry);
    return id;
  }

  get(id: number): InternalEntry | undefined {
    return this.entries.get(id);
  }

  getAll(): InternalEntry[] {
    return Array.from(this.entries.values());
  }
}

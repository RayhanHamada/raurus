import { persistentBoolean, persistentJSON } from "@nanostores/persistent";
import { atom } from "nanostores";

import type { Data } from "@/common";

export const $editMode = persistentBoolean("raurus:editMode", false);

export const $placeholders = persistentJSON<Record<string, Data>>("raurus:placeholders", {});

export const $selectedId = atom<string | null>(null);

export const $editingId = atom<string | null>(null);

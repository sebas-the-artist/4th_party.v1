import { promises as fs } from "node:fs";
import path from "node:path";
import { workspaceSchema } from "@/domain/schemas";
import { EMPTY_WORKSPACE, type WaitlistEntry, type Workspace } from "@/domain/types";
import { supabaseEnabled, supabaseServiceKey, supabaseUrl } from "@/lib/config";

const DATA_DIR = path.join(process.cwd(), "data");
const LEGACY_FILE = path.join(DATA_DIR, "workspace.json");

const memory = new Map<string, Workspace>();
let fsWritable: boolean | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function safeOwnerId(ownerId: string): string {
  const cleaned = ownerId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return cleaned || "demo";
}

function fileFor(ownerId: string): string {
  return path.join(DATA_DIR, `workspace-${safeOwnerId(ownerId)}.json`);
}

function parseWorkspace(raw: unknown, ownerId: string): Workspace {
  const parsed = workspaceSchema.safeParse({
    ...(typeof raw === "object" && raw ? raw : {}),
    ownerId,
  });
  if (!parsed.success) {
    throw new Error("Workspace is corrupted. Restore from backup or load the sample week.");
  }
  return parsed.data;
}

async function rest(pathName: string, init: RequestInit): Promise<Response> {
  return fetch(`${supabaseUrl}/rest/v1/${pathName}`, {
    ...init,
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
}

async function loadFromSupabase(ownerId: string): Promise<Workspace | null> {
  const response = await rest(`workspaces?owner_id=eq.${encodeURIComponent(ownerId)}&select=payload`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`Supabase workspace read failed (${response.status}).`);
  }
  const rows = (await response.json()) as Array<{ payload: unknown }>;
  if (!rows[0]) {
    return null;
  }
  return parseWorkspace(rows[0].payload, ownerId);
}

async function saveToSupabase(workspace: Workspace): Promise<void> {
  const response = await rest("workspaces?on_conflict=owner_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      owner_id: workspace.ownerId,
      payload: workspace,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error(`Supabase workspace write failed (${response.status}).`);
  }
}

export async function insertWaitlistRow(entry: WaitlistEntry): Promise<void> {
  if (!supabaseEnabled) {
    return;
  }
  const response = await rest("waitlist", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      id: entry.id,
      email: entry.email,
      restaurant: entry.restaurant,
      created_at: entry.createdAt,
    }),
  });
  if (!response.ok && response.status !== 409) {
    throw new Error(`Supabase waitlist write failed (${response.status}).`);
  }
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function canWriteFiles(): Promise<boolean> {
  if (fsWritable != null) {
    return fsWritable;
  }
  try {
    await ensureDir();
    const probe = path.join(DATA_DIR, ".write-probe");
    await fs.writeFile(probe, "ok");
    await fs.unlink(probe);
    fsWritable = true;
  } catch {
    fsWritable = false;
  }
  return fsWritable;
}

async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function loadWorkspace(ownerId: string): Promise<Workspace> {
  if (supabaseEnabled) {
    const remote = await loadFromSupabase(ownerId);
    if (remote) {
      return remote;
    }
    const empty = { ...EMPTY_WORKSPACE, ownerId };
    await saveToSupabase(empty);
    return empty;
  }

  const cached = memory.get(ownerId);
  if (cached) {
    return cached;
  }

  if (await canWriteFiles()) {
    const filePath = fileFor(ownerId);
    let raw = await readJsonFile(filePath);
    if (raw == null && ownerId === "demo") {
      raw = await readJsonFile(LEGACY_FILE);
    }
    if (raw == null) {
      const empty = { ...EMPTY_WORKSPACE, ownerId };
      await saveWorkspace(empty);
      return empty;
    }
    const parsed = parseWorkspace(raw, ownerId);
    memory.set(ownerId, parsed);
    return parsed;
  }

  const empty = { ...EMPTY_WORKSPACE, ownerId };
  memory.set(ownerId, empty);
  return empty;
}

export async function saveWorkspace(workspace: Workspace): Promise<void> {
  const parsed = workspaceSchema.parse(workspace);
  memory.set(parsed.ownerId, parsed);

  if (supabaseEnabled) {
    await saveToSupabase(parsed);
    return;
  }

  if (!(await canWriteFiles())) {
    return;
  }

  const filePath = fileFor(parsed.ownerId);
  writeQueue = writeQueue.then(async () => {
    await ensureDir();
    const tempFile = `${filePath}.tmp`;
    await fs.writeFile(tempFile, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    await fs.rename(tempFile, filePath);
  });
  await writeQueue;
}

export async function updateWorkspace(
  ownerId: string,
  updater: (workspace: Workspace) => Workspace | Promise<Workspace>,
): Promise<Workspace> {
  const current = await loadWorkspace(ownerId);
  const next = await updater(current);
  await saveWorkspace({ ...next, ownerId });
  return { ...next, ownerId };
}

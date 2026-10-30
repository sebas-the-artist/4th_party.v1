import { promises as fs } from "node:fs";
import path from "node:path";
import { workspaceSchema } from "@/domain/schemas";
import { EMPTY_WORKSPACE, type Workspace } from "@/domain/types";

const DATA_DIR = path.join(process.cwd(), "data");
const LEGACY_FILE = path.join(DATA_DIR, "workspace.json");

let writeQueue: Promise<void> = Promise.resolve();

function safeOwnerId(ownerId: string): string {
  const cleaned = ownerId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return cleaned || "demo";
}

function fileFor(ownerId: string): string {
  return path.join(DATA_DIR, `workspace-${safeOwnerId(ownerId)}.json`);
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
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
  await ensureDir();
  const filePath = fileFor(ownerId);
  let raw = await readJsonFile(filePath);

  if (raw == null && ownerId === "demo") {
    raw = await readJsonFile(LEGACY_FILE);
  }

  if (raw == null) {
    const empty = { ...EMPTY_WORKSPACE, ownerId };
    await fs.writeFile(filePath, `${JSON.stringify(empty, null, 2)}\n`, "utf8");
    return empty;
  }

  const parsed = workspaceSchema.safeParse({
    ...(raw as object),
    ownerId,
  });
  if (!parsed.success) {
    throw new Error("Workspace file is corrupted. Restore the data/workspace-*.json file from backup.");
  }
  return parsed.data;
}

export async function saveWorkspace(workspace: Workspace): Promise<void> {
  const parsed = workspaceSchema.parse(workspace);
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

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const VAULT_FILE = path.join(DATA_DIR, "vault.json");

// Initial seed keys loaded securely from environment / vault file
const DEFAULT_SEED_KEYS: Record<string, string> = {
  groq: process.env.GROQ_API_KEY || "",
  gemini: process.env.GEMINI_API_KEY || "",
};

// In-memory fallback for serverless environments (e.g. Vercel, Netlify)
let memoryVault: Record<string, string> | null = null;

function getEnvKeys(): Record<string, string> {
  const envMap: Record<string, string | undefined> = {
    groq: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
    gemini: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    openai: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
    together: process.env.TOGETHER_API_KEY || process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
    mistral: process.env.MISTRAL_API_KEY || process.env.NEXT_PUBLIC_MISTRAL_API_KEY,
  };

  const res: Record<string, string> = {};
  for (const [k, v] of Object.entries(envMap)) {
    if (v && v.trim()) res[k] = v.trim();
  }
  return res;
}

async function readVaultFile(): Promise<Record<string, string>> {
  const envKeys = getEnvKeys();
  let fileKeys: Record<string, string> = {};

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(VAULT_FILE, "utf-8");
    fileKeys = JSON.parse(content);
  } catch {
    if (memoryVault) {
      fileKeys = memoryVault;
    } else {
      // If file doesn't exist yet, seed with default verified keys
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(VAULT_FILE, JSON.stringify(DEFAULT_SEED_KEYS, null, 2), "utf-8");
      } catch {
        // ignore read-only error in serverless environments
      }
      fileKeys = { ...DEFAULT_SEED_KEYS };
    }
  }

  // Priority order: File/memory user edits > Environment variables > Default seed keys
  const merged = {
    ...DEFAULT_SEED_KEYS,
    ...envKeys,
    ...fileKeys,
  };

  memoryVault = merged;
  return merged;
}

async function writeVaultFile(keys: Record<string, string>): Promise<void> {
  memoryVault = { ...keys };
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(VAULT_FILE, JSON.stringify(keys, null, 2), "utf-8");
  } catch (err) {
    // Graceful fallback for serverless read-only filesystems (e.g. Vercel lambdas)
    console.warn("Vault file write skipped (using in-memory fallback):", err);
  }
}

export async function GET() {
  try {
    const keys = await readVaultFile();
    return NextResponse.json({
      success: true,
      keys,
      message: "Keys loaded from central server vault",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to read vault";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await readVaultFile();

    if (body.keys && typeof body.keys === "object") {
      const merged = { ...current };
      for (const [provider, keyVal] of Object.entries(body.keys)) {
        if (typeof keyVal === "string") {
          const trimmed = keyVal.trim();
          if (trimmed) {
            merged[provider] = trimmed;
          } else {
            delete merged[provider];
          }
        }
      }
      await writeVaultFile(merged);
      return NextResponse.json({ success: true, keys: merged });
    }

    if (body.provider && typeof body.key === "string") {
      const merged = { ...current };
      const trimmed = body.key.trim();
      if (trimmed) {
        merged[body.provider] = trimmed;
      } else {
        delete merged[body.provider];
      }
      await writeVaultFile(merged);
      return NextResponse.json({ success: true, keys: merged });
    }

    return NextResponse.json(
      { success: false, error: "Invalid payload: expected 'keys' object or 'provider' + 'key'" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update vault";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await writeVaultFile(DEFAULT_SEED_KEYS);
    return NextResponse.json({
      success: true,
      keys: DEFAULT_SEED_KEYS,
      message: "Vault reset to verified initial keys",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset vault";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

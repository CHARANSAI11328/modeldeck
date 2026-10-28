/**
 * BYOK Vault: Central multi-device and multi-window synchronized vault.
 * Automatically synchronizes API keys across all browser windows, tabs,
 * and connected devices on your network via the central server vault API,
 * while maintaining encrypted local backups and in-memory execution.
 */

import { ProviderId } from "./types";

interface EncryptedVaultRecord {
  version: number;
  saltHex: string;
  ivHex: string;
  ciphertextHex: string;
}

export type ProviderKeyMap = Partial<Record<ProviderId, string>>;

const VAULT_STORAGE_KEY = "byok_encrypted_vault_v1";
const SESSION_SALT_KEY = "byok_device_session_salt";
const DEFAULT_SALT_ROUNDS = 100_000;

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export class BYOKVault {
  private static instance: BYOKVault | null = null;
  private memoryCache: ProviderKeyMap | null = null;
  private currentPassphrase = "";
  private isUnlocked = false;
  private syncChannel: BroadcastChannel | null = null;
  private changeListeners = new Set<() => void>();

  private constructor() {
    if (typeof window !== "undefined") {
      // 1. Cross-window / cross-tab broadcast synchronization
      try {
        if ("BroadcastChannel" in window) {
          this.syncChannel = new BroadcastChannel("byok_cross_window_sync");
          this.syncChannel.onmessage = async (event) => {
            if (event.data?.type === "keys_updated") {
              await this.syncWithServer();
            }
          };
        }
      } catch {
        // ignore
      }

      // 2. Cross-device sync when returning to or focusing the window/tab
      window.addEventListener("focus", () => {
        this.syncWithServer();
      });

      // 3. Periodic cross-device polling (e.g., other devices on LAN adding keys)
      setInterval(() => {
        this.syncWithServer();
      }, 10_000);
    }
  }

  public static getInstance(): BYOKVault {
    if (!BYOKVault.instance) {
      BYOKVault.instance = new BYOKVault();
    }
    return BYOKVault.instance;
  }

  public subscribeToVaultChanges(callback: () => void): () => void {
    this.changeListeners.add(callback);
    return () => {
      this.changeListeners.delete(callback);
    };
  }

  private notifyChangeListeners() {
    this.changeListeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
  }

  private broadcastUpdate() {
    try {
      this.syncChannel?.postMessage({
        type: "keys_updated",
        timestamp: Date.now(),
      });
    } catch {
      // ignore
    }
    this.notifyChangeListeners();
  }

  private getBrowserDeviceKey(): string {
    if (typeof window === "undefined") return "server-isolated-key";
    let seed = window.sessionStorage.getItem(SESSION_SALT_KEY);
    if (!seed) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      seed = bufferToHex(array.buffer);
      window.sessionStorage.setItem(SESSION_SALT_KEY, seed);
    }
    return seed;
  }

  private async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const passphraseKey = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations: DEFAULT_SALT_ROUNDS,
        hash: "SHA-256",
      },
      passphraseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Synchronizes with the central server vault API so all devices and windows
   * share the same configured keys in real time.
   */
  public async syncWithServer(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch("/api/vault", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.keys && typeof data.keys === "object") {
          const nextCache: ProviderKeyMap = {};
          for (const [pId, key] of Object.entries(data.keys)) {
            if (typeof key === "string" && (key as string).trim()) {
              nextCache[pId as ProviderId] = (key as string).trim();
            }
          }
          const isDiff = JSON.stringify(this.memoryCache || {}) !== JSON.stringify(nextCache);
          this.memoryCache = nextCache;
          this.isUnlocked = true;
          if (isDiff) {
            await this.persist();
            this.notifyChangeListeners();
          }
        }
      }
    } catch {
      // Ignore network errors, fallback to local cache
    }
  }

  /**
   * Initializes vault. Syncs with central server vault so keys are uniform across
   * all windows and devices, with local fallback decryption.
   */
  public async unlock(passphrase?: string): Promise<boolean> {
    if (typeof window === "undefined") return false;

    // 1. Try local cache decryption
    const rawEncrypted = window.localStorage.getItem(VAULT_STORAGE_KEY);
    const pass = passphrase || this.getBrowserDeviceKey();

    if (rawEncrypted) {
      try {
        const record: EncryptedVaultRecord = JSON.parse(rawEncrypted);
        const salt = hexToBuffer(record.saltHex);
        const iv = hexToBuffer(record.ivHex);
        const ciphertext = hexToBuffer(record.ciphertextHex);

        const cryptoKey = await this.deriveKey(pass, salt);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv as BufferSource },
          cryptoKey,
          ciphertext as BufferSource
        );

        const dec = new TextDecoder();
        const jsonString = dec.decode(decryptedBuffer);
        this.memoryCache = JSON.parse(jsonString);
        this.currentPassphrase = pass;
        this.isUnlocked = true;
      } catch {
        // ignore local decrypt failure
      }
    }

    // 2. Fetch and merge from central server vault (cross-device & cross-window)
    await this.syncWithServer();

    this.isUnlocked = true;
    return true;
  }

  private async persist(): Promise<void> {
    if (typeof window === "undefined" || !this.memoryCache) return;

    const pass = this.currentPassphrase || this.getBrowserDeviceKey();
    const enc = new TextEncoder();
    const plainBytes = enc.encode(JSON.stringify(this.memoryCache));

    const salt = new Uint8Array(16);
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(salt);
    window.crypto.getRandomValues(iv);

    const cryptoKey = await this.deriveKey(pass, salt);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      cryptoKey,
      plainBytes as BufferSource
    );

    const record: EncryptedVaultRecord = {
      version: 1,
      saltHex: bufferToHex(salt.buffer),
      ivHex: bufferToHex(iv.buffer),
      ciphertextHex: bufferToHex(encryptedBuffer),
    };

    window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(record));
  }

  /**
   * Store or update an API key for a specific provider.
   * Immediately persists locally and broadcasts to all other windows and devices.
   */
  public async setKey(provider: ProviderId, apiKey: string): Promise<void> {
    if (!this.isUnlocked || !this.memoryCache) {
      await this.unlock();
    }
    if (!this.memoryCache) this.memoryCache = {};

    const trimmed = apiKey.trim();
    if (trimmed) {
      this.memoryCache[provider] = trimmed;
    } else {
      delete this.memoryCache[provider];
    }

    await this.persist();

    // Persist to central server vault so other devices and windows update
    try {
      await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key: trimmed }),
      });
    } catch {
      // ignore
    }

    this.broadcastUpdate();
  }

  /**
   * Batch saves all keys and synchronizes to the server vault for all devices
   */
  public async saveAllKeys(keys: ProviderKeyMap): Promise<void> {
    if (!this.memoryCache) this.memoryCache = {};
    for (const [pId, key] of Object.entries(keys)) {
      const trimmed = (key || "").trim();
      if (trimmed) {
        this.memoryCache[pId as ProviderId] = trimmed;
      } else {
        delete this.memoryCache[pId as ProviderId];
      }
    }
    await this.persist();

    try {
      await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
    } catch {
      // ignore
    }

    this.broadcastUpdate();
  }

  public async removeKey(provider: ProviderId): Promise<void> {
    await this.setKey(provider, "");
  }

  public isConfigured(provider: ProviderId): boolean {
    if (!this.memoryCache) return false;
    const key = this.memoryCache[provider];
    return typeof key === "string" && key.length > 0;
  }

  public getConfiguredMap(): Record<ProviderId, boolean> {
    const res = {} as Record<ProviderId, boolean>;
    const providers: ProviderId[] = [
      "openai",
      "anthropic",
      "gemini",
      "deepseek",
      "groq",
      "openrouter",
      "together",
      "mistral",
      "custom-openai-compatible",
    ];
    for (const p of providers) {
      res[p] = this.isConfigured(p);
    }
    return res;
  }

  public async withKey<T>(
    provider: ProviderId,
    action: (key: string) => Promise<T>
  ): Promise<T> {
    if (!this.isUnlocked || !this.memoryCache) {
      const unlocked = await this.unlock();
      if (!unlocked) {
        throw new Error("Vault is locked. Please unlock the BYOK Vault.");
      }
    }

    const key = this.memoryCache?.[provider];
    if (!key && provider !== "custom-openai-compatible") {
      throw new Error(`No API key configured for ${provider}. Please configure your API key in Settings.`);
    }

    return await action(key || "");
  }

  public getMaskedKey(provider: ProviderId): string {
    if (!this.memoryCache || !this.memoryCache[provider]) return "";
    const key = this.memoryCache[provider]!;
    if (key.length <= 8) return "••••••••";
    const prefix = key.slice(0, 4);
    const suffix = key.slice(-4);
    return `${prefix}••••••••${suffix}`;
  }

  public async seedVerifiedUserKeys(): Promise<void> {
    await this.syncWithServer();
    this.notifyChangeListeners();
  }

  public getRawKey(provider: ProviderId): string {
    return this.memoryCache?.[provider] || "";
  }

  public async clearAll(): Promise<void> {
    this.memoryCache = {};
    this.currentPassphrase = "";
    this.isUnlocked = false;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(VAULT_STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_SALT_KEY);
    }
    try {
      await fetch("/api/vault", { method: "DELETE" });
    } catch {
      // ignore
    }
    this.broadcastUpdate();
  }

  public lock(): void {
    this.memoryCache = null;
    this.isUnlocked = false;
  }

  public getUnlockedStatus(): boolean {
    return this.isUnlocked;
  }
}

export const vault = BYOKVault.getInstance();

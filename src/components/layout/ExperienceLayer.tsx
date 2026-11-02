"use client";

import { useEffect, useState } from "react";
import { Check, Command, Contrast, Monitor, Moon, Palette, Sun, Volume2, VolumeX, WandSparkles, X } from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";

type Theme = "cyber" | "matrix" | "mono" | "nord" | "dracula" | "solarized" | "glass" | "crt";
type Mode = "dark" | "light" | "system";
type Density = "compact" | "comfortable" | "spacious";

const themes: { id: Theme; name: string; note: string; color: string }[] = [
  { id: "cyber", name: "Cyber Neon", note: "Electric blue signal", color: "#3b82f6" },
  { id: "matrix", name: "Terminal", note: "Matrix green", color: "#30d158" },
  { id: "mono", name: "Minimal Mono", note: "Neutral precision", color: "#71717a" },
  { id: "nord", name: "Nord", note: "Cool arctic blue", color: "#88c0d0" },
  { id: "dracula", name: "Dracula", note: "Violet contrast", color: "#bd93f9" },
  { id: "solarized", name: "Solarized", note: "Warm blue balance", color: "#268bd2" },
  { id: "glass", name: "Glass", note: "Frosted depth", color: "#5eead4" },
  { id: "crt", name: "Retro CRT", note: "Phosphor amber", color: "#fbbf24" },
];

const KEY = "modeldeck-experience-v1";
const defaults = { theme: "cyber" as Theme, mode: "dark" as Mode, accent: "#3b82f6", density: "comfortable" as Density, fontSize: 15, lineHeight: 1.65, dyslexia: false, background: true, motion: true, contrast: false, sound: false };

function read() { try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return defaults; } }
function apply(p: typeof defaults) {
  const root = document.documentElement;
  root.dataset.theme = p.theme;
  root.dataset.mode = p.mode;
  root.dataset.density = p.density;
  root.dataset.background = String(p.background);
  root.dataset.motion = String(p.motion);
  root.dataset.contrast = String(p.contrast);
  root.style.setProperty("--user-accent", p.accent);
  root.style.setProperty("--app-font-size", `${p.fontSize}px`);
  root.style.setProperty("--app-line-height", String(p.lineHeight));
  root.classList.toggle("dyslexic", p.dyslexia);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.classList.toggle("dark", p.mode === "dark" || (p.mode === "system" && systemDark));
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function ExperienceLayer({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState(defaults);
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const { setSettingsOpen, setKeyVaultOpen, createNewSession, setSidebarOpen } = usePlaygroundStore();
  useEffect(() => { const saved = read(); setPrefs(saved); apply(saved); if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, []);
  const update = (next: Partial<typeof defaults>) => { const merged = { ...prefs, ...next }; setPrefs(merged); apply(merged); };
  const beep = () => { if (!prefs.sound) return; const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 520; gain.gain.value = 0.025; oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.04); };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPalette(true); }
      if (event.key === "?" && !event.metaKey && !event.ctrlKey) setOpen(true);
      if (event.key === "Escape") { setOpen(false); setPalette(false); }
    };
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  }, []);
  const command = (action: () => void) => { beep(); action(); setPalette(false); };
  return <>
    <div className="ambient-field" aria-hidden="true"><i /><i /><i /></div>
    {children}
    <button onClick={() => setOpen(true)} className="experience-trigger" aria-label="Open appearance settings" title="Appearance and accessibility"><Palette size={17} /></button>
    {open && <div className="experience-modal" role="dialog" aria-modal="true" aria-label="Appearance settings">
      <div className="experience-panel">
        <div className="experience-heading"><div><span>WORKSPACE APPEARANCE</span><h2>Make it yours</h2></div><button onClick={() => setOpen(false)} aria-label="Close appearance settings"><X size={18} /></button></div>
        <section><h3>Preset</h3><div className="theme-grid">{themes.map((theme) => <button key={theme.id} onClick={() => update({ theme: theme.id, accent: theme.color })} className={prefs.theme === theme.id ? "active" : ""}><i style={{ background: theme.color }} /><b>{theme.name}</b><small>{theme.note}</small>{prefs.theme === theme.id && <Check size={14} />}</button>)}</div></section>
        <section className="setting-row"><div><h3>Color mode</h3><p>Follow your system or choose a fixed workspace mode.</p></div><div className="segment">{([ ["dark", Moon], ["light", Sun], ["system", Monitor] ] as const).map(([id, Icon]) => <button key={id} onClick={() => update({ mode: id })} className={prefs.mode === id ? "active" : ""}><Icon size={15} />{id}</button>)}</div></section>
        <section className="setting-row"><div><h3>Accent</h3><p>Saved privately in this browser.</p></div><label className="accent-picker"><input aria-label="Accent color" type="color" value={prefs.accent} onChange={(e) => update({ accent: e.target.value })} /><span>{prefs.accent}</span></label></section>
        <section className="setting-row"><div><h3>Reading</h3><p>Typography and information density.</p></div><div className="controls"><select value={prefs.density} onChange={(e) => update({ density: e.target.value as Density })}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option></select><label>Size <input type="range" min="13" max="19" value={prefs.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} /></label><label>Leading <input type="range" min="1.35" max="2" step=".05" value={prefs.lineHeight} onChange={(e) => update({ lineHeight: Number(e.target.value) })} /></label></div></section>
        <section className="toggles">
          <button onClick={() => update({ background: !prefs.background })} className={prefs.background ? "toggle-on" : ""}><WandSparkles size={16} /><span>Animated background</span><i /></button>
          <button onClick={() => update({ motion: !prefs.motion })} className={prefs.motion ? "toggle-on" : ""}><Contrast size={16} /><span>Motion</span><i /></button>
          <button onClick={() => update({ contrast: !prefs.contrast })} className={prefs.contrast ? "toggle-on" : ""}><Contrast size={16} /><span>High contrast</span><i /></button>
          <button onClick={() => update({ dyslexia: !prefs.dyslexia })} className={prefs.dyslexia ? "toggle-on" : ""}><Palette size={16} /><span>Dyslexia-friendly type</span><i /></button>
          <button onClick={() => update({ sound: !prefs.sound })} className={prefs.sound ? "toggle-on" : ""}>{prefs.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>Interface sounds</span><i /></button>
        </section>
        <section className="setting-row"><div><h3>Keyboard shortcuts</h3><p>Keep your hands on the keyboard while you work.</p></div><div className="controls"><span className="accent-picker">Ctrl/Cmd K - Commands</span><span className="accent-picker">? - Help</span><span className="accent-picker">Enter - Send</span></div></section>
      </div>
    </div>}
    {palette && <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette"><div className="command-panel"><div className="command-title"><Command size={17} /><input autoFocus placeholder="Type a command" /></div><p>QUICK ACTIONS</p>{[
      ["New chat", () => createNewSession()], ["Choose a model", () => document.querySelector<HTMLButtonElement>("[data-model-trigger]")?.click()], ["Open parameters", () => setSettingsOpen(true)], ["Manage API keys", () => setKeyVaultOpen(true)], ["Toggle sidebar", () => setSidebarOpen(true)], ["Appearance settings", () => setOpen(true)],
    ].map(([label, action]) => <button key={label as string} onClick={() => command(action as () => void)}>{label as string}<span>Enter</span></button>)}</div></div>}
  </>;
}

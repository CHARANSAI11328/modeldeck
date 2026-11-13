import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const origin = process.env.MODELDECK_TEST_URL || "http://localhost:3101";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "modeldeck-design-"));
const debugPort = 10000 + Math.floor(Math.random() * 40000);
const browser = spawn(
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--disable-extensions",
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
let closeBrowser;
const results = [];
const timeout = setTimeout(() => {
  browser.kill();
  process.exit(1);
}, 180000);
try {
  let pages;
  for (let i = 0; i < 60; i++) {
    try {
      pages = await fetch(`http://localhost:${debugPort}/json/list`).then((r) =>
        r.json(),
      );
      if (pages.length) break;
    } catch {}
    await pause(250);
  }
  ws = new WebSocket(pages.find((p) => p.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let counter = 0;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++counter;
      const handler = (e) => {
        const data = JSON.parse(e.data);
        if (data.id === id) {
          ws.removeEventListener("message", handler);
          data.error
            ? reject(new Error(data.error.message))
            : resolve(data.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  closeBrowser = () => send("Browser.close");
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const check = async (label, expression) => {
    const pass = await evaluate(expression);
    results.push({ label, pass: !!pass });
    if (!pass) throw new Error(`FAIL: ${label}`);
  };
  const resize = async (width, height = 900) =>
    send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
  const navigate = async (route, selector) => {
    await send("Page.navigate", { url: origin + route });
    for (let i = 0; i < 160; i++) {
      if (
        await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)
      )
        break;
      await pause(250);
    }
    await pause(1300);
  };
  const shot = async (name) => {
    const r = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`screenshots/${name}.png`, Buffer.from(r.data, "base64"));
  };
  await send("Page.enable");
  await send("Runtime.enable");
  // Keep this test independent of the user's connected credentials.
  await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/vault*" }] });
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.method === "Fetch.requestPaused") {
      void send("Fetch.fulfillRequest", {
        requestId: data.params.requestId,
        responseCode: 200,
        responseHeaders: [{ name: "content-type", value: "application/json" }],
        body: Buffer.from(JSON.stringify({ success: true, keys: {} })).toString(
          "base64",
        ),
      });
    }
  });
  await resize(1440);
  await navigate("/", ".deck-hero");
  await shot("premium-home-desktop");
  await check(
    "Home loads",
    `document.querySelector('h1')?.textContent.includes('possibility')`,
  );
  await shot("premium-home-desktop");
  await evaluate(
    `document.querySelectorAll('.deck-preview-tabs button')[1].click()`,
  );
  await check(
    "Interactive home preview",
    `document.querySelector('.deck-demo-reply h3').textContent.includes('contract')`,
  );
  await evaluate(`document.querySelector('details summary').click()`);
  await check("FAQ expands", `document.querySelector('details').open`);
  await evaluate(`document.querySelector('#workspace').scrollIntoView()`);
  await pause(1100);
  await shot("premium-home-features");
  for (const width of [768, 390, 375, 320]) {
    await resize(width, 844);
    await pause(400);
    await check(
      `Home fits ${width}px`,
      `document.documentElement.scrollWidth <= window.innerWidth`,
    );
  }
  await resize(390, 844);
  await evaluate("window.scrollTo(0,0)");
  await shot("premium-home-mobile");
  await evaluate(`document.querySelector('.deck-menu-toggle').click()`);
  await check(
    "Mobile menu opens",
    `!!document.querySelector('.deck-mobile-nav')`,
  );
  await evaluate(`document.querySelector('.deck-mobile-nav a').click()`);
  await check(
    "Mobile navigation closes",
    `!document.querySelector('.deck-mobile-nav')`,
  );
  await resize(1440);
  await navigate("/playground", ".deck-welcome");
  await shot("premium-chat-desktop");
  await check(
    "Composer starts disabled",
    `document.querySelector('.deck-send').disabled`,
  );
  await evaluate(`document.querySelector('.deck-suggestions button').click()`);
  await check(
    "Suggestion creates editable draft",
    `document.querySelector('.deck-composer textarea').value.includes('TypeScript') && document.activeElement.tagName === 'TEXTAREA'`,
  );
  await evaluate(
    `document.querySelector('.deck-send').focus();document.querySelector('.deck-send').click()`,
  );
  await pause(500);
  await check(
    "Missing key opens vault",
    `!!document.querySelector('[role="dialog"]')`,
  );
  await check(
    "Missing key preserves draft",
    `document.querySelector('.deck-composer textarea').value.includes('TypeScript')`,
  );
  await shot("premium-vault-desktop");
  await evaluate(
    `document.querySelector('[aria-label="Close API Key Vault"]').click()`,
  );
  await check(
    "Vault restores keyboard focus",
    `document.activeElement.classList.contains('deck-send')`,
  );
  await evaluate(`document.querySelector('.deck-new-chat').click()`);
  await check(
    "New conversation has fresh draft",
    `document.querySelector('.deck-composer textarea').value === ''`,
  );
  await evaluate(
    `document.querySelectorAll('.deck-session>button:first-child')[1].click()`,
  );
  await check(
    "Switch restores draft",
    `document.querySelector('.deck-composer textarea').value.includes('TypeScript')`,
  );
  await evaluate(`document.querySelector('[data-model-trigger]').click()`);
  await pause(400);
  await shot("premium-model-picker");
  await check(
    "Model picker opens",
    `document.querySelector('[data-model-trigger]').getAttribute('aria-expanded') === 'true'`,
  );
  await evaluate(
    `document.querySelector('[data-model-trigger]').click();document.querySelector('[aria-label="Model settings"]').click()`,
  );
  await check(
    "Settings opens",
    `!!document.querySelector('#parameters-drawer-title')`,
  );
  await evaluate(
    `document.querySelector('[aria-label="Close parameters drawer"]').click()`,
  );
  await evaluate(`document.querySelector('[data-model-trigger]').click()`);
  await evaluate(
    `(() => { const input=document.querySelector('[aria-label="Search models"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Local Model'); input.dispatchEvent(new Event('input',{bubbles:true})); })()`,
  );
  await pause(250);
  await check(
    "Model search filters results",
    `document.querySelector('[aria-label="Choose a model"]').textContent.includes('Local Model (Default)')`,
  );
  await evaluate(
    `Array.from(document.querySelectorAll('[aria-label="Choose a model"] button')).find(b=>b.textContent.includes('Local Model (Default)')).click()`,
  );
  await check(
    "Model selection updates composer",
    `document.querySelector('.deck-composer-model').textContent.includes('Local Model')`,
  );
  // Stub only the local model request. No provider call, credentials, or billing.
  await evaluate(
    `(() => {const original=window.fetch.bind(window);window.fetch=(url,options)=>{if(String(url)!=='/api/proxy')return original(url,options);const encoder=new TextEncoder();const chunks=['Here is a thoughtful starting point.\\n\\n','## Keep it simple\\n\\n','1. Start with the person you are helping.\\n2. Build the smallest useful version.\\n3. Test what matters.\\n\\n','You can refine the details as you learn.'];return Promise.resolve(new Response(new ReadableStream({start(controller){let i=0;const timer=setInterval(()=>{if(options.signal?.aborted){clearInterval(timer);controller.close();return;}if(i<chunks.length){controller.enqueue(encoder.encode('data: '+JSON.stringify({choices:[{delta:{content:chunks[i++]}}]})+'\\n\\n'));}else{controller.enqueue(encoder.encode('data: [DONE]\\n\\n'));clearInterval(timer);controller.close();}},250);}}),{headers:{'content-type':'text/event-stream'}}));};})()`,
  );
  await evaluate(`document.querySelector('.deck-send').click()`);
  await pause(350);
  await check(
    "Streaming exposes stop control",
    `!!document.querySelector('[aria-label="Stop generation"]')`,
  );
  await pause(1500);
  await check(
    "Streamed response renders",
    `document.querySelector('.response-deck').textContent.includes('Keep it simple')`,
  );
  await check(
    "Completed response supports retry",
    `!!document.querySelector('[aria-label="Regenerate response"]')`,
  );
  await shot("premium-conversation-desktop");
  for (const width of [768, 390, 375, 320]) {
    await resize(width, 844);
    await pause(250);
    if (width < 768)
      await evaluate(
        `document.querySelector('[aria-label="Close sidebar"]')?.click()`,
      );
    await check(
      `Chat fits ${width}px`,
      `document.documentElement.scrollWidth <= window.innerWidth`,
    );
  }
  await resize(390, 844);
  await shot("premium-chat-mobile");
  await evaluate(
    `document.querySelector('[aria-label="Toggle sidebar"]').click()`,
  );
  await check(
    "Mobile history drawer opens",
    `!!document.querySelector('.deck-sidebar')`,
  );
  await shot("premium-sidebar-mobile");
  await evaluate(
    `document.querySelector('[aria-label="Close sidebar"]').click()`,
  );
  await evaluate(
    `document.querySelector('[aria-label="Regenerate response"]').click()`,
  );
  await pause(300);
  await evaluate(
    `document.querySelector('[aria-label="Stop generation"]').click()`,
  );
  await pause(500);
  await check(
    "Stop ends generation",
    `!document.querySelector('[aria-label="Stop generation"]')`,
  );
  await evaluate(
    `document.querySelector('[aria-label="Toggle sidebar"]').click()`,
  );
  await evaluate(`document.querySelector('.deck-new-chat').click()`);
  await pause(400);
  await shot("premium-chat-mobile");
  await navigate("/studio", "header");
  await pause(1200);
  await check(
    "Studio fits phone",
    `document.documentElement.scrollWidth <= window.innerWidth`,
  );
  await shot("premium-studio-mobile");
  fs.writeFileSync(
    "screenshots/design-verification.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  clearTimeout(timeout);
  await Promise.race([closeBrowser?.().catch(() => {}), pause(1500)]);
  ws?.close();
  browser.kill();
}

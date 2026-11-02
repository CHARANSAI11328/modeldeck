import { spawn } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const outputPath = args[0] || "H:\\RESEARCH\\screenshots\\test.png";
const width = parseInt(args[1] || "375", 10);
const height = parseInt(args[2] || "812", 10);
const isMobile = width < 768;

const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
  "--headless=new",
  "--remote-debugging-port=9222",
  "--user-data-dir=C:\\Users\\hplap\\AppData\\Local\\Temp\\edge_cdp_cap",
  "http://localhost:3000"
]);

const timeout = setTimeout(() => {
  console.error("Timeout");
  edge.kill();
  process.exit(1);
}, 10000);

async function run() {
  await new Promise((r) => setTimeout(r, 1500));
  const list = await fetch("http://localhost:9222/json/list").then((r) => r.json());
  const page = list.find((p) => p.url.includes("localhost:3000"));
  if (!page) throw new Error("Page not found");

  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener("message", handler);
          resolve(data.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await new Promise((resolve) => (ws.onopen = resolve));

  // Enable Page & Emulation
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: isMobile,
    screenOrientation: { angle: 0, type: "portraitPrimary" },
  });

  // Wait 1 second for layout & React state to settle
  await new Promise((r) => setTimeout(r, 1000));

  const result = await send("Page.captureScreenshot", {
    format: "png",
  });

  fs.writeFileSync(outputPath, Buffer.from(result.data, "base64"));
  console.log(`Saved screenshot to ${outputPath} (${width}x${height}, mobile: ${isMobile})`);

  clearTimeout(timeout);
  ws.close();
  edge.kill();
}

run().catch((e) => {
  console.error(e);
  clearTimeout(timeout);
  edge.kill();
  process.exit(1);
});

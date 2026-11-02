import { spawn } from "node:child_process";
import fs from "node:fs";

const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
  "--headless=new",
  "--remote-debugging-port=9222",
  "--user-data-dir=C:\\Users\\hplap\\AppData\\Local\\Temp\\edge_cdp_cap2",
  "http://localhost:3000"
]);

async function run() {
  await new Promise((r) => setTimeout(r, 1500));
  const list = await fetch("http://localhost:9222/json/list").then((r) => r.json());
  const page = list.find((p) => p.url.includes("localhost:3000"));

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

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { angle: 0, type: "portraitPrimary" },
  });

  await new Promise((r) => setTimeout(r, 600));

  // Click hamburger button to open slide-over drawer
  await send("Runtime.evaluate", {
    expression: 'document.querySelector("button[title=\'Toggle sidebar\']").click()',
  });

  await new Promise((r) => setTimeout(r, 600));

  const result = await send("Page.captureScreenshot", {
    format: "png",
  });

  fs.writeFileSync("H:\\RESEARCH\\screenshots\\after-task4-drawer-375px.png", Buffer.from(result.data, "base64"));
  console.log("Saved mobile drawer screenshot!");

  ws.close();
  edge.kill();
}

run().catch((e) => {
  console.error(e);
  edge.kill();
});

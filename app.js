const mineflayer = require("mineflayer");

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const isIgnorableSkinJsonError = (err) => {
  const message = err?.message || "";
  const stack = err?.stack || "";
  return (
    message.includes("is not valid JSON") &&
    stack.includes("extractSkinInformation")
  );
};

process.on("uncaughtException", (err) => {
  if (isIgnorableSkinJsonError(err)) {
    console.warn("Ignored malformed skin JSON from server packet.");
    return;
  }
  console.error("Fatal uncaught exception:", err);
  process.exit(1);
});

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value || !value.trim()) fail(`Missing required env var: ${name}`);
  return value.trim();
};

const parseBool = (value, fallback = false) => {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const parseIntEnv = (name, fallback, { min, max } = {}) => {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    console.warn(`Invalid ${name}="${raw}", using default ${fallback}.`);
    return fallback;
  }
  if (min != null && parsed < min) {
    console.warn(`${name}=${parsed} is below ${min}, using default ${fallback}.`);
    return fallback;
  }
  if (max != null && parsed > max) {
    console.warn(`${name}=${parsed} is above ${max}, using default ${fallback}.`);
    return fallback;
  }
  return parsed;
};

if (process.env.MC_PASSWORD) {
  console.warn("MC_PASSWORD is set but ignored.");
}

const auth = (process.env.MC_AUTH || "microsoft").trim();
if (!["microsoft", "offline"].includes(auth)) {
  fail(`Invalid MC_AUTH="${auth}". Allowed values: microsoft, offline.`);
}

const config = {
  host: requiredEnv("MC_HOST"),
  port: parseIntEnv("MC_PORT", 25565, { min: 1, max: 65535 }),
  username: requiredEnv("MC_USERNAME"),
  auth,
  version: process.env.MC_VERSION?.trim() || false,
  commandOnJoin: process.env.MC_COMMAND_ON_JOIN?.trim() || "",
  commandDelayMs: parseIntEnv("MC_COMMAND_DELAY_MS", 1000, { min: 0 }),
  enableViewer: parseBool(process.env.MC_ENABLE_VIEWER, false),
  viewerPort: parseIntEnv("MC_VIEWER_PORT", 3007, { min: 1, max: 65535 }),
  viewerFirstPerson: parseBool(process.env.MC_VIEWER_FIRST_PERSON, true),
  viewerAfterCommandDelayMs: parseIntEnv("MC_VIEWER_AFTER_COMMAND_DELAY_MS", 5000, { min: 0 }),
  viewerStartDelayMs: parseIntEnv("MC_VIEWER_START_DELAY_MS", 0, { min: 0 })
};

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  auth: config.auth,
  version: config.version
});

bot.once("spawn", () => {
  console.log("Bot spawned and connected.");

  const startViewer = () => {
    if (!config.enableViewer) return;

    try {
      const { mineflayer: mineflayerViewer } = require("prismarine-viewer");
      mineflayerViewer(bot, {
        port: config.viewerPort,
        firstPerson: config.viewerFirstPerson
      });
      console.log(`Viewer enabled at http://0.0.0.0:${config.viewerPort}`);
    } catch (err) {
      console.error("Failed to start viewer:", err);
    }
  };

  const startViewerAfter = (delayMs) => {
    if (delayMs <= 0) return startViewer();
    console.log(`Starting viewer in ${delayMs}ms...`);
    setTimeout(startViewer, delayMs);
  };

  if (config.commandOnJoin) {
    setTimeout(() => {
      console.log(`Running command on join: ${config.commandOnJoin}`);
      bot.chat(config.commandOnJoin);
      startViewerAfter(config.viewerAfterCommandDelayMs);
    }, config.commandDelayMs);
    return;
  }

  startViewerAfter(config.viewerStartDelayMs);
});

bot.on("kicked", (reason) => {
  console.error("Kicked:", reason);
});

bot.on("error", (err) => {
  console.error("Error:", err);
});

bot.on("end", () => {
  console.log("Disconnected.");
});

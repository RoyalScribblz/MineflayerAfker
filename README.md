# MineflayerAfker

Simple Mineflayer bot that:
- Joins a server from env vars
- Optionally runs a command after spawn
- Optionally starts a browser viewer (`prismarine-viewer`)

## Env vars

- `MC_HOST` (required): Server hostname/IP.
- `MC_PORT` (optional, default `25565`): Server port.
- `MC_USERNAME` (required): Bot username/account identifier.
- `MC_AUTH` (optional, default `microsoft`): `offline` or `microsoft`.
- `MC_VERSION` (optional): Specific MC version (example `1.20.4`); auto-detect if omitted.
- `MC_PASSWORD`: Ignored if set.
- `MC_COMMAND_ON_JOIN` (optional): Command to send once after spawn (example `/register pass pass`).
- `MC_COMMAND_DELAY_MS` (optional, default `1000`): Delay before running `MC_COMMAND_ON_JOIN`.
- `MC_ENABLE_VIEWER` (optional, default `false`): `true` to enable viewer.
- `MC_VIEWER_PORT` (optional, default `3007`): Viewer web port.
- `MC_VIEWER_FIRST_PERSON` (optional, default `true`): Viewer first-person mode.
- `MC_VIEWER_AFTER_COMMAND_DELAY_MS` (optional, default `5000`): Delay after sending `MC_COMMAND_ON_JOIN` before starting viewer.
- `MC_VIEWER_START_DELAY_MS` (optional, default `0`): Delay before starting viewer when no join command is configured.

Validation notes:
- `MC_AUTH` must be `microsoft` or `offline`.
- Invalid numeric values fall back to defaults.
- Delay values are clamped by validation to non-negative numbers.

## Local run

```powershell
npm install
$env:MC_HOST="play.example.com"
$env:MC_USERNAME="AfkBot"
node app.js
```

## Docker run

```powershell
docker build -t mineflayer-afker .
docker run --rm -it `
  -e MC_HOST=play.example.com `
  -e MC_USERNAME=AfkBot `
  -e MC_ENABLE_VIEWER=true `
  -p 3007:3007 `
  mineflayer-afker
```

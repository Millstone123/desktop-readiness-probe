# Desktop Readiness Probe

A small macOS utility for checking that the current interactive desktop session can launch an application by bundle identifier. It is useful as a local UI-environment smoke check before running interactive desktop tests.

## Setup

```bash
npm install
npm run setup
```

The setup command reads `probe.config.json` and asks LaunchServices to open the configured bundle. Edit `targetBundleId` to probe the application used by your own test environment.

## Tests

```bash
npm test
```

The tests exercise configuration validation and the LaunchServices invocation without launching a GUI application.

## Configuration

- `targetBundleId` — macOS bundle identifier to open through `/usr/bin/open`; the default is defined in `probe.config.json`.
- `launchTimeoutMilliseconds` — maximum time to wait for the launch request.

## License

MIT

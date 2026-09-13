import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import process from 'node:process';

export function loadConfiguration(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('probe.config.json is not valid JSON');
  }
  if (typeof parsed.targetBundleId !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(parsed.targetBundleId)) {
    throw new Error('targetBundleId must be a macOS bundle identifier');
  }
  if (!Number.isInteger(parsed.launchTimeoutMilliseconds) || parsed.launchTimeoutMilliseconds < 1) {
    throw new Error('launchTimeoutMilliseconds must be a positive integer');
  }
  return parsed;
}

export function launchDesktopApplication(configuration, opener = execFile) {
  return new Promise((resolve, reject) => {
    opener('/usr/bin/open', ['-b', configuration.targetBundleId], { timeout: configuration.launchTimeoutMilliseconds }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

export async function main(options = {}) {
  const configFile = options.configFile ?? new URL('../probe.config.json', import.meta.url);
  const raw = await readFile(configFile, 'utf8');
  const configuration = loadConfiguration(raw);
  await launchDesktopApplication(configuration, options.opener);
  return configuration.targetBundleId;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().then((bundleId) => {
    console.log(`Desktop application ready: ${bundleId}`);
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

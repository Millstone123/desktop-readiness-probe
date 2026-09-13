import assert from 'node:assert/strict';
import { test } from 'node:test';
import { launchDesktopApplication, loadConfiguration, main } from '../src/main.js';

test('launches the configured desktop bundle', async () => {
  let observed;
  await launchDesktopApplication(
    { targetBundleId: 'example.probe', launchTimeoutMilliseconds: 25 },
    (executable, args, options, callback) => {
      observed = { executable, args, options };
      callback(null, '', '');
    },
  );
  assert.equal(observed.executable, '/usr/bin/open');
  assert.deepEqual(observed.args, ['-b', 'example.probe']);
  assert.equal(observed.options.timeout, 25);
});

test('main reads and validates the project configuration', async () => {
  const calls = [];
  const bundleId = await main({
    configFile: new URL('../probe.config.json', import.meta.url),
    opener: (executable, args, options, callback) => {
      calls.push([executable, ...args]);
      callback(null, '', '');
    },
  });
  assert.equal(bundleId, 'com.apple.calculator');
  assert.deepEqual(calls, [['/usr/bin/open', '-b', 'com.apple.calculator']]);
});

test('invalid bundle identifiers are rejected before launch', () => {
  assert.throws(() => loadConfiguration('{"targetBundleId":"bad bundle","launchTimeoutMilliseconds":5}'), /bundle identifier/);
});

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const appPath = process.argv[2];
if (!appPath) throw new Error('Pass the downloaded simulator .app path.');
const artifacts = 'ios-artifacts';
mkdirSync(`${artifacts}/screenshots`, { recursive: true });

function run(command, args) {
  return execFileSync(command, args, { stdio: 'inherit', timeout: 600000 });
}
const catalog = JSON.parse(execFileSync('xcrun', ['simctl', 'list', '-j'], { encoding: 'utf8' }));
const runtime = catalog.runtimes.filter(item => item.isAvailable && item.identifier.includes('.iOS-'))
  .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
const deviceType = catalog.devicetypes.find(item => item.name === 'iPhone 13 Pro Max')
  || catalog.devicetypes.find(item => item.name === 'iPhone 16 Plus');
if (!runtime || !deviceType) throw new Error('A supported iPhone simulator is unavailable.');
const deviceId = execFileSync('xcrun', ['simctl', 'create', 'PayPlace App Store Screenshots', deviceType.identifier, runtime.identifier], { encoding: 'utf8' }).trim();
writeFileSync(`${artifacts}/device.json`, JSON.stringify({ device: deviceType.name, runtime: runtime.version, deviceId }, null, 2));

try {
  run('xcrun', ['simctl', 'boot', deviceId]);
  run('xcrun', ['simctl', 'bootstatus', deviceId, '-b']);
  run('xcrun', ['simctl', 'status_bar', deviceId, 'override', '--time', '9:41', '--batteryState', 'charged', '--batteryLevel', '100']);
  run('xcrun', ['simctl', 'install', deviceId, appPath]);
  run('maestro', ['--device', deviceId, 'test', '--format', 'junit', '--output', `${artifacts}/report.xml`, '--test-output-dir', `${artifacts}/screenshots`, 'maestro/store-screenshots.yml']);
  writeFileSync(`${artifacts}/result.json`, JSON.stringify({ passed: true }, null, 2));
} catch (error) {
  writeFileSync(`${artifacts}/result.json`, JSON.stringify({ passed: false, message: error.message }, null, 2));
  try { run('xcrun', ['simctl', 'io', deviceId, 'screenshot', `${artifacts}/failure.png`]); } catch {}
  throw error;
} finally {
  try { run('xcrun', ['simctl', 'shutdown', deviceId]); } catch {}
}

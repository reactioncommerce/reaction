// Assumes Node 8.x
import _ from "lodash";
import childProcess from "child_process";
import Log from "./logger";
import loadPlugins from "./loadPlugins";
import loadStyles from "./loadStyles";
import provisionAssets from "./provisionAssets";

function run(yargs) {
  let start, sec, ns;

  start = process.hrtime();
  Log.info('Setting up plugin imports...\n');
  loadPlugins();
  [sec, ns] = process.hrtime(start);
  Log.info(`Setting up plugin imports took ${sec}s ${ns/1000000}ms\n`);

  start = process.hrtime();
  Log.info('Setting up style imports...\n');
  loadStyles();
  [sec, ns] = process.hrtime(start);
  Log.info(`Setting up style imports took ${sec}s ${ns/1000000}ms\n`);

  start = process.hrtime();
  Log.info('Provisioning assets...\n');
  provisionAssets();
  [sec, ns] = process.hrtime(start);
  Log.info(`Provisioning assets took ${sec}s ${ns/1000000}ms\n`);

  let cmd = 'meteor run --no-lint --no-release-check --raw-logs';
  Log.info(`Running command: ${cmd}`);
  cmd = `REACTION_METEOR_APP_COMMAND_START_TIME=${Date.now()} ${cmd}`;

  try {
    childProcess.execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    Log.default(err);
    Log.error('\nError: App failed to start');
    process.exit(1);
  }
}

run();

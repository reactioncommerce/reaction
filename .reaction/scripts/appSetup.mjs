import Log from "./logger.mjs";
import loadPlugins from "./loadPlugins.mjs";
import loadStyles from "./loadStyles.mjs";
import provisionAssets from "./provisionAssets.mjs";

export default function appSetup() {
  let start, sec, ns;

  start = process.hrtime();
  Log.info("Setting up plugin imports...\n");
  loadPlugins();
  [sec, ns] = process.hrtime(start);
  Log.info(`Setting up plugin imports took ${sec}s ${ns / 1000000}ms\n`);

  start = process.hrtime();
  Log.info("Setting up style imports...\n");
  loadStyles();
  [sec, ns] = process.hrtime(start);
  Log.info(`Setting up style imports took ${sec}s ${ns / 1000000}ms\n`);

  start = process.hrtime();
  Log.info("Provisioning assets...\n");
  provisionAssets();
  [sec, ns] = process.hrtime(start);
  Log.info(`Provisioning assets took ${sec}s ${ns / 1000000}ms\n`);
}

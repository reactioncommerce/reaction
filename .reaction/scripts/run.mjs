// Assumes Node 8.x
import _ from "lodash";
import childProcess from "child_process";
import Log from "./logger.mjs";
import appSetup from "./appSetup.mjs";

function run() {
  appSetup();

  // Whatever debugging-related command line arguments were passed in to
  // the first node process, forward them along through meteor
  const inspect = process.argv
    .filter((arg) => arg.startsWith("--inspect"))
    .join(" ");
  let cmd = `meteor run --no-lint --no-release-check --raw-logs ${inspect}`;

  Log.info(`Running command: ${cmd}`);
  cmd = `REACTION_METEOR_APP_COMMAND_START_TIME=${Date.now()} ${cmd}`;

  try {
    childProcess.execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    Log.default(err);
    Log.error("\nError: App failed to start");
    process.exit(1);
  }
}

run();

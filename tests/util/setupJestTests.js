/* eslint-disable no-undef */

require("../../src/checkNodeVersion.js");
require("./testEnvVars.js");

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:", err); // eslint-disable-line no-console
  process.exit(10); // eslint-disable-line no-process-exit
});

/* eslint-disable no-undef */
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const jestProcessEnv = require("./jestProcessEnv.json");

process.env = Object.assign(process.env, {
  ...jestProcessEnv
});

process.on("unhandledRejection", (err) => {
  throw err;
});
